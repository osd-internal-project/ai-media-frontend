import React from "react";
import { Row, Col, Card, Space, Typography, Tooltip, Badge } from "antd";
import {
  FolderOpenOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { IProject } from "@/app/common/project.type";
import Quata from "./quata";
import useResponsive from "@/app/hooks/useResponsive";

interface ProjectGridViewProps {
  projects: IProject[];
  semantic: any;
  onClickProject: (projectId: string) => void;
  formatDate: (dateString: string) => string;
}

const ProjectGridView: React.FC<ProjectGridViewProps> = ({ projects, semantic, onClickProject, formatDate }) => {
    const { isMobile } = useResponsive();
  return (
    <Row gutter={[12, 12]} style={{ padding: isMobile ? "16px" : "24px"  }}>
      {projects.map((project) => {
        const imageUsed = (project.accessImageAmount ?? 0) - (project.remainImageAmount ?? 0);
        const imageTotal = project.accessImageAmount ?? 0;
        const tokenUsed = (project.accessTokenAmount ?? 0) - (project.remainTokenAmount ?? 0);
        const tokenTotal = project.accessTokenAmount ?? 0;
        return (
          <Col xs={24} sm={12} lg={6} key={project.id}>
                <Card
                
              style={{
                backgroundColor: semantic.colorBgContainer,
                border: `1px solid ${semantic.colorBorder}`,
                boxShadow: 'none',
             
              }}
              onClick={() => onClickProject(project.id)}
            >
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
                  imageUsed={imageUsed}
                  imageTotal={imageTotal}
                  tokenUsed={tokenUsed}
                  tokenTotal={tokenTotal}
                  semantic={semantic}
                  size="middle"
                />
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
