import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  type FC,
  type ReactElement,
} from "react";
import {
  Button,
  Empty,
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
import { AudioLines, Eye } from "lucide-react";
import AudioPlayer from "../../shared/audio-player";

import type { ColumnsType } from "antd/es/table";
import {
  Loader2,
  Star,
  Download,
  Trash2,
  Share2,
  Copy,
  Paintbrush,
  Megaphone,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import {
  StarFilled,
  StarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";
import PreviewImage from "../../chat-components/preview-image";
import ImageEditor from "../../chat-components/image-editor";
import ShareModal from "./share-modal";
import type { SocialShareItem } from "./useSocialShare";

export interface props {
  shouldRefetch?: boolean;
  activeKey: string;
  /**
   * เปิดแท็บ Public Social พร้อม preselect รายการนี้
   * undefined = org ไม่มีสิทธิ์ใช้ฟีเจอร์ ปุ่มจะไม่แสดง
   */
  onShareToSocial?: (galleryId: string) => void;
}

const PromptActivity: FC<props> = ({
  shouldRefetch,
  activeKey,
  onShareToSocial,
}): ReactElement => {
  const params = useParams();
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const organizationId = session?.user?.organizationId || "";
  const galleryservices = useMemo(() => GalleryServices(axiosCore), []);

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
  const [imageEditorUrl, setImageEditorUrl] = useState<string | null>(null);
  const [shareItem, setShareItem] = useState<SocialShareItem | null>(null);
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

  // ImageEditor loads a remote (presigned) URL directly with crossOrigin, so we
  // pass the record's presigned URL instead of proxying the bytes through the API.
  const openImageEditor = (imageUrl: string) => {
    setImageEditorUrl(imageUrl);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "preview",
      width: 140,
      render: (_, record) => {
        const isVideo =
          record.typeGenerate === "video" ||
          record.typeGenerate === "dreamactor" ||
          record.typeGenerate === "omnihumen" ||
          record.typeGenerate === "omnihuman";
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
              display: "flex",
            }}
            onMouseEnter={() => setHoveredId(record.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setPreviewItem(record)}
          >
            {/* Thumbnail or video preview */}
            {record.typeGenerate === "audio" ? (
              <AudioLines
                size={28}
                aria-label="Audio"
                style={{ margin: "auto", color: semantic.colorPrimary }}
              />
            ) : isVideo ? (
              record.imageUrl ? (
                <>
                  <video
                    src={record.imageUrl || undefined}
                    muted
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      opacity: hoveredId === record.id ? 1 : 0.7,
                      transition: "opacity 0.2s",
                      display: "block",
                      margin: "auto",
                      background: "transparent",
                    }}
                    playsInline
                    loop
                    preload="metadata"
                    onMouseOver={async (e) => {
                      if (hoveredId === record.id) {
                        try {
                          if (e.currentTarget.paused) {
                            await e.currentTarget.play();
                          }
                        } catch (err) {
                          // Ignore AbortError or any play interruption
                        }
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
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
              ) : null
            ) : record.imageUrl ? (
              <>
                <Image
                  src={record.imageUrl || undefined}
                  alt={record.prompt || "preview"}
                  preview={false}
                  width={112}
                  height={64}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    opacity: hoveredId === record.id ? 1 : 0.85,
                    transition: "opacity 0.2s",
                    display: "block",
                    margin: "auto",
                    background: "transparent",
                  }}
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
            ) : null}
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
      width: 270,
      ellipsis: true,
      render: (value, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
          onMouseEnter={() => setHoveredId(record.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Tooltip title={value}>
            <Typography.Text
              style={{
                maxWidth: 250,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {value || "-"}
            </Typography.Text>
          </Tooltip>
          {hoveredId === record.id && !!value && (
            <Button
              icon={<Copy size={16} />}
              type="text"
              shape="circle"
              size="small"
              style={{ marginLeft: 8 }}
              onClick={() => {
                navigator.clipboard.writeText(value);
                api.success({ message: "Prompt copied" });
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Model",
      key: "model",
      width: 180,
      render: (_, record) =>
        record?.generateConfig?.modelName || "Unknown model",
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
      align: "center",
      width: 180,
      render: (_, record) => {
        const isLiked = Boolean(record?.status);
        const isVideo =
          record.typeGenerate === "video" ||
          record.typeGenerate === "dreamactor" ||
          record.typeGenerate === "omnihumen";
        return (
          <div
            style={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* Edit (image only) */}
            {/* {!isVideo && (
              <Button
                icon={<Paintbrush size={16} style={{color:' #ffff'}}  
                // className=" text-yellow-500 drop-shadow-[0_0_5px_#f59e0b] animate-pulse"
                />
              }
                onClick={() => openImageEditor(record.imageUrl)}
                type="text"
                shape="circle"
                className="activity-star-button"
                disabled={!record.imageUrl}
              />
            )} */}
            {/* Like/Unlike */}
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
                  setLoadingButton(record.id);
                  galleryservices
                    .updateStatus(record.id, false)
                    .then(() => {
                      setData((prev) => {
                        const updated = prev.data.map((entry) =>
                          entry.id === record.id
                            ? { ...entry, status: false }
                            : entry,
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
                  onSubmitToLibrary(record);
                }
              }}
              loading={loadingButton === record.id}
              type="text"
              shape="circle"
              className="activity-star-button"
            />
            {/* Download */}
            <Button
              icon={<Download size={16} />}
              type="text"
              shape="circle"
              onClick={async (e) => {
                e.stopPropagation();
                const key = `download_${record.id}`;
                let hide: () => void = () => {};
                try {
                  const maybeHide = api.info({
                    message: "Downloading...",
                  });
                  if (typeof maybeHide === "function") {
                    hide = maybeHide;
                  }
                  let ext = "";
                  if (record.typeGenerate === "image") {
                    ext = ".jpg";
                  } else if (
                    record.typeGenerate === "video" ||
                    record.typeGenerate === "dreamactor" ||
                    record.typeGenerate === "omnihumen" ||
                    record.typeGenerate === "omnihuman"
                  ) {
                    ext = ".mp4";
                  } else if (record.typeGenerate === "audio") {
                    ext =
                      record.generateConfig?.format === "wav"
                        ? ".wav"
                        : record.generateConfig?.format === "ogg_opus"
                        ? ".ogg"
                        : ".mp3";
                  }
                  const fileName = (record.typeGenerate === "audio" ? "audio" : "image") + ext;
                  galleryservices.downloadFile(record.id, organizationId, fileName);
                  hide && hide();
                  api.success({ message: "Downloaded successfully" });
                } catch (err) {
                  hide && hide();
                  api.error({ message: "Download failed" });
                }
              }}
            />
            {/* Delete */}
            <Button
              icon={<Trash2 size={16} />}
              type="text"
              shape="circle"
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: "Delete this item?",
                  icon: <ExclamationCircleOutlined />,
                  content:
                    "Are you sure you want to delete this item? This action cannot be undone.",
                  okText: "Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: async () => {
                    try {
                      await galleryservices.deleteById(record.id);
                      setData((prev) => {
                        const updated = prev.data.filter(
                          (entry) => entry.id !== record.id,
                        );
                        return { ...prev, data: updated };
                      });
                      api.success({ message: "Deleted" });
                    } catch (err) {
                      api.error({ message: "Delete failed" });
                    }
                  },
                });
              }}
            />
            {/* Share */}
            <Button
              icon={<Share2 size={16} />}
              type="text"
              shape="circle"
              onClick={(e) => {
                e.stopPropagation();
                setShareItem({
                  imageUrl: record.imageUrl,
                  typeGenerate: record.typeGenerate,
                  prompt: record.prompt,
                  url: record.imageUrl, // <-- แนบ link ปัจจุบัน
                });
              }}
            />
            {/* Publish to social — สร้าง task รออนุมัติในแท็บ Public Social
                (ต่างจากปุ่ม Share ด้านบนที่เป็นการแชร์เองแบบเร็ว ๆ) */}
            {onShareToSocial && (
              <Tooltip title="Publish to social">
                <Button
                  icon={<Megaphone size={16} />}
                  type="text"
                  shape="circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareToSocial(record.id);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
  const isEmpty = !loading && getData.data.length === 0;

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
              All generation history in this project
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
              dataSource={getData.data}
              pagination={false}
              size="middle"
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty
                    description="No activity yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </div>

          {!isEmpty && (
            <Flex justify="center">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={(nextPage) => {
                  setPage(nextPage);
                  setLoading(true);
                }}
                showSizeChanger={false}
              />
            </Flex>
          )}
        </Flex>
      )}
      {/* PREVIEW MODAL */}
      {previewItem &&
        (previewItem.typeGenerate === "image" ? (
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
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {previewItem.typeGenerate === "audio" ? (
              <div
                style={{
                  width: "min(480px, 90vw)",
                  padding: 16,
                  borderRadius: 12,
                  background: semantic.colorBgElevated,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <AudioPlayer
                  autoPlay
                  src={previewItem.imageUrl}
                  seed={String(previewItem.id ?? previewItem.imageUrl)}
                  ariaLabel={`Audio: ${previewItem.prompt ?? ""}`}
                />
              </div>
            ) : (
              <video
                src={previewItem.imageUrl}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-50 duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        ))}
      {/* Share Modal */}
      <ShareModal
        open={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
      {/* ImageEditorModal */}
      {imageEditorUrl && (
        <Modal
          open={imageEditorUrl ? true : false}
          onCancel={() => setImageEditorUrl(null)}
          // closeIcon={false}
          footer={null}
          width={1200}
          className="z-[1000000]"
          title="Image Editor"
        >
          <ImageEditor imageUrl={imageEditorUrl} />
        </Modal>
      )}
    </div>
  );
};

export default PromptActivity;
