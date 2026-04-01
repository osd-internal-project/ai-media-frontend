import React, {
  useEffect,
  useState,
  useRef,
  type FC,
  type ReactElement,
} from "react";
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
  Empty,
} from "antd";
import dynamic from "next/dynamic";
import { Download, ExternalLink, Eye, Loader, Trash2, User } from "lucide-react";
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

const PreviewImage = dynamic(() => import("../../chat-components/preview-image"), { ssr: false });

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

  const [selected, setSelected] = useState<any>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  // =========================
  // PREVIEW HANDLER
  // =========================
  const handlePreview = (item: any) => {
    setPreviewItem(item);
  };
  const handleClosePreview = () => {
    setPreviewItem(null);
  };

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

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const secondaryActionStyle = {
    backgroundColor: aiCaveColors.secondary,
    borderColor: aiCaveColors.secondary,
    color: semantic.colorBgBase,
  };

  const actionButtonStyle = {
    ...secondaryActionStyle,
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const isVideoType = (type?: string) => {
    const normalized = (type || "").toLowerCase();
    return (
      normalized === "video" ||
      normalized === "dreamactor" ||
      normalized === "omnihumen" ||
      normalized === "omnihuman"
    );
  };

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    if (activeKey === "library" && loading) {
      fetchData();
    }
  }, [loading, page]);

  useEffect(() => {
    if (activeKey === "library" && shouldRefetch) {
      fetchData();
    }
  }, [shouldRefetch]);

  const fetchData = async () => {
    if (!session) return;

    const id = params.id as string;

    const res = await galleryservices.findById(
      id,
      organizationId,
      page,
      pageSize,
      true
    );

    setTotal(res.total);
    setData({ data: res.data, total: res.total });
    setLoading(false);
  };

  // =========================
  // SELECT ITEM (RESTORED)
  // =========================
  const onSelectItem = (item: any) => {
    setSelected(item);
  };

  // =========================
  // DOWNLOAD (FIXED)
  // =========================
  const onDownloadFile = async (fileName: string, imageId: string) => {
    setLoadingDownload(true);

    try {
      const response = await galleryservices.downloadFile(
        imageId,
        session?.user?.organizationId || ""
      );

      if (!response) throw new Error("Download failed");

      const url = URL.createObjectURL(response);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "file";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      message.success("Downloaded successfully");
    } catch (error) {
      console.error(error);
      message.error("Download failed");
    }

    setLoadingDownload(false);
  };

  // =========================
  // DELETE
  // =========================
  const handleRemoveFromLibrary = async (record: any) => {
    try {
      await galleryservices.updateStatus(record.id, false);

      setData((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item.id !== record.id),
      }));

      setTotal((prev) => Math.max(0, prev - 1));

      if (selected?.id === record.id) {
        setSelected(null);
      }

      api.success({ message: "Removed" });
    } catch {
      api.error({ message: "Failed to remove" });
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

  // =========================
  // OPEN
  // =========================
  const handleOpenResult = (record: any) => {
    const url = record?.imageUrl || record?.thumbnailUrl;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================
  // PREVIEW
  // =========================
  const renderPreview = (record: any) => {
    const isVideo = isVideoType(record.typeGenerate);

    if (!isVideo) {
      return (
        <Image
          src={record.imageUrl}
          preview={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    // เพิ่ม preload="auto" และย้าย event ไปที่ parent div
    return (
      <video
        ref={(el) => {
          videoRefs.current[record.id] = el;
        }}
        src={record.imageUrl}
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    );
  };

  const displayItems = getData.data;

  // =========================
  // UI
  // =========================
  return (
    <div className="h-full min-h-0 overflow-auto p-4">
      {contextHolders}

      {loading ? (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Loader className="animate-spin" />
        </Flex>
      ) : (
        <Flex vertical gap={16}>
          {/* HEADER */}
          <Flex justify="space-between" align="center">
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Library
              </Typography.Title>
              <Typography.Text type="secondary">
                {total} items
              </Typography.Text>
            </div>
          </Flex>

          {/* GRID */}
          <Row gutter={[16, 16]}>
            {displayItems.map((item, idx) => (
              <Col key={item.id} xs={24} md={12} lg={8}>
                <Card
                  onClick={() => onSelectItem(item)}
                  styles={{ body: { padding: 0 } }}
                  style={{
                    overflow: "hidden",
                    borderColor: semantic.colorBorder,
                    background: semantic.colorBgContainer,
                    borderRadius: 12,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    animation: `fadeInUp 280ms ease ${idx * 35}ms both`,
                  }}
                  className="group"
                >
                  <div
                    className="relative aspect-square overflow-hidden"
                    onMouseEnter={() => {
                      const v = videoRefs.current[item.id];
                      if (v) v.play();
                    }}
                    onMouseLeave={() => {
                      const v = videoRefs.current[item.id];
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
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

                    {/* ACTION BAR */}
                    <Flex
                      align="center"
                      justify="center"
                      gap={8}
                      className="absolute inset-0 bg-black/35 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto"
                      style={{ padding: 8 }}
                    >
                      <Button
                        icon={<Download size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(
                            item.fileName || "file",
                            item.id
                          );
                        }}
                        style={actionButtonStyle}
                      />

                      <Button
                        icon={<ExternalLink size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResult(item);
                        }}
                        style={actionButtonStyle}
                      />

                      <Button
                        icon={<Trash2 size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromLibrary(item);
                        }}
                        style={actionButtonStyle}
                      />
                      <Button
                        icon={<Eye size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(item);
                        }}
                        style={actionButtonStyle}
                      />
                    </Flex>
                  </div>

                  {/* FOOTER */}
                  <div
                    style={{
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 10,
                      minHeight: 146,
                    }}
                  >
                    <Flex
                      wrap="wrap"
                      gap={8}
                      align="center"
                      style={{ rowGap: 4 }}
                    >
                      <Typography.Text
                        style={{
                          fontSize: 12,
                          color: semantic.colorPrimary,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item?.resolution || item?.generateConfig?.resolution || "-"}
                      </Typography.Text>

                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12, maxWidth: "44%" }}
                        ellipsis
                      >
                        {item?.generateConfig?.modelName || "Unknown"}
                      </Typography.Text>

                      <Typography.Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          maxWidth: "52%",
                        }}
                        ellipsis
                      >
                        <User size={12} />
                        {item?.users?.fullname || item?.users?.username || "-"}
                      </Typography.Text>
                    </Flex>

                    <Typography.Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        marginBottom: 0,
                        minHeight: 40,
                        fontStyle: "italic",
                        color: semantic.colorTextSecondary,
                      }}
                    >
                      {`"${item.prompt || "-"}"`}
                    </Typography.Paragraph>

                    <Flex justify="space-between" align="center">
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </Typography.Text>

                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </Typography.Text>
                    </Flex>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* PAGINATION */}
          {displayItems.length > 0 && (
            <Flex justify="center">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={(p) => {
                  setPage(p);
                  setLoading(true);
                }}
                showSizeChanger={false}
              />
            </Flex>
          )}

          {/* EMPTY */}
          {!displayItems.length && <Empty />}
        </Flex>
      )}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.ant-card.group:hover) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.14);
        }

        :global(.ant-card.group video),
        :global(.ant-card.group img) {
          transition: transform 260ms ease;
        }

        :global(.ant-card.group:hover video),
        :global(.ant-card.group:hover img) {
          transform: scale(1.03);
        }
      `}</style>
      {/* PREVIEW MODAL */}
      {previewItem && (
        previewItem.typeGenerate === "image" ? (
          <PreviewImage
            closePreview={handleClosePreview}
            previewImage={previewItem.imageUrl}
          />
        ) : (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClosePreview}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={handleClosePreview}
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

export default PromptLibrary;