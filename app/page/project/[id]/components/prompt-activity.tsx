import React, { use, useEffect, useState, type FC, type ReactElement } from "react";
import { Button, Select, Space, Image, Popover, ConfigProvider, Empty, Form, Segmented, Pagination } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { fallbackImage } from "@/app/utils/fallback";
import { Download, Share2 } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import { useParams } from "next/navigation";

const PromptActivity: FC = ({}): ReactElement => {
  const params = useParams();
  const galleryservices = GalleryServices(axiosCore);
  const [selected, setSelected] = useState<any>();
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [getData, setData] = useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  const onSelectPrompt = (value: any) => {
    setSelected(value);
  };

  useEffect(() => {
    if (loading) {
      fectData();
    }
  }, [loading, page]);

  const fectData = async () => {
    const id = params.id as string;
    const res = await galleryservices.findById(id, page, pageSize);
    setTotal(res.total);
    setData({ data: res.data, total: res.total });
    setLoading(false);
  };
  return (
    <div className="p-4 rounded-lg mb-4">
      <div className="grid sm:grid-cols-2 md:grid-cols-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-4 sm:col-span-2">
          {getData.data.map((image, imgIndex) => {
            console.log(image);

            return (
              <div key={imgIndex} className="relative group w-full h-[200px] text-center ">
                <div
                  className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 h-[200px]"
                  onClick={() => onSelectPrompt(image)}
                >
                  {image.typeGenerate === "vdo" ? (
                    <video src={image.imageUrl} controls className="w-full h-auto object-cover" preload="metadata">
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      height={"100%"}
                      fallback={fallbackImage}
                      src={image.imageUrl}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                      alt={`AI Generated Image ${imgIndex + 1}`}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Popover placement="topRight" content={image.prompt}>
                      <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer">
                        <Share2 className="w-4 h-4 text-gray-800" />
                      </button>
                    </Popover>

                    <button
                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer"
                      onClick={() => window.open(image.imageUrl, "_blank")}
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

        {/* RIGHT: Info sidebar */}
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
                  <div className="text-[24px] font-bold p-4">Info</div>
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

export default PromptActivity;
