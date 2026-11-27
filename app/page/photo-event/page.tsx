"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Empty, Input, Row, Spin, Typography, theme } from "antd";
import { MonitorPlay, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { axiosCore } from "@/app/lib/axios/axios";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import useResponsive from "@/app/hooks/useResponsive";
import { buildKioskUrl } from "@/app/utils/photo-event";

const PhotoEventPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const semantic = theme.useToken().token;
  const { isMobile } = useResponsive();
  const projectService = useMemo(() => ProjectService(axiosCore), []);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");

  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!organizationId || !userId) return;
    setLoading(true);
    setLoadError(false);
    projectService
      .findByOrganizationId(organizationId, userId, { status: "active" })
      .then((result) => setProjects(result ?? []))
      // A failed load must not read as "no projects".
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [organizationId, userId, projectService, reloadKey]);

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
        titleColor={semantic.colorTextBase as string}
        subtitleColor={semantic.colorTextSecondary as string}
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
        ) : loadError ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Couldn't load projects. Check your connection and try again."
            style={{ marginTop: 48 }}
          >
            <Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>
          </Empty>
        ) : visibleProjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              keyword.trim()
                ? `No project matches "${keyword.trim()}"`
                : "No active projects yet. Create one in Projects to run a photo event."
            }
            style={{ marginTop: 48 }}
          >
            {!keyword.trim() && (
              <Button onClick={() => router.push("/page/project")}>Go to Projects</Button>
            )}
          </Empty>
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
                  <Typography.Title
                    level={2}
                    ellipsis={{ tooltip: project.name }}
                    style={{ margin: 0, fontSize: 16, fontWeight: 600, color: semantic.colorTextBase }}
                  >
                    {project.name}
                  </Typography.Title>
                  {project.description && (
                    <Typography.Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0 }}
                    >
                      {project.description}
                    </Typography.Paragraph>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <Button
                      block
                      icon={<Settings size={16} />}
                      onClick={() =>
                        router.push(`/page/photo-event/${project.id}/setting`)
                      }
                    >
                      Settings
                    </Button>
                    <Button
                      block
                      type="primary"
                      icon={<MonitorPlay size={16} />}
                      aria-label={`Open kiosk for ${project.name} in a new tab`}
                      onClick={() => openKiosk(project.id)}
                    >
                      Open kiosk
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
