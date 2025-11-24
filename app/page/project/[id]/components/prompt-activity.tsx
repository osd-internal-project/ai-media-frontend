import React, { useState, type FC, type ReactElement } from "react";
import {
  Button,
  Select,
  Space,
  Image,
  Popover,
  ConfigProvider,
  Empty,
  Form,
  Segmented,
} from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { fallbackImage } from "@/app/utils/fallback";
import { Download, Share2 } from "lucide-react";

const { Option } = Select;

interface props {
  activities: any[];
}

const PromptActivity: FC<props> = ({ activities }): ReactElement => {
  const [selected, setSelected] = useState<any>();
  const onSelectPrompt = (value: any) => {
    setSelected(value);
  };
  return (
    <div className=" p-4 rounded-lg mb-4">
      <div className=" grid sm:grid-cols-2 md:grid-cols-5">
        <div className=" md:col-span-4 grid grid-cols-4 gap-4">
          {activities.map((image, imgIndex) => (
            <div
              key={imgIndex}
              className="relative group w-full h-[200px] text-center "
            >
              <div
                className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300  h-[200px] "
                onClick={() => onSelectPrompt(image)}
              >
                <Image
                  height={"100%"}
                  fallback={fallbackImage}
                  src={image.url}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                  alt={`AI Generated Image ${imgIndex + 1}`}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Popover placement="topRight" content={image.prompt}>
                    <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer">
                      <Share2 className="w-4 h-4 text-gray-800" />
                    </button>
                  </Popover>

                  <button
                    className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110 cursor-pointer"
                    onClick={() => window.open(image, "_blank")}
                  >
                    <Download className="w-4 h-4 text-gray-800" />
                  </button>
                </div>

                {/* Image Number Badge */}
                {/* {message.images && message.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    {imgIndex + 1} / {message.images.length}
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
        <div>
          {selected ? (
            <ConfigProvider
              theme={{
                token: {},
                components: {
                  Segmented: { itemSelectedBg: "#363A3D" },
                  Select: {
                    // Specific Select background
                    // Hover & active background
                    optionSelectedBg: "#363A3D",
                    selectorBg: "#fff",
                  },
                },
              }}
            >
              <Form layout="vertical">
                <div>
                  <div className="text-[24px] font-bold p-4">Info</div>
                  <div className="text-[16px]  p-4 space-y-4">
                    <div>
                      <div>Prompt:</div>
                      <div>{selected.prompt}</div>
                    </div>
                    <div>
                      <Form.Item
                        name="resolution"
                        className="w-full"
                        label={`Resolution`}
                        initialValue={"2k"}
                      >
                        <Segmented<string>
                          options={["2k", "4k"]}
                          size="large"
                          className="w-full"
                          style={{
                            padding: "4px",
                          }}
                          block
                        />
                      </Form.Item>
                      <Form.Item
                        name="imageSize"
                        label={`Image size`}
                        initialValue={"1:1"}
                      >
                        <Select
                          className="w-full"
                          options={[
                            { value: "1:1", label: "1:1" },
                            { value: "1:2", label: "1:2" },
                          ]}
                          style={{ backgroundColor: "#363A3D" }}
                          value={selected?.imageSize || "1:1"}
                        />
                      </Form.Item>
                    </div>

                    <div>
                      <div>Usege:</div>
                      <div className=" flex justify-between">
                        <div>Create by:</div>
                        <div>{selected?.createdBy || "-"}</div>
                      </div>
                      ‰
                      <div className=" flex justify-between">
                        <div>Create Date:</div>{" "}
                        <div>{selected?.createdDate || "-"}</div>
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
