import React, { useState } from "react";
import { Button, Dropdown, Row, Table } from "antd";
import {
  TeamOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { IProject } from "@/app/common/project.type";
import useResponsive from "@/app/hooks/useResponsive";
import { formatNumber } from "@/app/utils/format";
import { ProjectStatusPill } from "./project-grid-view";

interface ProjectListViewProps {
  projects: IProject[];
  semantic: any;
  organizationRole: any;
  onClickProject: (projectId: string) => void;
  formatDate: (dateString: string) => string;
  canCreateProjects: (role: any) => boolean;
  projectActionItems?: any[];
  onClickProjectAction?: (action: string, project: IProject) => void;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  semantic,
  organizationRole,
  onClickProject,
  formatDate,
  canCreateProjects,
  projectActionItems = [],
  onClickProjectAction,
}) => {
  const { isMobile } = useResponsive();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  return (
    <Row
      style={{ padding: isMobile ? "16px" : "24px", margin: 0, width: "100%" }}
    >
      <Table
        size={isMobile ? "small" : "middle"}
        dataSource={projects}
        rowKey="id"
        pagination={false}
        scroll={{ x: isMobile ? 700 : 960 }}
        components={{
          header: {
            cell: (props: any) => (
              <th
                {...props}
                style={{
                  ...props.style,
                  borderBottom: `1px solid ${semantic.colorBorder}`,
                  background: semantic.colorBgTextActive,
                  color: semantic.colorTextBase,
                  padding: isMobile ? "8px 8px" : props.style?.padding,
                  fontSize: isMobile ? 12 : undefined,
                }}
              />
            ),
          },
          body: {
            cell: (props: any) => (
              <td
                {...props}
                style={{
                  ...props.style,
                  borderBottom: `1px solid ${semantic.colorBorder}`,
                  background: semantic.colorBgContainer,
                  padding: isMobile ? "8px 8px" : props.style?.padding,
                }}
              />
            ),
          },
        }}
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${semantic.colorBorder}`,
          background: semantic.colorBgContainer,
        }}
        rowClassName={(record: IProject) =>
          `project-list-row${hoveredRowId === record.id ? " project-list-row-hover" : ""}`
        }
        onRow={(record) => ({
          // Mouse users click anywhere on the row; keyboard users reach the name link, so the row keeps table semantics.
          onClick: () => onClickProject(record.id),
          style: { cursor: "pointer" },
          onMouseEnter: () => setHoveredRowId(record.id),
          onMouseLeave: () => setHoveredRowId(null),
        })}
        columns={[
          {
            title: (
              <span
                style={{
                  display: "inline-block",
                  marginLeft: isMobile ? 8 : 24,
                }}
              >
                Project
              </span>
            ),
            dataIndex: "name",
            key: "name",
            render: (text: string, record: IProject) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: isMobile ? 8 : 12,
                  flexDirection: "row",
                }}
              >
                <FolderOpenOutlined
                  style={{
                    color: semantic.colorTextSecondary,
                    fontSize: isMobile ? 16 : 20,
                    marginTop: isMobile ? 1 : 2,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 6 : 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 16,
                        color: semantic.colorTextBase,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      <a
                      href={`/page/project/${record.id}`}
                      className="project-list-name"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClickProject(record.id);
                      }}
                      style={{ color: "inherit" }}
                    >
                      {text}
                    </a>
                    </span>
                    {/* Same pill as the grid card, so status reads alike in both views. */}
                    <ProjectStatusPill deleted={record.status === "deleted"} semantic={semantic} />
                  </div>
                  {record.description ? (
                    <div
                      style={{
                        color: semantic.colorTextSecondary,
                        fontSize: isMobile ? 11 : 13,
                        marginTop: 2,
                        lineHeight: 1.4,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {record.description}
                    </div>
                  ) : null}
                </div>
              </div>
            ),
            width: isMobile ? "20%" : "70%",
          },
          {
            title: "Members",
            dataIndex: "members",
            key: "members",
            align: "center",
            render: (members: any[]) => (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <TeamOutlined
                  style={{
                    color: semantic.colorTextSecondary,
                    fontSize: isMobile ? 13 : 16,
                  }}
                />
                {members?.length || 0}
              </span>
            ),
            width: isMobile ? 68 : 100,
          },
          {
            title: "Quota",
            key: "quota",
            align: "center",
            render: (_: any, record: IProject) => {
              const creditUsed = record.usedCreditAllowance ?? 0;
              const creditTotal = record.limitCreditAllowance ?? 0;
              const creditLeft = Math.max(0, creditTotal - creditUsed);
              // Below 10% left the line turns warning and says so in words, not colour alone.
              const lowCredit = creditTotal > 0 && creditLeft / creditTotal < 0.1;
              return (
                <div
                  style={{
                    minWidth: isMobile ? 98 : 120,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      color: lowCredit ? semantic.colorWarningText : semantic.colorTextBase,
                    }}
                  >
                    {creditTotal > 0 ? (
                      <>
                        {lowCredit ? "Low · " : ""}
                        {formatNumber(creditLeft)}
                        <span style={{ fontWeight: 400, color: semantic.colorTextSecondary }}>
                          {" "}left of {formatNumber(creditTotal)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 400, color: semantic.colorTextSecondary }}>No credit assigned</span>
                    )}
                  </span>
                  {/* Same bar as the grid: used is grey on the left, what is left is coloured on the right (gold when low). */}
                  <span
                    className="project-credit-bar"
                    role="img"
                    aria-label={`${formatNumber(creditLeft)} of ${formatNumber(creditTotal)} credits left`}
                    style={{ display: "flex", gap: 1, height: 6, marginTop: 4, borderRadius: 999, overflow: "hidden", background: semantic.colorFillSecondary }}
                  >
                    {creditTotal > 0 && creditUsed > 0 ? (
                      <span
                        style={{
                          width: `${Math.max(2, Math.min(100, (creditUsed / creditTotal) * 100))}%`,
                          background: semantic.colorTextSecondary,
                          opacity: 0.55,
                        }}
                      />
                    ) : null}
                    {creditTotal > 0 && creditLeft > 0 ? (
                      <span style={{ flex: 1, background: lowCredit ? semantic.gold : semantic.colorInfoText, opacity: 0.85 }} />
                    ) : null}
                  </span>
                </div>
              );
            },
            width: isMobile ? 150 : 200,
          },
          {
            title: "Updated",
            key: "updated",
            align: "center",
            render: (_: any, record: IProject) => (
              <span style={{ whiteSpace: "nowrap" }}>
                {formatDate(record.updatedAt || record.createdAt)}
              </span>
            ),
            width: 140,
            responsive: ["sm"],
          },
          {
            title: "",
            key: "action",
            align: "center",
            width: 60,
            render: (_: any, record: IProject) =>
              canCreateProjects(organizationRole) &&
              projectActionItems.length > 0 &&
              onClickProjectAction ? (
                <Dropdown
                  disabled={record.status === "deleted"}
                  menu={{
                    items: projectActionItems,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      onClickProjectAction(e.key, record);
                    },
                  }}
                  placement="bottomRight"
                >
                  <Button
                    className="project-list-action-btn !h-auto flex items-center text-[var(--legacy-gray-400)] hover:text-[var(--legacy-ink)] hover:bg-[var(--legacy-hover-gray-700)] !px-2 !py-2 sm:!px-3 sm:!py-2"
                    type="text"
                    aria-label={`Actions for ${record.name}`}
                    icon={<MoreOutlined style={{ fontSize: 18 }} />}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      borderRadius: 10,
                      color: semantic.colorTextSecondary,
                    }}
                  />
                </Dropdown>
              ) : null,
          },
        ]}
      />
      <style>{`
              .project-list-row-hover > td {
                background: ${semantic.colorFillAlter} !important;
                transition: background-color 180ms ease;
              }
              .project-list-name:focus-visible {
                outline: 2px solid ${semantic.colorPrimary};
                outline-offset: 2px;
                border-radius: 4px;
              }
              /* Actions stay reachable on touch screens and by keyboard, not only on hover. */
              .project-list-action-btn {
                opacity: 0;
                transition: opacity 150ms ease;
              }
              .project-list-row:hover .project-list-action-btn,
              .project-list-row:focus-within .project-list-action-btn {
                opacity: 1;
              }
              .project-list-row .project-credit-bar {
                animation: projectListCreditReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
              }
              @keyframes projectListCreditReveal {
                from { clip-path: inset(0 100% 0 0); }
                to { clip-path: inset(0 0 0 0); }
              }
              @media (prefers-reduced-motion: reduce) {
                .project-list-row .project-credit-bar { animation: none; }
              }
              @media (hover: none) {
                .project-list-action-btn {
                  opacity: 1;
                  min-width: 44px;
                  min-height: 44px;
                }
              }
            `}</style>
    </Row>
  );
};

export default ProjectListView;
