import React, { useEffect, useState, type FC, type ReactElement } from "react";
import {
  Image,
  ConfigProvider,
  Empty,
  Form,
  Pagination,
  notification,
  Button,
  message,
  Typography,
  Tooltip,
} from "antd";
import { fallbackImage } from "@/app/utils/fallback";
import { Download, Info, Loader } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useParams } from "next/navigation";
import GenerateImageServices from "@/app/services/generate-image.service";
import VideoItem from "./video-player";
import { useSession } from "next-auth/react";

export interface props {
  shouldRefetch?: boolean;
  activeKey: string;
}

const PromptActivity: FC<props> = ({
  shouldRefetch,
  activeKey,
}): ReactElement => {
  const params = useParams();
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId || "";
  const galleryservices = GalleryServices(axiosCore);
  const [selected, setSelected] = useState<any>();
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;
  const [getData, setData] = useState<{ data: any[]; total: number }>({
    data: [],
    total: 0,
  });
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [api, contextHolders] = notification.useNotification();

  const onSelectPrompt = (value: any) => {
    setSelected(value);
  };

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

  const handleOpenImage = async (imageUrl: string, types: string) => {
    try {
      // Extract filename from URL (before query parameters)
      const urlWithoutParams = imageUrl.split("?")[0];
      const filename =
        urlWithoutParams.split("/").pop() ||
        (types === "video" ? "video.mp4" : "image.jpg");

      // Show loading message
      const hide = message.loading(
        `Downloading ${types === "video" ? "video" : "image"}...`,
        0,
      );

      // Fetch the file directly from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      hide();
      message.success(
        `${types === "video" ? "Video" : "Image"} downloaded successfully`,
      );
    } catch (error) {
      console.error("Download error:", error);
      message.error("Download failed");
    }
  };

  // const onDownloadVideo = async (videoUrl: string) => {
  //   try {
  //     // Extract filename from URL (before query parameters)
  //     const urlWithoutParams = videoUrl.split("?")[0];
  //     const filename = urlWithoutParams.split("/").pop() || "video.mp4";

  //     // Show loading message for larger files
  //     const hide = message.loading("Downloading video...", 0);

  //     // Fetch the video directly from the URL
  //     const response = await fetch(videoUrl);
  //     if (!response.ok) throw new Error("Download failed");

  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = filename;
  //     link.click();
  //     URL.revokeObjectURL(url);

  //     hide();
  //     message.success("Video downloaded successfully");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     message.error("Download failed");
  //   }
  // };
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

  return (
    <div className="h-[calc(100vh-160px)]">
      {contextHolders}
      <div className="grid sm:grid-cols-2 md:grid-cols-5 h-full p-4 gap-6">
        <div className="md:col-span-4 sm:col-span-2 flex flex-col h-full pr-6 border-r border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 content-start overflow-y-auto">
            {getData.data.map((image, imgIndex) => {
              return (
                <div
                  key={imgIndex}
                  className="relative group w-full h-[200px] text-center "
                >
                  <div
                    className="relative overflow-hidden rounded-xl  border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 h-[200px]"
                    onClick={() => onSelectPrompt(image)}
                  >
                    {image.typeGenerate === "video" ? (
                      <div>
                        <VideoItem
                          key={imgIndex}
                          videoData={image}
                          onDownloadVideo={onDownloadFile}
                          onShareVideo={function (
                            taskId: string,
                            status: boolean,
                          ): void {
                            throw new Error("Function not implemented.");
                          }}
                          shareStatus={false}
                        />
                        <div className="absolute bottom-0 left-0 w-full py-2 bg-black/80 backdrop-blur-md border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center z-20">
                          <span className="text-[11px] font-medium text-gray-200 flex items-center gap-1.5 tracking-wide">
                            <Info className="w-3.5 h-3.5 text-purple-400" />
                            More Info
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={image.imageUrl}
                        loading="lazy"
                        alt="Video thumbnail"
                        width="100%"
                        height="100%"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    <div className="absolute inset-0 !bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        disabled={loadingDownload}
                        hidden={image.typeGenerate === "video"}
                        className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer"
                        onClick={() =>
                          onDownloadFile(image.fileName || "image", image.id)
                        }
                      >
                        {loadingDownload ? (
                          <Loader className="w-4 h-4 text-gray-800" />
                        ) : (
                          <Download className="w-4 h-4 text-gray-800" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center mt-4 pt-4">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(p) => {
                (setPage(p), setLoading(true));
              }}
              showSizeChanger={false}
            />
          </div>
        </div>

        {/* RIGHT: Info sidebar */}
        <div className="pl-2">
          {selected ? (
            <ConfigProvider
              theme={{
                token: {},
                components: {
                  Segmented: { itemSelectedBg: "#363A3D" },
                  Select: {
                    optionSelectedBg: "#363A3D",
                    selectorBg: "#fff",
                  },
                },
              }}
            >
              <Form layout="vertical">
                <div>
                  <div className="text-[24px] font-bold flex justify-start gap-2 items-center">
                    Info
                    <Button
                      htmlType="button"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(selected.prompt);
                        api.success({
                          message: `Copied`,
                          description: `${selected.prompt}`,
                        });
                      }}
                      className="!bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                    >{`copied`}</Button>
                  </div>
                  <div className="text-[16px]  space-y-4">
                    <div>
                      <div>Prompt:</div>
                      <div>
                        {selected.prompt.length > 0 && (
                          <Tooltip
                            placement="left"
                            title={selected.prompt}
                            overlayStyle={{ maxWidth: "600px" }}
                          >
                            <Typography.Paragraph
                              ellipsis={{
                                rows: 20,
                              }}
                              className="!text-gray-200 !mb-0"
                            >
                              {selected.prompt}
                            </Typography.Paragraph>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>Create by:</div>
                      <div>{selected?.users?.fullname || "-"}</div>
                    </div>

                    <div>
                      <div>Create Date:</div>
                      <div className="whitespace-pre-line">
                        {selected?.createdAt
                          ? `${new Date(selected.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}`
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </ConfigProvider>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptActivity;
