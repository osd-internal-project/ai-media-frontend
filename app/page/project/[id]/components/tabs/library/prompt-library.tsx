import React, { useEffect, useState, type FC, type ReactElement } from "react";
import {
  Image,
  Card,
  Col,
  Flex,
  Pagination,
  Button,
  notification,
  Row,
  Tag,
  message,
  Typography,
} from "antd";
import { Download, ExternalLink, Loader, Star, Trash2 } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";

export interface props {
  shouldRefetch?: boolean;
  activeKey: string;
}

const mockLibraryData = [
  {
    id: "mock-lib-1",
    typeGenerate: "image",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    prompt: "A cinematic neon city skyline at night, ultra-detailed, volumetric lighting",
    fileName: "mock-image-1.jpg",
    createdAt: "2026-03-01T10:30:00.000Z",
    generateConfig: { modelName: "Flux Pro" },
  },
  {
    id: "mock-lib-2",
    typeGenerate: "video",
    imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    prompt: "Smooth cinematic pan over a futuristic laboratory with holographic displays",
    fileName: "mock-video-1.mp4",
    createdAt: "2026-03-02T08:15:00.000Z",
    generateConfig: { modelName: "Runway Gen-3" },
  },
  {
    id: "mock-lib-3",
    typeGenerate: "dreamactor",
    imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    prompt: "Portrait speaking naturally with soft studio lighting and realistic lip-sync",
    fileName: "mock-dreamactor-1.mp4",
    createdAt: "2026-03-03T14:05:00.000Z",
    generateConfig: { modelName: "DreamActor v2" },
  },
];

const PromptLibrary: FC<props> = ({
  shouldRefetch,
  activeKey,
}): ReactElement => {
  const params = useParams();
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const organizationId = session?.user?.organizationId || "";
  const galleryservices = GalleryServices(axiosCore);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;
  const [getData, setData] = useState<{ data: any[]; total: number }>({
    data: [],
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);

  const [api, contextHolders] = notification.useNotification();
  const secondaryActionStyle = {
    backgroundColor: aiCaveColors.secondary,
    borderColor: aiCaveColors.secondary,
    color: semantic.colorBgBase,
  };

  useEffect(() => {
    if (activeKey === "library" && loading) {
      fectData();
    }
  }, [loading, page]);

  useEffect(() => {
    if (activeKey === "library" && shouldRefetch) {
      fectData();
    }
  }, [shouldRefetch]);

  const fectData = async () => {
    if (!session) return;
    const id = params.id as string;
    const res = await galleryservices.findById(
      id,
      organizationId,
      page,
      pageSize,
      true,
    );
    setTotal(res.total);
    setData({ data: res.data, total: res.total });
    setLoading(false);
  };

  const onDownloadFile = async (fileName: string, imageId: string) => {
    setLoadingDownload(true);
    try {
      const response = await galleryservices.downloadFile(
        imageId,
        session?.user?.organizationId || "",
      );
      if (!response) throw new Error("Download failed or response is empty");
      // console.log(response);
      // const filename = response.name || "image.jpg";
      const url = URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      message.success("Image downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      message.error("Download failed");
    }
    setLoadingDownload(false);
  };

  const handleOpenResult = (record: any) => {
    const resultUrl = record?.imageUrl || record?.thumbnailUrl;
    if (!resultUrl) return;
    window.open(resultUrl, "_blank", "noopener,noreferrer");
  };

  const handleRemoveFromLibrary = async (record: any) => {
    try {
      await galleryservices.updateStatus(record.id, false);
      setData((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item.id !== record.id),
      }));
      setTotal((prev) => Math.max(0, prev - 1));
      api.success({
        message: "Removed",
        description: "Removed from library",
      });
    } catch (error) {
      console.error("Remove from library failed:", error);
      api.error({
        message: "Failed",
        description: "Failed to remove from library",
      });
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    const normalized = (type || "image").toLowerCase();

    if (normalized === "video") {
      return {
        color: semantic.colorPrimary,
        background: `${semantic.colorPrimary}1A`,
        borderColor: `${semantic.colorPrimary}33`,
      };
    }
    if (normalized === "omnihumen" || normalized === "omnihuman") {
      return {
        color: semantic.colorSuccess,
        background: `${semantic.colorSuccess}1A`,
        borderColor: `${semantic.colorSuccess}33`,
      };
    }
    if (normalized === "dreamactor") {
      return {
        color: semantic.colorWarning,
        background: `${semantic.colorWarning}1A`,
        borderColor: `${semantic.colorWarning}33`,
      };
    }

    return {
      color: semantic.colorInfo || semantic.colorPrimary,
      background: `${semantic.colorInfo || semantic.colorPrimary}1A`,
      borderColor: `${semantic.colorInfo || semantic.colorPrimary}33`,
    };
  };

  const renderPreview = (record: any) => {
    if (record.typeGenerate === "image") {
      return (
        <Image
          src={record.imageUrl}
          alt={record.prompt || "result"}
          preview={false}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    return (
      <video
        src={record.imageUrl}
        controls
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  const isMockPreview = !loading && getData.data.length === 0;
  const displayItems = isMockPreview ? mockLibraryData : getData.data;
  const displayTotal = isMockPreview ? mockLibraryData.length : total;

  return (
    <div className="h-full min-h-0 overflow-auto p-4">
      {contextHolders}
      {loading ? (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Loader className="w-5 h-5 animate-spin" />
        </Flex>
      ) : (
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Library
              </Typography.Title>
              <Typography.Text type="secondary">
                {displayTotal} item{displayTotal !== 1 ? "s" : ""} saved
              </Typography.Text>
            </div>
            {isMockPreview ? (
              <Flex align="center" gap={6}>
                <Star size={14} style={{ color: semantic.colorWarning }} />
                <Typography.Text type="secondary">Mock preview data</Typography.Text>
              </Flex>
            ) : null}
          </Flex>

          <Row gutter={[16, 16]}>
            {displayItems.map((item) => (
              <Col key={item.id} xs={24} md={12} lg={8}>
                <Card
                  style={{
                    overflow: "hidden",
                    borderColor: semantic.colorBorder,
                    background: semantic.colorBgContainer,
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="group" style={{ position: "relative", aspectRatio: "16 / 9" }}>
                    {renderPreview(item)}

                    <Tag
                      style={{
                        position: "absolute",
                        left: 8,
                        top: 8,
                        textTransform: "capitalize",
                        ...getTypeBadgeStyle(item.typeGenerate),
                      }}
                    >
                      {item.typeGenerate}
                    </Tag>

                    <Flex
                      align="center"
                      justify="center"
                      gap={8}
                      style={{
                        position: "absolute",
                        inset: 0,
                        transition: "opacity 0.2s ease",
                        background: "rgba(0,0,0,0.45)",
                      }}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto"
                    >
                      <Button
                        shape="circle"
                        icon={
                          loadingDownload ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download size={16} />
                          )
                        }
                        onClick={() => onDownloadFile(item.fileName || "result", item.id)}
                        disabled={isMockPreview}
                        style={secondaryActionStyle}
                      />
                      <Button
                        shape="circle"
                        icon={<ExternalLink size={16} />}
                        onClick={() => handleOpenResult(item)}
                        style={secondaryActionStyle}
                      />
                      <Button
                        shape="circle"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => handleRemoveFromLibrary(item)}
                        disabled={isMockPreview}
                        style={secondaryActionStyle}
                      />
                    </Flex>
                  </div>

                  <div style={{ padding: 12 }}>
                    <Typography.Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 8, minHeight: 40 }}
                    >
                      {item.prompt || "-"}
                    </Typography.Paragraph>
                    <Flex justify="space-between" align="center">
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.generateConfig?.modelName || "Unknown model"}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </Typography.Text>
                    </Flex>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Flex justify="center" style={{ paddingTop: 4 }}>
            <Pagination
              current={page}
              total={displayTotal}
              pageSize={pageSize}
              onChange={(nextPage) => {
                setPage(nextPage);
                setLoading(true);
              }}
              showSizeChanger={false}
              disabled={isMockPreview}
            />
          </Flex>
        </Flex>
      )}
      </div>
  );
};

export default PromptLibrary;
