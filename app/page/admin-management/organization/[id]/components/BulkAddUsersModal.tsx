import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import { DeleteOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { isAxiosError } from "axios";
import OrganizationService from "@/app/services/organization.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { downloadCsv, parseCsv } from "@/app/utils/csv";
import {
  BulkRowStatus,
  IBulkMemberRow,
  IBulkProjectList,
  IBulkRowResult,
  IBulkValidationResult,
} from "@/app/common/organization-member.type";

// ต้องตรงกับ BULK_MAX_ROWS / BULK_CHUNK_SIZE ใน backend (bulk-add-members.dto.ts)
const MAX_ROWS = 1000;
const CHUNK_SIZE = 50;
const ORG_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
const PROJECT_ROLES = ["ADMIN", "USER", "VIEWER"];
const CSV_HEADERS = [
  "username",
  "email",
  "fullname",
  "password",
  "phoneNumber",
  "role",
  "projectId",
  "projectName",
  "projectRole",
  "credit",
] as const;
type CsvHeader = (typeof CSV_HEADERS)[number];

type ProjectMode = "existing" | "new";

interface TableRow {
  key: number;
  username: string;
  email: string;
  fullname: string;
  password: string;
  phoneNumber: string;
  role: string;
  projectMode: ProjectMode;
  projectId: string;
  projectName: string;
  projectRole: string;
  credit: number | null;
  invalidCredit: boolean;
  status?: BulkRowStatus;
  errors: string[];
}

interface BulkAddUsersModalProps {
  open: boolean;
  organizationId: string;
  onClose: () => void;
  onImported: () => void;
}

let nextKey = 1;

const emptyRow = (): TableRow => ({
  key: nextKey++,
  username: "",
  email: "",
  fullname: "",
  password: "",
  phoneNumber: "",
  role: "MEMBER",
  projectMode: "existing",
  projectId: "",
  projectName: "",
  projectRole: "USER",
  credit: null,
  invalidCredit: false,
  errors: [],
});

const projectKey = (name: string) => name.trim().toLowerCase();

const hasProject = (row: TableRow) =>
  row.projectMode === "existing" ? !!row.projectId : !!row.projectName.trim();

const toPayload = (row: TableRow): IBulkMemberRow => {
  const withProject = hasProject(row);
  return {
    username: row.username.trim(),
    email: row.email.trim(),
    fullname: row.fullname.trim(),
    password: row.password || undefined,
    phoneNumber: row.phoneNumber.trim() || undefined,
    role: row.role,
    projectId:
      row.projectMode === "existing" && row.projectId ? row.projectId : undefined,
    projectName:
      row.projectMode === "new" && row.projectName.trim()
        ? row.projectName.trim()
        : undefined,
    projectRole: withProject ? row.projectRole : undefined,
    credit: withProject && row.credit !== null ? row.credit : undefined,
  };
};

/** แปลง CSV เป็นแถวในตาราง — คืน error เมื่อ header ขาด column ที่ต้องมี */
const rowsFromCsv = (text: string): { rows: TableRow[]; error?: string } => {
  const [header, ...lines] = parseCsv(text);
  if (!header) return { rows: [], error: "The file is empty" };

  const columnOf = new Map<CsvHeader, number>();
  header.forEach((name, index) => {
    const match = CSV_HEADERS.find(
      (h) => h.toLowerCase() === name.trim().toLowerCase(),
    );
    if (match) columnOf.set(match, index);
  });
  const missing = (["username", "email"] as CsvHeader[]).filter(
    (h) => !columnOf.has(h),
  );
  if (missing.length) {
    return { rows: [], error: `Missing column(s): ${missing.join(", ")}` };
  }

  const rows = lines.map((line) => {
    const get = (h: CsvHeader) => {
      const index = columnOf.get(h);
      return index === undefined ? "" : (line[index] ?? "").trim();
    };
    const creditText = get("credit");
    const credit = creditText === "" ? null : Number(creditText);
    const projectId = get("projectId");
    const projectName = get("projectName");
    return {
      ...emptyRow(),
      username: get("username"),
      email: get("email"),
      fullname: get("fullname"),
      password: get("password"),
      phoneNumber: get("phoneNumber"),
      role: get("role").toUpperCase() || "MEMBER",
      projectMode: (projectName && !projectId ? "new" : "existing") as ProjectMode,
      projectId,
      projectName,
      projectRole: get("projectRole").toUpperCase() || "USER",
      credit: credit !== null && Number.isFinite(credit) ? credit : null,
      invalidCredit: credit !== null && !Number.isFinite(credit),
    };
  });
  return { rows };
};

const statusTag = (row: TableRow) => {
  if (row.invalidCredit) {
    return (
      <Tooltip title="Credit must be a number">
        <Tag color="red">Error</Tag>
      </Tooltip>
    );
  }
  if (!row.status) return <Tag>Pending</Tag>;
  if (row.status === "ERROR") {
    return (
      <Tooltip
        title={
          <ul className="list-disc pl-4">
            {row.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        }
      >
        <Tag color="red">Error ({row.errors.length})</Tag>
      </Tooltip>
    );
  }
  return row.status === "NEW_USER" ? (
    <Tag color="green">New user</Tag>
  ) : (
    <Tag color="blue">Existing user</Tag>
  );
};

const errorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }
  return fallback;
};

const BulkAddUsersModal: React.FC<BulkAddUsersModalProps> = ({
  open,
  organizationId,
  onClose,
  onImported,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<TableRow[]>([]);
  const [projectList, setProjectList] = useState<IBulkProjectList>();
  const [batchErrors, setBatchErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>();

  const organizationService = useMemo(() => OrganizationService(axiosUser), []);

  const loadProjects = useCallback(async () => {
    try {
      setProjectList(await organizationService.getBulkProjects(organizationId));
    } catch (error) {
      console.error(error);
      messageApi.error(errorMessage(error, "Failed to load projects"));
    }
  }, [organizationService, organizationId, messageApi]);

  useEffect(() => {
    if (!open) return;
    setRows([emptyRow()]);
    setBatchErrors([]);
    setProgress(undefined);
  }, [open]);

  useEffect(() => {
    if (open) loadProjects();
  }, [open, loadProjects]);

  const updateRow = (key: number, patch: Partial<TableRow>) => {
    // แก้แถวแล้วผล validate เดิมของแถวนั้นใช้ไม่ได้อีก
    setRows((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, ...patch, status: undefined, errors: [] } : r,
      ),
    );
    setBatchErrors([]);
  };

  const removeRow = (key: number) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { rows: imported, error } = rowsFromCsv(String(reader.result ?? ""));
      if (error) {
        messageApi.error(error);
        return;
      }
      if (!imported.length) {
        messageApi.warning("No data rows found in the file");
        return;
      }
      setRows((prev) => {
        // ตัดแถวว่างที่เปิดมาตอนแรกออกก่อน append
        const kept = prev.filter((r) => r.username || r.email || r.fullname);
        if (kept.length + imported.length > MAX_ROWS) {
          messageApi.error(`A table can hold at most ${MAX_ROWS} rows`);
          return prev;
        }
        messageApi.success(`Added ${imported.length} row(s) from ${file.name}`);
        return [...kept, ...imported];
      });
      setBatchErrors([]);
    };
    reader.onerror = () => messageApi.error("Failed to read the file");
    reader.readAsText(file);
    return false;
  };

  const downloadTemplate = () =>
    downloadCsv("bulk-users-template.csv", [
      [...CSV_HEADERS],
      [
        "jdoe",
        "jdoe@example.com",
        "John Doe",
        "Passw0rd!",
        "0812345678",
        "MEMBER",
        "",
        "Marketing",
        "USER",
        1000,
      ],
    ]);

  const applyResults = (results: IBulkRowResult[], base: TableRow[]) => {
    const byIndex = new Map(results.map((r) => [r.rowIndex, r]));
    return base.map((row, index) => {
      const result = byIndex.get(index);
      return result
        ? { ...row, status: result.status, errors: result.errors }
        : row;
    });
  };

  const handleSubmit = async () => {
    const filled = rows.filter(
      (r) => r.username || r.email || r.fullname || r.password,
    );
    if (!filled.length) {
      messageApi.error("Add at least one user");
      return;
    }
    if (filled.some((r) => r.invalidCredit)) {
      messageApi.error("Fix the rows with an invalid credit first");
      return;
    }

    setSubmitting(true);
    setBatchErrors([]);
    const payload = filled.map(toPayload);

    let validation: IBulkValidationResult;
    try {
      validation = await organizationService.validateBulkMembers(
        organizationId,
        payload,
      );
    } catch (error) {
      console.error(error);
      messageApi.error(errorMessage(error, "Failed to validate users"));
      setSubmitting(false);
      return;
    }

    let current = applyResults(validation.rows, filled);
    setRows(current);
    if (!validation.valid) {
      setBatchErrors(validation.errors);
      messageApi.error("Some rows are invalid — nothing was imported");
      setSubmitting(false);
      return;
    }

    const createdProjects = new Map<string, string>();
    const results: IBulkRowResult[] = [];
    let stopped = false;
    setProgress({ done: 0, total: payload.length });

    for (let start = 0; start < payload.length; start += CHUNK_SIZE) {
      const chunkRows = payload
        .slice(start, start + CHUNK_SIZE)
        .map((row, offset) => {
          const id = row.projectName
            ? createdProjects.get(projectKey(row.projectName))
            : undefined;
          // project ใหม่ที่สร้างใน chunk ก่อนหน้า → ส่งเป็น projectId แทน
          return id
            ? { ...row, projectName: undefined, projectId: id, rowIndex: start + offset }
            : { ...row, rowIndex: start + offset };
        });
      const newProjects = validation.credit.newProjects.filter((p) =>
        chunkRows.some(
          (r) => r.projectName && projectKey(r.projectName) === projectKey(p.name),
        ),
      );

      try {
        const response = await organizationService.createBulkMembersChunk(
          organizationId,
          { rows: chunkRows, newProjects },
        );
        response.createdProjects.forEach((p) =>
          createdProjects.set(projectKey(p.name), p.id),
        );
        results.push(...response.results);
        setProgress({
          done: Math.min(start + CHUNK_SIZE, payload.length),
          total: payload.length,
        });
      } catch (error) {
        console.error(error);
        const data = isAxiosError(error) ? error.response?.data : undefined;
        if (Array.isArray(data?.rows)) results.push(...data.rows);
        if (Array.isArray(data?.errors)) setBatchErrors(data.errors);
        messageApi.error(
          errorMessage(error, "Import stopped — the remaining rows were not imported"),
        );
        stopped = true;
        break;
      }
    }

    current = applyResults(results, current);
    const succeeded = new Set(
      results.filter((r) => r.status !== "ERROR").map((r) => r.rowIndex),
    );
    const created = results.filter((r) => r.status === "NEW_USER").length;
    const added = results.filter((r) => r.status === "EXISTING_USER").length;
    const failed = results.filter((r) => r.status === "ERROR").length;

    const processed = new Set(results.map((r) => r.rowIndex));
    // เหลือเฉพาะแถวที่ยังไม่เข้า — แถวที่อ้าง project ใหม่ซึ่งสร้างไปแล้วเปลี่ยนเป็นเลือก project เดิม
    const remaining = current
      .map((row, index) =>
        processed.has(index) ? row : { ...row, status: undefined, errors: [] },
      )
      .filter((_, index) => !succeeded.has(index))
      .map((row) => {
        const id =
          row.projectMode === "new"
            ? createdProjects.get(projectKey(row.projectName))
            : undefined;
        return id
          ? { ...row, projectMode: "existing" as ProjectMode, projectId: id, projectName: "" }
          : row;
      });

    setRows(remaining);
    setSubmitting(false);
    setProgress(undefined);
    if (created || added) onImported();

    if (!remaining.length) {
      messageApi.success(`Imported: ${created} new user(s), ${added} existing user(s)`);
      onClose();
      return;
    }
    if (createdProjects.size) loadProjects();
    if (!stopped || created || added) {
      messageApi.warning(
        `Imported ${created} new, ${added} existing — ${failed} failed, ${remaining.length} row(s) left in the table`,
      );
    }
  };

  const projectOptions = (projectList?.projects ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.limitCreditAllowance - p.assignedCredit} credit left)`,
  }));

  const columns: ColumnsType<TableRow> = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, row) => statusTag(row),
    },
    {
      title: "Username *",
      key: "username",
      width: 150,
      render: (_, row) => (
        <Input
          value={row.username}
          onChange={(e) => updateRow(row.key, { username: e.target.value })}
        />
      ),
    },
    {
      title: "Email *",
      key: "email",
      width: 200,
      render: (_, row) => (
        <Input
          value={row.email}
          onChange={(e) => updateRow(row.key, { email: e.target.value })}
        />
      ),
    },
    {
      title: "Full name",
      key: "fullname",
      width: 160,
      render: (_, row) => (
        <Input
          value={row.fullname}
          onChange={(e) => updateRow(row.key, { fullname: e.target.value })}
        />
      ),
    },
    {
      title: "Password",
      key: "password",
      width: 150,
      render: (_, row) => (
        <Input.Password
          value={row.password}
          placeholder="new users only"
          onChange={(e) => updateRow(row.key, { password: e.target.value })}
        />
      ),
    },
    {
      title: "Phone",
      key: "phoneNumber",
      width: 130,
      render: (_, row) => (
        <Input
          value={row.phoneNumber}
          onChange={(e) => updateRow(row.key, { phoneNumber: e.target.value })}
        />
      ),
    },
    {
      title: "Org role",
      key: "role",
      width: 120,
      render: (_, row) => (
        <Select
          className="w-full"
          value={row.role}
          options={ORG_ROLES.map((r) => ({ value: r, label: r }))}
          onChange={(role) => updateRow(row.key, { role })}
        />
      ),
    },
    {
      title: "Project",
      key: "project",
      width: 300,
      render: (_, row) => (
        <Space.Compact className="w-full">
          <Select<ProjectMode>
            style={{ width: 100 }}
            value={row.projectMode}
            options={[
              { value: "existing", label: "Existing" },
              { value: "new", label: "New" },
            ]}
            onChange={(projectMode) =>
              updateRow(row.key, { projectMode, projectId: "", projectName: "" })
            }
          />
          {row.projectMode === "existing" ? (
            <Select
              className="w-full"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="No project"
              value={row.projectId || undefined}
              options={projectOptions}
              onChange={(projectId?: string) =>
                updateRow(row.key, { projectId: projectId ?? "" })
              }
            />
          ) : (
            <Input
              placeholder="New project name"
              value={row.projectName}
              onChange={(e) => updateRow(row.key, { projectName: e.target.value })}
            />
          )}
        </Space.Compact>
      ),
    },
    {
      title: "Project role",
      key: "projectRole",
      width: 120,
      render: (_, row) => (
        <Select
          className="w-full"
          disabled={!hasProject(row)}
          value={row.projectRole}
          options={PROJECT_ROLES.map((r) => ({ value: r, label: r }))}
          onChange={(projectRole) => updateRow(row.key, { projectRole })}
        />
      ),
    },
    {
      title: "Credit",
      key: "credit",
      width: 120,
      render: (_, row) => (
        <InputNumber
          className="w-full"
          min={0}
          disabled={!hasProject(row)}
          value={row.credit}
          onChange={(credit) =>
            updateRow(row.key, { credit: credit ?? null, invalidCredit: false })
          }
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      fixed: "right",
      render: (_, row) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeRow(row.key)}
        />
      ),
    },
  ];

  const errorCount = rows.filter((r) => r.status === "ERROR" || r.invalidCredit).length;

  return (
    <Modal
      title={<div className="text-lg font-bold">Add Users</div>}
      open={open}
      onCancel={() => !submitting && onClose()}
      closable={!submitting}
      maskClosable={false}
      width="95vw"
      style={{ maxWidth: 1600 }}
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-70">
            {rows.length} row(s)
            {errorCount ? ` · ${errorCount} with errors` : ""}
            {projectList ? ` · organization credit left: ${projectList.creditRemaining}` : ""}
          </span>
          <Space>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={!rows.length}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Space>
        </div>
      }
    >
      {contextHolder}
      <div className="space-y-4 pt-2">
        <Upload.Dragger
          accept=".csv,text/csv"
          multiple={false}
          showUploadList={false}
          beforeUpload={handleFile}
          disabled={submitting}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Drag a CSV file here or click to choose</p>
          <p className="ant-upload-hint">
            Rows are added to the table below — nothing is saved until you press Submit.
          </p>
        </Upload.Dragger>

        <div className="flex justify-between">
          <Button
            icon={<PlusOutlined />}
            disabled={submitting || rows.length >= MAX_ROWS}
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
          >
            Add row
          </Button>
          <Space>
            <Button type="link" onClick={downloadTemplate}>
              Download template CSV
            </Button>
            <Popconfirm
              title="Clear all rows?"
              onConfirm={() => setRows([])}
              disabled={submitting || !rows.length}
            >
              <Button danger disabled={submitting || !rows.length}>
                Clear
              </Button>
            </Popconfirm>
          </Space>
        </div>

        {batchErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            message={batchErrors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          />
        )}

        {progress && (
          <Progress
            percent={Math.round((progress.done / progress.total) * 100)}
            format={() => `${progress.done} / ${progress.total}`}
          />
        )}

        <Table<TableRow>
          dataSource={rows}
          columns={columns}
          rowKey="key"
          size="small"
          scroll={{ x: 1800 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowClassName={(row) =>
            row.status === "ERROR" || row.invalidCredit ? "bg-red-500/10" : ""
          }
        />
      </div>
    </Modal>
  );
};

export default BulkAddUsersModal;
