import type { ITFromGenerate } from "@/app/common";
import { Avatar, Button, Form, Input, message, Popover, Segmented, Slider, Tabs, Upload, UploadFile, UploadProps, Image, notification } from "antd";
import React, { type FC, type ReactElement, useEffect, useRef, useState } from "react";
import Avatars from "@/public/images/Avatar.png";

import {
  PaperClipOutlined,
  SendOutlined,
  TikTokOutlined,
  FacebookOutlined,
  InstagramOutlined,
  WechatWorkOutlined,
  UserOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { Download, Share2, Sparkles, Trash } from "lucide-react";
import GenerateImageServices from "@/app/services/generate-image.service";
import { axiosCore } from "@/app/lib/axios/axios";
import type { RcFile } from "antd/es/upload";
import LogsServices from "@/app/services/logs.service";
import GalleryServices from "@/app/services/gellory.service";
import type { StaticImageData } from "next/image";
import PromptGuideServices from "@/app/services/prompt-guide.service";

export interface props {
  projectId?: string;
  userId?: string;
  shouldRefetch?: boolean;
}

const PromptGenerateImage: FC<props> = ({ projectId, userId, shouldRefetch }): ReactElement => {
  const promptguideService = PromptGuideServices(axiosCore);
  const [masterdataPromptGuide, setMasterdataPromptGuide] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const contentRef = useRef<HTMLDivElement>(null);
  const [formcreateImage] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [gethistory, setHistory] = useState<any[]>([]);
  const [api, contextHolders] = notification.useNotification();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined; // สำหรับใช้ Clear Timeout

    if (projectId && !submitting) {
      // 🟢 แก้ไข: ใช้ setTimeout หน่วงเวลาเรียก fecthdata
      timer = setTimeout(() => {
        // ต้องเรียกใช้ fecthdata() ภายในฟังก์ชัน Callback
        fecthdata();
      }, 2000); // หน่วงเวลา 3 วินาที
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [projectId, submitting]);

  useEffect(() => {
    if (projectId) {
      fecthdata();
    }
    masterdata();
  }, [projectId]);

  useEffect(() => {
    if (shouldRefetch) {
      fecthdata();
    }
  }, [shouldRefetch]);

  useEffect(() => {
    if (contentRef.current) {
      const timer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [gethistory, loading]);

  const fecthdata = async () => {
    setLoading(true);
    try {
      const response = await LogsServices(axiosCore).findById(projectId as string);
      const messages: any[] = [];
      response.forEach((item: any) => {
        messages.push({
          type: "user",
          content: item.prompt,
          username: item.users.fullname,
          time: item.createdAt,
          taskId: item.taskId,
          status: item.status,
        });
        // AI message
        messages.push({
          type: "ai",
          content: "AICave Generated Images",
          images: item.imageUrls,
          username: "AI Generator",
          time: item.createdAt,
          taskId: item.taskId,
          status: item.status,
        });
      });

      setHistory(messages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch logs:", err);
    }
  };

  const masterdata = async () => {
    const response = await promptguideService.findAll();
    const grouped = response.reduce((acc: any, item) => {
      const key = item.typeName || "Others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    setMasterdataPromptGuide(grouped);
  };
  const onFinish = async (values: ITFromGenerate) => {
    setCurrentPrompt(values.text);
    setSubmitting(true);
    let base: ITFromGenerate = values;
    if (files.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      files.forEach((file) => {
        formData.append("files", file.originFileObj);
      });
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload };
    }
    try {
      const response = await GenerateImageServices(axiosCore).create({
        ...base,
        projectId,
        userId,
      });

      if (response.status === 400) {
        messageApi.open({
          type: "error",
          content: `${response.data}`,
        });
        setSubmitting(false);
        return true;
      }

      formcreateImage.resetFields();
      setFiles([]);
      setCurrentPrompt("");
      setSubmitting(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      messageApi.open({
        type: "error",
        content: msg,
      });
      setSubmitting(false);
    }
  };

  const updateShareOptions = async (taskId: string, imageUrl: string, status: boolean) => {
    const update = await GalleryServices(axiosCore).updateShareOptions(taskId, imageUrl, status);
    if (update) {
      message.success("อัปเดตสถานะการแชร์เรียบร้อยแล้ว");
      setLoading(true);
    }
  };

  const beforeUploadFiles = (file: RcFile) => {
    if (files.find((oneFile) => oneFile.name === file.name)) {
      message.warning(`ชื่อไฟล์ ${file.name} ซ้ำ`);
      return false;
    }
    return false;
  };
  const handleChangeFiles: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
    return setFiles(newFileList);
  };

  const content = (
    <div className="grid grid-col-1 items-center gap-2">
      <Button htmlType="button" block className="!flex !justify-between !items-center">
        <TikTokOutlined /> <span>Tiktok</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-between !items-center">
        <FacebookOutlined />
        <span>Facebook</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-between !items-center">
        <InstagramOutlined /> <span>Instagram</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-between !items-center">
        <WechatWorkOutlined /> <span>Line</span>
      </Button>
    </div>
  );

  const items = [
    {
      key: "1",
      label: "Configure",
      children: (
        <div className="mt-3">
          <Form.Item name="resolution" className="w-full" label={`Resolution`} initialValue={"2k"}>
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
          <Form.Item name="ratio" label={`Ratio`} initialValue={"1:1"}>
            <Segmented options={["1:1", "3:4", "4:3", "9:16", "16:9", "2:3", "3:2", "21:9"]} className="segmented-grid w-full" block />
          </Form.Item>
          <div className="!my-3">
            <span>Image Size</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Form.Item name="width" valuePropName="value" initialValue={2048}>
              <Input
                type="number"
                prefix={`W`}
                styles={{
                  prefix: {
                    marginRight: "8px",
                  },
                }}
              />
            </Form.Item>
            <Form.Item name="height" valuePropName="value" initialValue={2048}>
              <Input
                type="number"
                prefix={`H`}
                styles={{
                  prefix: {
                    marginRight: "8px",
                  },
                }}
              />
            </Form.Item>
          </div>
          <Form.Item name="images" valuePropName="value" initialValue={1} label="Number of Images">
            <Slider min={1} max={10} />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "2",
      label: "Prompt Guide",
      children: (
        <div className="mt-2">
          {Object.entries(masterdataPromptGuide).map(([groupName, items]) => (
            <div key={groupName} className="mb-6">
              <h3 className="">{groupName}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {items.map((item: any) => (
                  <Button
                    htmlType="button"
                    key={item.id}
                    size="large"
                    onClick={() => {
                      navigator.clipboard.writeText(item.textPrompt);
                      api.success({
                        message: `Copied`,
                        description: `${item.title}`,
                      });
                    }}
                    className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                  >
                    <span className="flex-1 text-left">{item.title}</span>
                    <span className="ml-auto">→</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const RATIO_SIZE_MAP = {
    "1:1": { width: 2048, height: 2048 },
    "4:3": { width: 2304, height: 1728 },
    "3:4": { width: 1728, height: 2304 },
    "16:9": { width: 2560, height: 1440 },
    "9:16": { width: 1440, height: 2560 },
    "3:2": { width: 2496, height: 1664 },
    "2:3": { width: 1664, height: 2496 },
    "21:9": { width: 3024, height: 1296 },
  } as any;

  const handleValuesChange = (changed: any, all: any) => {
    if (changed.resolution || changed.ratio) {
      const baseSize = RATIO_SIZE_MAP[all.ratio];
      if (!baseSize) return;
      const factor = all.resolution === "4k" ? 2 : 1;
      const width = baseSize.width * factor;
      const height = baseSize.height * factor;
      formcreateImage.setFieldsValue({
        width,
        height,
      });
    }
  };
  const handleOpenImage = async (taskId: string, imageName: string) => {
    const res = await GenerateImageServices(axiosCore).downloadImage(imageName);
    const blob = new Blob([res], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = imageName.split("/").pop()!;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {contextHolders}
      {contextHolder}
      <Form
        form={formcreateImage}
        name="form-generate"
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: "image" }}
        onValuesChange={handleValuesChange}
      >
        <div className="w-full grid grid-cols-5 gap-2">
          <div className="w-full col col-span-4 h-[calc(90vh-62px)] flex flex-col">
            {gethistory.length === 0 && !submitting && !loading ? (
              <div className="text-white pt-10 px-5 flex-1 overflow-auto">
                <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedream 4.5`}</h1>
                <p className="text-gray-400 text-center mb-10">
                  {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
                </p>
                <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3">{`Scene & Objects`}</h3>
                    <div className="space-y-3 w-full">
                      {["Landscape", "Creatures", "Character Design", "Props & Items"].map((item) => (
                        <Button
                          htmlType="button"
                          key={item}
                          className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                        >
                          <span className="flex-1 text-left">{item}</span>
                          <span className="ml-auto">→</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-2xl">✏️</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3">{`Art Direction`}</h3>
                    <div className="space-y-3">
                      {["Art Styles", "Lighting & Mood", "Color Palettes", "Composition"].map((item) => (
                        <Button
                          htmlType="button"
                          key={item}
                          className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300 !border-none"
                        >
                          <span className="flex-1 text-left">{item}</span>
                          <span className="ml-auto">→</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-2xl">💡</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3">{`Branding & Visuals`}</h3>
                    <div className="space-y-3">
                      {["Product Showcase", "Social Media Visuals", "Campaign Moodboards", "Social media posts"].map((item) => (
                        <Button
                          htmlType="button"
                          key={item}
                          className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300 !border-none"
                        >
                          <span className="flex-1 text-left">{item}</span>
                          <span className="ml-auto">→</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={contentRef} className="h-[600px] overflow-y-scroll pr-2 mt-2 hide-scrollbar scroll-smooth">
                {/* Chat Messages */}
                <div className="mb-8 space-y-6 px-2">
                  {gethistory.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      {/* Avatar AI */}
                      {message.type === "ai" && <Avatar size={40} src={(Avatars as StaticImageData).src} />}
                      {/* User message */}
                      {message.type === "user" ? (
                        <div className="flex flex-col items-end gap-1 max-w-2xl">
                          <div className="text-xs text-gray-400">
                            {message.username} • {new Date(message.time).toLocaleString()}
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl px-5 py-3 shadow-lg">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            <Avatar size={40} icon={<UserOutlined />} className="bg-gray-700 flex-shrink-0" />
                          </div>
                        </div>
                      ) : (
                        // AI message
                        <div className="flex flex-col items-start space-y-3 flex-1">
                          <div className="text-xs text-gray-400">
                            {message.username} • {new Date(message.time).toLocaleString()}
                          </div>
                          {/* Images */}
                          {message.images && message.images.length > 0 && (
                            <div
                              className={`grid gap-4 w-full ${
                                message.images.length === 1
                                  ? "grid-cols-1 max-w-md"
                                  : message.images.length === 2
                                  ? "grid-cols-2 max-w-2xl"
                                  : message.images.length === 3
                                  ? "grid-cols-3 max-w-3xl"
                                  : "grid-cols-2 lg:grid-cols-4 max-w-4xl"
                              }`}
                            >
                              <Image.PreviewGroup>
                                {message.images.map((image: any, imgIndex: number) => (
                                  <div key={imgIndex} className="relative group">
                                    <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-300">
                                      <Image
                                        src={`/api/images/${encodeURIComponent(image)}`}
                                        preview={{
                                          mask: false,
                                        }}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        alt={`Image ${imgIndex + 1}`}
                                      />
                                      {/* --- ACTION BUTTONS (ต่อรูป) --- */}
                                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Popover placement="topRight" content={content}>
                                          <Button
                                            htmlType="button"
                                            className="p-2 !bg-transparent hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                          >
                                            <Share2 className="w-4 h-4 !text-gray-800" />
                                          </Button>
                                        </Popover>

                                        <Button
                                          htmlType="button"
                                          className="p-2 !bg-transparent hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                          onClick={() => handleOpenImage(message.taskId, image)}
                                        >
                                          <Download className="w-4 h-4 !text-gray-800" />
                                        </Button>
                                        {/* --- LIKE BUTTON --- */}

                                        <Button
                                          htmlType="button"
                                          onClick={() => updateShareOptions(message.taskId, image, message.status)}
                                          className="p-2 !bg-transparent !hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                        >
                                          <LikeOutlined className={`w-4 h-4 ${message.status ? `!text-red-800` : `!text-gray-800`}`} />
                                        </Button>
                                      </div>
                                      {message.images.length > 1 && (
                                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                          {imgIndex + 1} / {message.images.length}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </Image.PreviewGroup>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Enhanced Loading State */}
                  {submitting && (
                    <>
                      <div className="flex gap-3 justify-end">
                        <div className="flex flex-col items-end gap-1 max-w-2xl">
                          <div className="text-xs text-gray-400">You • {new Date().toLocaleString()}</div>
                          <div className="flex gap-3 items-start">
                            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl px-5 py-3 shadow-lg">
                              <p className="text-sm leading-relaxed">{currentPrompt}</p>
                            </div>
                            <Avatar size={40} icon={<UserOutlined />} className="bg-gray-700 flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                      {/* AI generating state */}
                      <div className="flex gap-3 justify-start">
                        <Avatar size={40} src={(Avatars as StaticImageData).src} />

                        {/* Typing bubble */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none px-5 py-4 shadow-lg">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0s", animationDuration: "1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.15s", animationDuration: "1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.3s", animationDuration: "1s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-10 px-10">
              <div className=" w-full ">
                <Form.Item name="type" hidden>
                  <Input />
                </Form.Item>
                <div>
                  <Form.Item name="text" className="mb-0">
                    <Input.TextArea
                      placeholder="Describe the image you want to generate"
                      className="bg-transparent border-none text-zinc-300 placeholder:text-zinc-600 resize-none"
                      style={{
                        fontSize: "14px",
                        padding: "20px 24px",
                        minHeight: "100px",
                        boxShadow: "none",
                      }}
                      autoSize={{ minRows: 1, maxRows: 8 }}
                      disabled={submitting}
                    />
                  </Form.Item>
                  <div className="flex items-center justify-between px-2 pb-4">
                    <Form.Item name="image" className="mb-0" style={{ marginBottom: 0, lineHeight: 1 }}>
                      <Upload
                        listType="picture"
                        fileList={files}
                        onChange={handleChangeFiles}
                        beforeUpload={beforeUploadFiles}
                        multiple={true}
                        maxCount={4}
                        showUploadList={true}
                        disabled={submitting}
                        itemRender={(originNode, file, fileList, actions) => {
                          return (
                            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2">
                              <img src={file.thumbUrl} alt="" className="w-12 h-12 object-cover rounded" />
                              <Button size="small" htmlType="button" onClick={actions.remove} type="link" danger>
                                <Trash width={15} />
                              </Button>
                            </div>
                          );
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                          <PaperClipOutlined className="text-lg" />
                        </div>
                      </Upload>
                    </Form.Item>
                    <Form.Item className="mb-0" style={{ marginBottom: 0, lineHeight: 1 }}>
                      <Button
                        htmlType="submit"
                        size="large"
                        disabled={submitting}
                        className="w-10 h-10 rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center !border-none !text-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
                      >
                        <SendOutlined className="text-lg" />
                      </Button>
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col pr-1">
            <div className="text-[24px] font-bold">{`Configure`}</div>
            <Tabs
              size="large"
              type="card"
              defaultActiveKey="1"
              tabPosition="bottom"
              className="flex-1 flex flex-col 
    [&_.ant-tabs-nav]:!w-full 
    [&_.ant-tabs-nav-list]:!w-full 
    [&_.ant-tabs-nav-list]:!flex 
    [&_.ant-tabs-tab]:!flex-1 
    [&_.ant-tabs-tab]:!justify-center
    [&_.ant-tabs-tab]:!m-0
    [&_.ant-tabs-content-holder]:!rounded-t-xl"
              items={items}
              tabBarStyle={{
                marginTop: "auto",
                margin: 0,
                marginBottom: -1,
              }}
              tabBarGutter={0}
              style={{
                padding: 0,
              }}
            />
          </div>
        </div>

        <style>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
      </Form>
    </div>
  );
};

export default PromptGenerateImage;
