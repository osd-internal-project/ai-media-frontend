"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Empty, Input, Row, Spin, Typography } from "antd";
import { Camera, MonitorPlay, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import useResponsive from "@/app/hooks/useResponsive";
import { buildKioskUrl } from "@/app/utils/photo-event";

const PhotoEventPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const { isMobile } = useResponsive();
  const projectService = useMemo(() => ProjectService(axiosCore), []);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!organizationId || !userId) return;
    setLoading(true);
    projectService
      .findByOrganizationId(organizationId, userId, { status: "active" })
      .then((result) => setProjects(result ?? []))
      .finally(() => setLoading(false));
  }, [organizationId, userId, projectService]);

  const visibleProjects = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return projects.filter(
      (project) =>
        project.status !== "deleted" &&
        (!term || project.name.toLowerCase().includes(term)),
    );
  }, [projects, keyword]);

  const openKiosk = (projectId: string) =>
    window.open(buildKioskUrl(projectId), "_blank", "noopener");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageSubHeader
        title="Photo Event"
        subtitle="Import guest photos and run the AI photo booth on a big screen"
        count={visibleProjects.length}
        background={semantic.colorBgContainer as string}
        borderColor={semantic.colorBorder as string}
        titleColor={semantic.colorTextBase as string}
        subtitleColor={semantic.colorTextSecondary as string}
        chipBg={semantic.colorBgTextActive as string}
        chipText={semantic.colorTextSecondary as string}
        rightSlot={
          <Input.Search
            allowClear
            size="small"
            placeholder="Search project"
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: isMobile ? 160 : 240 }}
          />
        }
      />
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spin />
          </div>
        ) : visibleProjects.length === 0 ? (
          <Empty description="No projects" style={{ marginTop: 48 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {visibleProjects.map((project) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                <Card
                  style={{
                    backgroundColor: semantic.colorBgContainer,
                    border: `1px solid ${semantic.colorBorder}`,
                    height: "100%",
                  }}
                  styles={{
                    body: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      height: "100%",
                    },
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: semantic.colorPrimaryBg,
                        color: semantic.colorPrimary,
                        flexShrink: 0,
                      }}
                    >
                      <Camera size={20} />
                    </div>
                    <Typography.Title
                      level={5}
                      ellipsis={{ tooltip: project.name }}
                      style={{ margin: 0, color: semantic.colorTextBase }}
                    >
                      {project.name}
                    </Typography.Title>
                  </div>
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ margin: 0, flex: 1, minHeight: 44 }}
                  >
                    {project.description || "No description"}
                  </Typography.Paragraph>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      block
                      icon={<Settings size={16} />}
                      onClick={() =>
                        router.push(`/page/photo-event/${project.id}/setting`)
                      }
                    >
                      Setting
                    </Button>
                    <Button
                      block
                      type="primary"
                      icon={<MonitorPlay size={16} />}
                      onClick={() => openKiosk(project.id)}
                    >
                      Photo
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default PhotoEventPage;
