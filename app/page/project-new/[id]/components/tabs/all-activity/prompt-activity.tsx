import React, { useEffect, useState, type FC, type ReactElement } from "react";
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
import type { ColumnsType } from "antd/es/table";
import { Loader2, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

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
        background: "#e6f7ff",
        borderColor: "#91d5ff",
      };
    }

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
      color: "#1890ff",
      background: "#e6f7ff",
      borderColor: "#91d5ff",
    };
  };

  const columns: ColumnsType<any> = [
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "preview",
      width: 140,
      render: (_, record) => (
        <div
          style={{
            width: 112,
            height: 64,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${semantic.colorBorder}`,
          }}
        >
          {record.typeGenerate === "image" ? (
            <Image
              src={record.imageUrl}
              alt={record.prompt || "preview"}
              preview={false}
              width={112}
              height={64}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <video
              src={record.imageUrl}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ),
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
        const isInLibrary = Boolean(record?.status);

        if (isInLibrary) return null;

        return (
          <Button
            icon={
              loadingButton === record.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Star size={16} />
              )
            }
            onClick={() => onSubmitToLibrary(record)}
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
    </div>
  );
};

export default PromptActivity;
