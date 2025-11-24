import type { ITFromGenerate } from "@/app/common";
import { Avatar, Button, Form, Input, message, Popover, Segmented, Slider, Tabs, Upload, UploadFile, UploadProps } from "antd";
import React, { type FC, type ReactElement, useEffect, useRef, useState } from "react";

import {
  PaperClipOutlined,
  SendOutlined,
  TikTokOutlined,
  FacebookOutlined,
  InstagramOutlined,
  WechatWorkOutlined,
  UserOutlined,
  RobotOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { Download, Share2, Sparkles } from "lucide-react";
import GenerateImageServices from "@/app/services/generate-image.service";
import { axiosCore } from "@/app/lib/axios/axios";
import type { RcFile } from "antd/es/upload";
import LogsServices from "@/app/services/logs.service";
import GalleryServices from "@/app/services/gellory.service";

export interface props {
  projectId?: string;
  userId?: string;
}

const PromptGenerateImage: FC<props> = ({ projectId, userId }): ReactElement => {
  const [formcreateImage] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [gethistory, setHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
    if (loading) {
      fecthdata();
    }
  }, [loading, submitting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
          content: "AICave Generated Vdo",
          images: item.imageUrls,
          username: "AICave",
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

  const onFinish = async (values: ITFromGenerate) => {
    setCurrentPrompt(values.text);
    setSubmitting(true);
    let base: ITFromGenerate = values;
    if (files.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      formData.append("files", files[0].originFileObj);
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload.fileName };
    }
    try {
      const response = await GenerateImageServices(axiosCore).create({ ...base, projectId: projectId, userId: userId });
      if (Array.isArray(response.data) && response.data.length > 0) {
        message.success("สร้างคำขอสำเร็จ");
        formcreateImage.resetFields();
        setFiles([]);
        setCurrentPrompt("");
        // Fetch ข้อมูลใหม่
        await fecthdata();
      } else {
        message.error("ไม่มีข้อมูลที่ได้กลับมา");
      }
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
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
      <Button block className="!flex !justify-between !items-center">
        <TikTokOutlined /> <span>Tiktok</span>
      </Button>
      <Button block className="!flex !justify-between !items-center">
        <FacebookOutlined />
        <span>Facebook</span>
      </Button>
      <Button block className="!flex !justify-between !items-center">
        <InstagramOutlined /> <span>Instagram</span>
      </Button>
      <Button block className="!flex !justify-between !items-center">
        <WechatWorkOutlined /> <span>Line</span>
      </Button>
    </div>
  );

  const items = [
    {
      key: "1",
      label: "Configure",
      children: (
        <div>
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
    { key: "2", label: "Prompt Guide", children: <div>Content 2</div> },
  ];

  const RES_MAP = {
    "2k": 2048,
    "4k": 4096,
  } as any;

  const RATIO_MAP = {
    "1:1": 1 / 1,
    "3:4": 3 / 4,
    "4:3": 4 / 3,
    "9:16": 9 / 16,
    "16:9": 16 / 9,
    "2:3": 2 / 3,
    "3:2": 3 / 2,
    "21:9": 21 / 9,
  } as any;

  const handleValuesChange = (changed: any, all: any) => {
    if (changed.resolution || changed.ratio) {
      const base = RES_MAP[all.resolution];
      const ratio = RATIO_MAP[all.ratio];
      let width = base;
      let height = Math.round(base / ratio);
      formcreateImage.setFieldsValue({
        width,
        height,
      });
    }
  };

  return (
    <Form
      form={formcreateImage}
      name="form-generate"
      autoComplete="off"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ type: "image" }}
      onValuesChange={handleValuesChange}
    >
      <div className="w-full grid grid-cols-5 !gap-2">
        <div className="w-full col col-span-4 ">
          {gethistory.length === 0 && !submitting ? (
            <div className="text-white mt-10">
              <h1 className="text-4xl font-light text-center mb-4">AI Cave : Seedream 4.0</h1>
              <p className="text-gray-400 text-center mb-12">
                Kickstart your innovation process with our comprehensive selection of predefined prompts.
              </p>
              <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-6">Scene & Objects</h3>
                  <div className="!space-y-3">
                    {["Landscape", "Creatures", "Character Design", "Props & Items"].map((item) => (
                      <button
                        key={item}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{item}</span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">✏️</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-6">Art Direction</h3>
                  <div className="!space-y-3">
                    {["Art Styles", "Lighting & Mood", "Color Palettes", "Composition"].map((item) => (
                      <button
                        key={item}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{item}</span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-6">Branding & Visuals</h3>
                  <div className="!space-y-3">
                    {["Product Showcase", "Social Media Visuals", "Campaign Moodboards", "Social media posts"].map((item) => (
                      <button
                        key={item}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{item}</span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              {/* Chat Messages */}
              <div className="mb-8 space-y-6">
                {gethistory.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    {/* Avatar AI */}
                    {message.type === "ai" && (
                      <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                    )}

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

                        <div className="bg-gray-800/50 text-white rounded-2xl px-5 py-3 max-w-2xl border border-gray-700/50">
                          <p className="text-sm leading-relaxed">{message.content}</p>
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
                            {message.images.map((image: any, imgIndex: number) => (
                              <div key={imgIndex} className="relative group">
                                {/* --- FRAME ของรูป --- */}
                                <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-300">
                                  <img
                                    src={image}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                                  />

                                  {/* --- OVERLAY GRADIENT --- */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                  {/* --- ACTION BUTTONS (ต่อรูป) --- */}
                                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Popover placement="topRight" content={content}>
                                      <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110">
                                        <Share2 className="w-4 h-4 text-gray-800" />
                                      </button>
                                    </Popover>

                                    <button
                                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                      onClick={() => window.open(image, "_blank")}
                                    >
                                      <Download className="w-4 h-4 !text-gray-800" />
                                    </button>
                                  </div>

                                  {/* --- IMAGE NUMBER (optional) --- */}
                                  {message.images.length > 1 && (
                                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                      {imgIndex + 1} / {message.images.length}
                                    </div>
                                  )}
                                  {/* --- LIKE BUTTON --- */}
                                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                      onClick={() => updateShareOptions(message.taskId, image, message.status)}
                                      className="p-2 !bg-transparent hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                    >
                                      <LikeOutlined className={`w-4 h-4 ${message.status ? `!text-red-800` : `!text-gray-800`}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Enhanced Loading State */}
                {submitting && (
                  <>
                    {/* User's prompt message */}
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
                      <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                      <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl flex-1 max-w-2xl">
                        <div className="flex flex-col justify-center items-center space-y-4">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center animation-delay-150">
                              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping" />
                            </div>
                          </div>
                          <div className="text-center space-y-1">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                              กำลังสร้างรูปภาพ AI
                            </h3>
                            <p className="text-gray-400 text-sm">โปรดรอสักครู่...</p>
                            {/* Progress Dots */}
                            <div className="flex justify-center gap-1.5 pt-2">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce animation-delay-150" />
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce animation-delay-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {loading && !submitting && (
                  <div className="flex gap-3 justify-start">
                    <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                    <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl flex-1 max-w-2xl">
                      <div className="flex flex-col justify-center items-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center animation-delay-150">
                            <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            กำลังสร้างรูปภาพ AI
                          </h3>
                          <p className="text-gray-400 text-sm">โปรดรอสักครู่...</p>
                          {/* Progress Dots */}
                          <div className="flex justify-center gap-1.5 pt-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce animation-delay-150" />
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce animation-delay-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className=" w-full max-w-4xl mt-20">
              <Form.Item name="type" hidden>
                <Input />
              </Form.Item>
              <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden ">
                <Form.Item name="text" className="mb-0" rules={[{ required: true, message: "กรุณากรอก prompt!" }]}>
                  <Input.TextArea
                    placeholder="Describe the image you want to generate"
                    className="bg-transparent border-none text-zinc-300 placeholder:text-zinc-600 resize-none"
                    style={{
                      fontSize: "16px",
                      padding: "20px 24px",
                      minHeight: "120px",
                      boxShadow: "none",
                    }}
                    autoSize={{ minRows: 1, maxRows: 8 }}
                    disabled={submitting}
                  />
                </Form.Item>

                <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800">
                  <Form.Item name="image" className="mb-0">
                    <Upload
                      fileList={files}
                      onChange={handleChangeFiles}
                      beforeUpload={beforeUploadFiles}
                      multiple={false}
                      maxCount={1}
                      showUploadList={false}
                      disabled={submitting}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                        <PaperClipOutlined className="text-lg" />
                      </div>
                    </Upload>
                  </Form.Item>
                  <Button
                    htmlType="submit"
                    size="large"
                    disabled={submitting}
                    className=" rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SendOutlined className="text-lg" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-screen">
          <div className="text-[24px] font-bold p-4">Configure</div>
          <Tabs defaultActiveKey="1" tabPosition="bottom" className="flex-1 flex flex-col" items={items} tabBarStyle={{ marginTop: "auto" }} />
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
  );
};

export default PromptGenerateImage;
