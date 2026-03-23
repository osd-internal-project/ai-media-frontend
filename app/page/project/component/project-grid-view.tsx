import React, { useState } from "react";
import { Row, Col, Card, Space, Typography, Tooltip, Badge, Dropdown, Button } from "antd";
import {
  FolderOpenOutlined,
  TeamOutlined,
  CalendarOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { IProject } from "@/app/common/project.type";
import Quata from "./quata";
import useResponsive from "@/app/hooks/useResponsive";

interface ProjectGridViewProps {
  projects: IProject[];
  semantic: any;
  onClickProject: (projectId: string) => void;
  formatDate: (dateString: string) => string;
  showActionMenu?: boolean;
  projectActionItems?: any[];
  onClickProjectAction?: (action: string, project: IProject) => void;
}

const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  projects,
  semantic,
  onClickProject,
  formatDate,
  showActionMenu = false,
  projectActionItems = [],
  onClickProjectAction,
}) => {
  const { isMobile } = useResponsive();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  return (
    <Row
      gutter={[12, 12]}
      style={{ padding: isMobile ? "16px" : "24px", margin: 0, width: "100%" }}
    >
      {projects.map((project) => {
        const creditUsed = (project.accessImageAmount ?? 0) - (project.remainImageAmount ?? 0);
        const creditTotal = project.accessImageAmount ?? 0;
        // const tokenUsed = (project.accessTokenAmount ?? 0) - (project.remainTokenAmount ?? 0);
        // const tokenTotal = project.accessTokenAmount ?? 0;
        return (
          <Col xs={24} sm={12} lg={6} key={project.id}>
                <Card
              onMouseEnter={() => setHoveredCardId(project.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                backgroundColor: semantic.colorBgContainer,
                    border: `1px solid ${hoveredCardId === project.id ? semantic.colorPrimaryBorder : semantic.colorBorder}`,
                    boxShadow: hoveredCardId === project.id ? '0 10px 28px rgba(0,0,0,0.12)' : 'none',
                cursor: 'pointer',
                position: 'relative',
                    transform: hoveredCardId === project.id ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 180ms ease',
              }}
              onClick={() => onClickProject(project.id)}
            >
              {showActionMenu && projectActionItems.length > 0 && onClickProjectAction ? (
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                  <Dropdown
                    disabled={project.status === 'deleted'}
                    menu={{
                      items: projectActionItems,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        onClickProjectAction(e.key, project);
                      },
                    }}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined style={{ fontSize: 18 }} />}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        opacity: isMobile || hoveredCardId === project.id ? 1 : 0,
                        pointerEvents:
                          isMobile || hoveredCardId === project.id ? 'auto' : 'none',
                        transition: 'opacity 0.15s ease',
                        color: semantic.colorTextSecondary,
                        borderRadius: 10,
                      }}
                    />
                  </Dropdown>
                </div>
              ) : null}
              <Space align="start" size={6} style={{ width: '100%', gap: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: semantic.colorBgContainer }}>
                  <FolderOpenOutlined style={{ color: semantic.colorPrimary, fontSize: 22 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space align="start" direction="vertical" size={2}>
                    {project.name && project.name.length > 15 ? (
                      <Tooltip title={project.name} placement="top" mouseEnterDelay={0.5}>
                        <Typography.Title
                          level={5}
                          style={{
                            color: semantic.colorTextBase,
                            fontWeight: 700,
                            marginBottom: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          {project.name}
                        </Typography.Title>
                      </Tooltip>
                                ) : (
                                       
                      <Typography.Title
                        level={5}
                        style={{
                          color: semantic.colorTextBase,
                          fontWeight: 700,
                          marginBottom: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {project.name}
                      </Typography.Title>
                    )}
                   
                  <Typography.Text style={{ color: project.status === 'deleted' ? semantic.colorError : semantic.colorSuccess, fontWeight: 600, fontSize: 12, lineHeight: 1.15 }}> <Badge color={project.status === 'deleted' ? semantic.colorError : semantic.colorSuccess} style={{ marginLeft: 8 }} />{project.status === 'deleted' ? 'Deleted' : 'Active'}</Typography.Text>
               </Space> </div>
              </Space>
              {/* Description */}
              <div style={{ color: semantic.colorTextSecondary, fontSize: 13, margin: '6px 0 8px 0', minHeight: 18, lineHeight: 1.2 }}>{project.description || 'No description provided'}</div>
              {/* Quota Bars */}
              <div style={{ marginBottom: 8 }}>
                <Quata
                  creditUsed={creditUsed}
                  creditTotal={creditTotal}
                  // tokenUsed={tokenUsed}
                  // tokenTotal={tokenTotal}
                  semantic={semantic}
                  size="middle" cerrentUsedCredit={0}                />
              </div>
              {/* Footer: Members and Date */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: semantic.colorTextSecondary, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamOutlined style={{ fontSize: 15 }} />
                  <span>{project.members?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ fontSize: 15 }} />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ProjectGridView;
