import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
  Badge,
  Dropdown,
  Button,
} from "antd";
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
  const { isMobile, isTablet } = useResponsive();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  return (
    <>
      <Row
        className="project-grid-shell"
        gutter={[isMobile ? 10 : 12, isMobile ? 10 : 12]}
        style={{
          padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
          margin: 0,
          width: "100%",
        }}
      >
        {projects.map((project, index) => {
          const creditUsed = project.usedCreditAllowance
          const creditTotal = project.limitCreditAllowance ?? 0;
          return (
            <Col xs={24} sm={12} md={12} lg={8} xl={6} key={project.id}>
              <Card 
                className="project-grid-card"
                style={{
                  backgroundColor: semantic.colorBgContainer,
                  border: `1px solid ${hoveredCardId === project.id ? semantic.colorPrimaryBorder : semantic.colorBorder}`,
                  boxShadow:
                    hoveredCardId === project.id
                      ? "0 10px 28px rgba(0,0,0,0.12)"
                      : (semantic.boxShadowTertiary ?? "none"),
                  cursor: "pointer",
                  position: "relative",
                  transform:
                    hoveredCardId === project.id
                      ? "translateY(-2px)"
                      : "translateY(0)",
                  transition: "all 180ms ease",
                  animation: `projectCardIn 320ms ease ${Math.min(index * 35, 220)}ms both`,
                }}
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                styles={{
                  body: { padding: isMobile ? 12 : isTablet ? 14 : 16 },
                }}
                onClick={() => onClickProject(project.id)}
              >
               
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: isMobile ? 2 : 6,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      flexShrink: 0,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: semantic.colorBgContainer,
                    }}
                  >
                    <FolderOpenOutlined
                      style={{
                        color: semantic.colorPrimary,
                        fontSize: isMobile ? 18 : 22,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Tooltip
                        title={project.name}
                        placement="top"
                        mouseEnterDelay={0.5}
                      >
                        <Typography.Title
                          level={5}
                          ellipsis={true}
                          style={{
                            color: semantic.colorTextBase,
                            fontWeight: 700,
                            marginBottom: 0,
                            fontSize: isMobile ? 15 : 18,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            paddingRight: showActionMenu ? 24 : 0,
                          }}
                        >
                          {project.name}
                        </Typography.Title>
                      </Tooltip>

                      <Typography.Text
                        style={{
                          color:
                            project.status === "deleted"
                              ? semantic.colorError
                              : semantic.colorSuccess,
                          fontWeight: 600,
                          fontSize: isMobile ? 11 : 12,
                          lineHeight: 1.15,
                        }}
                      >
                        {" "}
                        <Badge
                          color={
                            project.status === "deleted"
                              ? semantic.colorError
                              : semantic.colorSuccess
                          }
                          style={{ marginLeft: 8 }}
                        />
                        {project.status === "deleted" ? "Deleted" : "Active"}
                      </Typography.Text>
                    </div>
                  </div>
                   {showActionMenu &&
                projectActionItems.length > 0 &&
                onClickProjectAction ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                    }}
                  >
                    <Dropdown
                      disabled={project.status === "deleted"}
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
                        className="project-grid-action-btn"
                        type="text"
                        icon={
                          <MoreOutlined
                            style={{ fontSize: isMobile ? 16 : 18 }}
                          />
                        }
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          opacity:
                            isMobile || hoveredCardId === project.id ? 1 : 0,
                          pointerEvents:
                            isMobile || hoveredCardId === project.id
                              ? "auto"
                              : "none",
                          transition: "opacity 0.15s ease",
                          color: semantic.colorTextSecondary,
                          borderRadius: 10,
                        }}
                      />
                    </Dropdown>
                  </div>
                ) : null}
                </div>
                {/* Description */}
                <div
                  style={{
                    color: semantic.colorTextSecondary,
                    fontSize: isMobile ? 12 : 13,
                    margin: "6px 0 8px 0",
                    minHeight: isMobile ? 16 : 18,
                    lineHeight: 1.2,
                    display: "-webkit-box",
                    WebkitLineClamp: isMobile ? 1 : 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description || "No description provided"}
                </div>
                {/* Quota Bars */}
                <div style={{ marginBottom: 8 }}>
                  <Quata
                    creditUsed={creditUsed}
                    creditTotal={creditTotal}
                    // tokenUsed={tokenUsed}
                    // tokenTotal={tokenTotal}
                    semantic={semantic}
                    size="middle"
                    cerrentUsedCredit={0}
                  />
                </div>
                {/* Footer: Members and Date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: isMobile ? 12 : 13,
                    color: semantic.colorTextSecondary,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <TeamOutlined style={{ fontSize: isMobile ? 14 : 15 }} />
                    <span>{project.members?.length || 0}</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <CalendarOutlined
                      style={{ fontSize: isMobile ? 14 : 15 }}
                    />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <style jsx global>{`
        .project-grid-card {
          will-change: transform, box-shadow;
        }

        .project-grid-action-btn {
          transition: all 160ms ease;
        }

        .project-grid-action-btn:hover {
          transform: translateY(-1px);
        }

        @keyframes projectCardIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ProjectGridView;
