"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Segmented, Skeleton, message, theme } from "antd";
import { LayoutGrid, List, Plus, RotateCw, Search, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TPlan } from "@/app/common/plan.type";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import PlanServices from "@/app/services/plan.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { PlanFormModal } from "./components/PlanFormModal";
import PlanListView from "./components/plan-list-view";
import PlanGridView from "./components/plan-grid-view";
import PlanMatrixView from "./components/plan-matrix-view";
import { copyPayload } from "./plan-utils";

type ViewType = "grid" | "list" | "matrix";

const planServices = PlanServices(axiosCore);
const modelService = MasterModelTypeServices(axiosCore);

const errorText = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export default function PlanManagementPage() {
  const router = useRouter();
  const { token } = theme.useToken();
  const [data, setData] = useState<TPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [models, setModels] = useState<TMasterModelType[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData((await planServices.findAllFormatted()) || []);
    } catch (error) {
      console.error(error);
      messageApi.error("Could not load plans");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ตารางต้องใช้รายการ model — โหลดเมื่อเปิด view นี้ครั้งแรก
  useEffect(() => {
    if (viewType !== "matrix" || models !== null) return;
    modelService
      .findAll()
      .then(setModels)
      .catch(() => {
        setModels([]);
        messageApi.error("Could not load AI models");
      });
  }, [viewType, models, messageApi]);

  const handleCreatePlan = async (values: TPlan) => {
    setModalLoading(true);
    try {
      const newPlan = await planServices.create(values);
      if (newPlan) {
        messageApi.success("Plan created");
        setIsModalOpen(false);
        router.push(`/page/admin-management/plan-management/${newPlan.id}`);
      }
    } catch (error) {
      messageApi.error(errorText(error, "Could not create the plan"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    const success = await planServices.delete(id);
    if (success) {
      messageApi.success("Plan deleted");
      fetchData();
    } else {
      messageApi.error("Could not delete the plan");
    }
  };

  /** สำเนาเป็น draft (status=false, ไม่ใช่ค่าเริ่มต้น) แล้วเปิดหน้าแก้ */
  const handleClone = async (plan: TPlan) => {
    setCloningId(plan.id);
    try {
      const full = await planServices.findById(plan.id);
      if (!full) throw new Error("Plan not found");
      const created = await planServices.create(copyPayload(full, data.map((item) => item.name)));
      if (!created?.id) throw new Error("No id returned");
      messageApi.success(`Created ${created.name} as a draft`);
      router.push(`/page/admin-management/plan-management/${created.id}`);
    } catch (error) {
      messageApi.error(errorText(error, `Could not duplicate ${plan.name}`));
    } finally {
      setCloningId(null);
    }
  };

  const search = searchText.toLowerCase();
  const filteredData = data.filter(
    (item) => item.name.toLowerCase().includes(search) || item.description?.toLowerCase().includes(search),
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {contextHolder}

      <PlanFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleCreatePlan}
        loading={modalLoading}
      />

      <header className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-semibold" style={{ color: token.colorTextBase }}>Plans</h1>
        {viewType !== "matrix" && (
          <Input
            allowClear
            className="!w-full sm:!w-64"
            placeholder="Search plans"
            prefix={<Search size={14} style={{ color: token.colorTextSecondary }} />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search plans"
          />
        )}
        <Segmented<ViewType>
          value={viewType}
          onChange={setViewType}
          options={[
            { value: "grid", icon: <LayoutGrid size={14} />, title: "Cards" },
            { value: "list", icon: <List size={14} />, title: "List" },
            { value: "matrix", label: "Access & models", icon: <Table2 size={14} /> },
          ]}
        />
        <Button icon={<RotateCw size={14} />} aria-label="Reload plans" onClick={fetchData} loading={loading} />
        <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
          Create plan
        </Button>
      </header>

      {viewType === "grid" && (
        <PlanGridView
          loading={loading}
          filteredData={filteredData}
          handleDeletePlan={handleDeletePlan}
          onRefresh={fetchData}
          onClone={handleClone}
          cloningId={cloningId}
        />
      )}
      {viewType === "list" && (
        <PlanListView
          loading={loading}
          filteredData={filteredData}
          handleDeletePlan={handleDeletePlan}
          onClone={handleClone}
          cloningId={cloningId}
        />
      )}
      {/* ตารางรับ data ทั้งหมด (ไม่กรอง) เพื่อให้ draft ไม่ถูกรีเซ็ตตอนพิมพ์ค้นหา */}
      {viewType === "matrix" &&
        (loading && data.length === 0 ? (
          <Skeleton active />
        ) : (
          <PlanMatrixView plans={data} models={models} onSaved={fetchData} />
        ))}
    </div>
  );
}
