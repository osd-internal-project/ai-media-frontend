import React, { useEffect, useState, useRef, type FC, type ReactElement } from "react";
import {
  Button,
  Flex,
  Image,
  Pagination,
  Table,
  Tag,
  Tooltip,
  Typography,
  notification,
} from "antd";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";

import type { ColumnsType } from "antd/es/table";
import { Loader2, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import {
  StarFilled,
  StarOutlined,

} from "@ant-design/icons";
import PreviewImage from "../../chat-components/preview-image";

export interface props {
  shouldRefetch?: boolean;
  activeKey: string;
}

const mockActivityData = [
  {
    id: "mock-act-1",
    typeGenerate: "image",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    prompt: "Astronaut walking through a jungle of bioluminescent plants",
    createdAt: "2026-03-03T09:10:00.000Z",
    status: false,
    users: { fullname: "Demo User" },
    generateConfig: { modelName: "Flux Schnell" },
  },
  {
    id: "mock-act-2",
    typeGenerate: "video",
    imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    prompt: "Drone shot above a modern city with cinematic sunset lighting",
    createdAt: "2026-03-03T11:25:00.000Z",
    status: true,
    users: { fullname: "Creative Team" },
    generateConfig: { modelName: "Kling 1.6" },
  },
  {
    id: "mock-act-3",
    typeGenerate: "omnihumen",
    imageUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    prompt: "Portrait avatar speaking Thai naturally with clean studio background",
    createdAt: "2026-03-04T07:45:00.000Z",
    status: false,
    users: { fullname: "Motion Lab" },
    generateConfig: { modelName: "OmniHuman v1" },
  },
];

const PromptActivity: FC<props> = ({
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
  const pageSize = 10;
  const [getData, setData] = useState<{ data: any[]; total: number }>({
    data: [],
    total: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [api, contextHolders] = notification.useNotification();
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (activeKey === "activity" && loading) {
      fectData();
    }
  }, [loading, page]);

  useEffect(() => {
    if (activeKey === "activity" && shouldRefetch) {
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
    );

    setTotal(res.total);
    setData({ data: res.data, total: res.total });
    setLoading(false);
  };

  const onSubmitToLibrary = async (item: any) => {
    try {
      setLoadingButton(item.id);
      await galleryservices.updateStatus(item.id, true);

      setData((prev) => {
        const updated = prev.data.map((entry) =>
          entry.id === item.id ? { ...entry, status: true } : entry,
        );
        return { ...prev, data: updated };
      });

      api.success({
        message: "Success",
        description: "Successfully added to library",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      api.error({
        message: "Error",
        description: "Failed to add to library",
      });
    } finally {
      setLoadingButton(null);
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    const normalized = (type || "image").toLowerCase();

    if (normalized === "image") {
      return {
        color: "#1890ff",
        background: `$#1890ff1A`,
      };
    }

    if (normalized === "video") {
      return {
        color: semantic.colorPrimary,
        background: `${semantic.colorPrimary}1A`,
      };
    }
    if (normalized === "omnihumen" || normalized === "omnihuman") {
      return {
        color: semantic.colorSuccess,
        background: `${semantic.colorSuccess}1A`,
      };
    }
    if (normalized === "dreamactor") {
      return {
        color: semantic.colorWarning,
        background: `${semantic.colorWarning}1A`,
      };
    }

    return {
      color: "#1890ff",
    };
  };

  const columns: ColumnsType<any> = [
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "preview",
      width: 140,
      render: (_, record) => {
        const isVideo = record.typeGenerate === "video" || record.typeGenerate === "dreamactor" || record.typeGenerate === "omnihumen" || record.typeGenerate === "omnihuman";
        return (
          <div
            style={{
              width: 112,
              height: 64,
              borderRadius: 8,
              overflow: "hidden",
              border: `1px solid ${semantic.colorBorder}`,
              position: "relative",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredId(record.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setPreviewItem(record)}
          >
            {/* Thumbnail or video preview */}
            {isVideo ? (
              <>
                <video
                  src={record.imageUrl}
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hoveredId === record.id ? 1 : 0.7, transition: "opacity 0.2s" }}
                  playsInline
                  loop
                  preload="metadata"
                  onMouseOver={e => { if (hoveredId === record.id) (e.currentTarget as HTMLVideoElement).play(); }}
                  onMouseOut={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 4,
                    padding: 2,
                    zIndex: 2,
                  }}
                >
                  <Eye size={16} color="#fff" />
                </div>
              </>
            ) : (
              <>
                <Image
                  src={record.imageUrl}
                  alt={record.prompt || "preview"}
                  preview={false}
                  width={112}
                  height={64}
                  style={{ objectFit: "cover", opacity: hoveredId === record.id ? 1 : 0.85, transition: "opacity 0.2s" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 4,
                    padding: 2,
                    zIndex: 2,
                  }}
                >
                  <Eye size={16} color="#fff" />
                </div>
              </>
            )}
            {/* Overlay on hover */}
            {hoveredId === record.id && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.15)",
                  zIndex: 1,
                  borderRadius: 8,
                  transition: "background 0.2s",
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "typeGenerate",
      key: "type",
      width: 120,
      render: (value) => (
        <Tag
          style={{
            textTransform: "capitalize",
            ...getTypeBadgeStyle(value),
          }}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      ellipsis: true,
      render: (value) => (
        <Tooltip title={value}>
          <Typography.Text>{value || "-"}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "Model",
      key: "model",
      width: 180,
      render: (_, record) => record?.generateConfig?.modelName || "Unknown model",
    },
    {
      title: "Created By",
      key: "user",
      width: 160,
      render: (_, record) => record?.users?.fullname || "-",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => {
        const isLiked = Boolean(record?.status);
        return (
          <Button
            icon={
              loadingButton === record.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLiked ? (
                <StarFilled size={16} style={{ color: "#f59e0b" }} />
              ) : (
                <StarOutlined style={{ color: "#d9d9d9" }} size={16} />
              )
            }
            onClick={() => {
              if (loadingButton === record.id) return;
              if (isLiked) {
                // Unlike
                setLoadingButton(record.id);
                galleryservices.updateStatus(record.id, false)
                  .then(() => {
                    setData((prev) => {
                      const updated = prev.data.map((entry) =>
                        entry.id === record.id ? { ...entry, status: false } : entry
                      );
                      return { ...prev, data: updated };
                    });
                    api.success({ message: "Removed from library" });
                  })
                  .catch(() => {
                    api.error({ message: "Failed to remove from library" });
                  })
                  .finally(() => setLoadingButton(null));
              } else {
                // Like
                onSubmitToLibrary(record);
              }
            }}
            loading={loadingButton === record.id}
            type="text"
            shape="circle"
            disabled={isMockPreview}
            className="activity-star-button"
          />
        );
      },
    },
  ];

  const isMockPreview = !loading && getData.data.length === 0;
  const displayItems = isMockPreview ? mockActivityData : getData.data;
  const displayTotal = isMockPreview ? mockActivityData.length : total;

  return (
    <div className="h-full min-h-0 overflow-auto p-4">
      {contextHolders}
      {loading ? (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Loader2 className="w-6 h-6 animate-spin" />
        </Flex>
      ) : (
        <Flex vertical gap={16}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              All Activity
            </Typography.Title>
            <Typography.Text type="secondary">
              {isMockPreview
                ? "Showing mock preview data"
                : "All generation history in this project"}
            </Typography.Text>
          </div>

          <div
            style={{
              border: `1px solid ${semantic.colorBorder}`,
              borderRadius: 12,
              overflow: "hidden",
              background: semantic.colorBgContainer,
            }}
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={displayItems}
              pagination={false}
              size="middle"
              scroll={{ x: 1200 }}
            />
          </div>

          <Flex justify="center">
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
      {/* PREVIEW MODAL */}
      {previewItem && (
        previewItem.typeGenerate === "image" ? (
          <PreviewImage
            closePreview={() => setPreviewItem(null)}
            previewImage={previewItem.imageUrl}
          />
        ) : (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setPreviewItem(null)}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={() => setPreviewItem(null)}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <video
              src={previewItem.imageUrl}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-50 duration-300"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )
      )}
    </div>
  );
};

export default PromptActivity;
