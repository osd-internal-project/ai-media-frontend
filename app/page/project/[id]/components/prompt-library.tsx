import React, { useEffect, useState, type FC, type ReactElement } from "react";
import { Image, Empty, ConfigProvider, Form, Pagination, notification, Button } from "antd";
import { fallbackImage } from "@/app/utils/fallback";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import GalleryServices from "@/app/services/gellory.service";
import { axiosCore } from "@/app/lib/axios/axios";
import GenerateImageServices from "@/app/services/generate-image.service";

export interface props {
  shouldRefetch?: boolean;
}

const PromptLibrary: FC<props> = ({ shouldRefetch }): ReactElement => {
  const params = useParams();
  const galleryservices = GalleryServices(axiosCore);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [getData, setData] = useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<any>();
  const [api, contextHolders] = notification.useNotification();

  const onSelectPrompt = (value: any) => {
    setSelected(value);
  };
  useEffect(() => {
    if (loading) {
      fectData();
    }
  }, [loading, page]);

  useEffect(() => {
    if (shouldRefetch) {
      fectData();
    }
  }, [shouldRefetch]);

  const fectData = async () => {
    const id = params.id as string;
    const res = await galleryservices.findActivityById(id, page, pageSize);
    setTotal(res.total);
    setData({ data: res.data, total: res.total });
    setLoading(false);
  };

  const handleOpenImage = async (imageName: string, types: string) => {
    const res =
      types === "vdo"
        ? await GenerateImageServices(axiosCore).downloadVDO(imageName)
        : await GenerateImageServices(axiosCore).downloadImage(imageName);
    const blob = new Blob([res], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = imageName.split("/").pop()!;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-lg mb-4">
      {contextHolders}
      <div className="grid sm:grid-cols-2 md:grid-cols-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-4 sm:col-span-2">
          {getData.data.map((image, imgIndex) => {
            return (
              <div key={imgIndex} className="relative group w-full h-[200px] text-center ">
                <div
                  className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 h-[200px]"
                  onClick={() => onSelectPrompt(image)}
                >
                  {image.typeGenerate === "vdo" ? (
                    <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl h-[200px]">
                      <video controls className="w-full h-full object-cover" preload="metadata">
                        <source src={`/api/vdo/${encodeURIComponent(image.imageUrl)}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <Image
                      preview={false}
                      height={"100%"}
                      fallback={fallbackImage}
                      src={`/api/images/${encodeURIComponent(image.imageUrl)}`}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                      alt={`AI Generated Image ${imgIndex + 1}`}
                    />
                  )}
                  <div className="absolute inset-0 !bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* <Popover placement="topRight" content={image.prompt}>
                      <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer">
                        <Share2 className="w-4 h-4 text-gray-800" />
                      </button>
                    </Popover> */}
                    <button
                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer"
                      onClick={() => handleOpenImage(image.imageUrl, image.typeGenerate)}
                    >
                      <Download className="w-4 h-4 text-gray-800" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="col sm:col-span-2 md:col-span-4 justify-center items-center flex mt-4">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(p) => {
                setPage(p), setLoading(true);
              }}
              showSizeChanger={false}
            />
          </div>
        </div>
        <div>
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
                  <div className="text-[24px] font-bold p-4 flex justify-start gap-2 items-center">
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
                  <div className="text-[16px] p-4 space-y-4">
                    <div>
                      <div>Prompt:</div>
                      <div>{selected.prompt}</div>
                    </div>

                    <div className="flex justify-between">
                      <div>Create by:</div>
                      <div>{selected?.users?.fullname || "-"}</div>
                    </div>

                    <div className="flex justify-between">
                      <div>Create Date:</div>
                      <div>{selected?.createdAt || "-"}</div>
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

export default PromptLibrary;
