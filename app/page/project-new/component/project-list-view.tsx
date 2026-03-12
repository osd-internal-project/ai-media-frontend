import React, { useState } from "react";
import { Button, Dropdown, Row, Table } from "antd";
import {
  TeamOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { IProject } from "@/app/common/project.type";
import useResponsive from "@/app/hooks/useResponsive";
import Quata from "./quata";

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

const ProjectListView: React.FC<ProjectListViewProps> = ({ projects, semantic, organizationRole, onClickProject, formatDate, canCreateProjects, projectActionItems = [], onClickProjectAction }) => {
  const { isMobile } = useResponsive();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  return (
      <Row style={{ padding: isMobile ? "16px" : "24px", margin: 0, width: "100%" }}>
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
                width: '100%',
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid ${semantic.colorBorder}`,
                background: semantic.colorBgContainer,
              }}
              onRow={record => ({
                onClick: () => onClickProject(record.id),
                style: { cursor: 'pointer' },
                onMouseEnter: () => setHoveredRowId(record.id),
                onMouseLeave: () => setHoveredRowId(null),
              })}
              columns={[
                {
                  title: <span style={{ display: 'inline-block', marginLeft: isMobile ? 8 : 24 }}>Project</span>,
                  dataIndex: 'name',
                  key: 'name',
                  render: (text: string, record: IProject) => (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 8 : 12, flexDirection: 'row' }}>
                      <FolderOpenOutlined style={{ color: semantic.colorPrimary, fontSize: isMobile ? 16 : 20, marginTop: isMobile ? 1 : 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8 }}>
                          <span style={{ fontWeight: 600, fontSize: isMobile ? 13 : 16, color: semantic.colorTextBase, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{text}</span>
                          {record.status === 'deleted' ? (
                            <span style={{ width: isMobile ? 8 : 10, height: isMobile ? 8 : 10, background: semantic.colorError, borderRadius: '50%', display: 'inline-block', marginLeft: 6 }}></span>
                          ) : (
                            <span style={{ width: isMobile ? 8 : 10, height: isMobile ? 8 : 10, background: semantic.colorSuccess, borderRadius: '50%', display: 'inline-block', marginLeft: 6 }}></span>
                          )}
                        </div>
                        <div style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 11 : 13, marginTop: 2, lineHeight: 1.2, whiteSpace: 'normal', wordBreak: 'break-word' }}>{record.description || 'No description provided'}</div>
                      </div>
                    </div>
                  ),
                  width: isMobile ? '20%' : '70%',
                },
                {
                  title: 'Members',
                  dataIndex: 'members',
                  key: 'members',
                  align: 'center',
                  render: (members: any[]) => (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <TeamOutlined style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 13 : 16 }} />
                      {members?.length || 0}
                    </span>
                  ),
                  width: isMobile ? 68 : 100,
                },
                {
                  title: 'Quota',
                  key: 'quota',
                  align: 'center',
                  render: (_: any, record: IProject) => {
                    const imageUsed = (record.accessImageAmount ?? 0) - (record.remainImageAmount ?? 0);
                    const imageTotal = record.accessImageAmount ?? 0;
                    return (
                      <div style={{ minWidth: isMobile ? 98 : 120, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                        <Quata
                          creditUsed={imageUsed}
                          creditTotal={imageTotal}
                          semantic={semantic}
                          size={"small" }
                        />
                      </div>
                    );
                  },
                  width: isMobile ? 150 : 200,
                },
                {
                  title: 'Updated',
                  key: 'updated',
                  align: 'center',
                  render: (_: any, record: IProject) => formatDate(record.updatedAt || record.createdAt),
                  width: 140,
                  responsive: ['sm'],
                },
                {
                  title: '',
                  key: 'action',
                  align: 'center',
                  width: 60,
                  render: (_: any, record: IProject) => (
                    canCreateProjects(organizationRole) && projectActionItems.length > 0 && onClickProjectAction ? (
                      <Dropdown
                        disabled={record.status === 'deleted'}
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
                          className="!h-auto flex items-center text-gray-400 hover:text-white hover:bg-gray-700 !px-2 !py-2 sm:!px-3 sm:!py-2"
                          type="text"
                          icon={<MoreOutlined style={{ fontSize: 18 }} />}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            opacity: isMobile || hoveredRowId === record.id ? 1 : 0,
                            pointerEvents:
                              isMobile || hoveredRowId === record.id
                                ? "auto"
                                : "none",
                            transition: "opacity 0.15s ease",
                          }}
                        />
                      </Dropdown>
                    ) : null
                  ),
                },
              ]}
            />
          </Row>
  );
};

export default ProjectListView;
