"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Tabs } from "antd";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProjectService from "@/app/services/project.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import useResponsive from "@/app/hooks/useResponsive";
import { usePhotoEventPhotos } from "@/app/hooks/usePhotoEventPhotos";
import { buildKioskUrl } from "@/app/utils/photo-event";
import PhotosTab from "./components/photos-tab";
import TemplatesTab from "./components/templates-tab";

const PhotoEventSettingPage = () => {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const { isMobile } = useResponsive();
  const projectService = useMemo(() => ProjectService(axiosCore), []);
  const [projectName, setProjectName] = useState("");
  const { photos, loading, addPhotos, isConnected } = usePhotoEventPhotos(projectId);

  const userId = session?.user?.id ?? "";
  const organizationId = session?.user?.organizationId ?? "";

  useEffect(() => {
    projectService
      .findById(projectId)
      .then((project) => setProjectName(project?.name ?? ""));
  }, [projectId, projectService]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageSubHeader
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Button
              type="text"
              size="small"
              icon={<ArrowLeft size={18} />}
              onClick={() => router.push("/page/photo-event")}
            />
            {projectName ? `${projectName} · Event Settings` : "Event Settings"}
          </span>
        }
        count={photos.length}
        background={semantic.colorBgContainer as string}
        borderColor={semantic.colorBorder as string}
        titleColor={semantic.colorTextBase as string}
        subtitleColor={semantic.colorTextSecondary as string}
        chipBg={semantic.colorBgTextActive as string}
        chipText={semantic.colorTextSecondary as string}
        rightSlot={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <Badge
              status={isConnected ? "success" : "default"}
              text={isMobile ? undefined : isConnected ? "Live" : "Offline"}
            />
            <Button
              type="primary"
              size="small"
              icon={<MonitorPlay size={14} />}
              onClick={() => window.open(buildKioskUrl(projectId), "_blank", "noopener")}
            >
              Open kiosk
            </Button>
          </span>
        }
      />
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
        <Tabs
          items={[
            {
              key: "photos",
              label: "Photos",
              children: (
                <PhotosTab
                  projectId={projectId}
                  userId={userId}
                  photos={photos}
                  loading={loading}
                  onPhotosAdded={addPhotos}
                  semantic={semantic}
                />
              ),
            },
            {
              key: "templates",
              label: "Templates",
              children: (
                <TemplatesTab
                  projectId={projectId}
                  userId={userId}
                  organizationId={organizationId}
                  semantic={semantic}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default PhotoEventSettingPage;
