import type { ITFromGenerate } from "@/app/common";
import { Avatar, Button, Form, Input, Popover, Segmented, Slider, Spin, Tabs, Upload, type FormInstance, type UploadProps } from "antd";
import React, { type FC, type ReactElement, useEffect, useRef } from "react";

import {
  PaperClipOutlined,
  SendOutlined,
  TikTokOutlined,
  FacebookOutlined,
  InstagramOutlined,
  WechatWorkOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Download, Share2, Sparkles } from "lucide-react";

export interface props {
  formcreateImage: FormInstance;
  onFinish: (values: ITFromGenerate) => void;
  handleChangeFiles: UploadProps["onChange"];
  beforeUploadFiles: UploadProps["beforeUpload"];
  files: any;
  loading: boolean;
  getdata: any;
  setData: any;
  clicksubmit: boolean;
}

interface Message {
  type: "user" | "ai";
  content: string;
  images?: string[]; // เปลี่ยนเป็น array
  timestamp: Date;
}

const PromptGenerateImage: FC<props> = ({
  formcreateImage,
  onFinish,
  handleChangeFiles,
  beforeUploadFiles,
  files,
  loading,
  getdata,
  setData,
  clicksubmit,
}): ReactElement => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // เมื่อได้ข้อมูลรูปภาพจาก API - รองรับหลายรูป
  useEffect(() => {
    if (getdata?.data && Array.isArray(getdata.data) && getdata.data.length > 0) {
      // แปลง array ของ objects เป็น array ของ URLs
      const imageUrls = getdata.data.map((item: any) => item?.url || item).filter(Boolean);

      if (imageUrls.length > 0) {
        setMessages((prev) => {
          // ตรวจสอบว่ามีรูปภาพเหล่านี้อยู่แล้วหรือไม่
          const lastMessage = prev[prev.length - 1];
          const hasImages = lastMessage?.images && JSON.stringify(lastMessage.images) === JSON.stringify(imageUrls);

          if (!hasImages) {
            return [
              ...prev,
              {
                type: "ai",
                content: `สร้างรูปภาพสำเร็จแล้วค่ะ${imageUrls.length > 1 ? ` (${imageUrls.length} รูป)` : ""}`,
                images: imageUrls,
                timestamp: new Date(),
              },
            ];
          }
          return prev;
        });
      }
    }
  }, [getdata]);

  const handleSubmit = (values: ITFromGenerate) => {
    // เพิ่มข้อความของ user ลงในแชท
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: values.text,
        timestamp: new Date(),
      },
    ]);

    formcreateImage.resetFields(["text"]);
    onFinish(values);
  };

  const content = (
    <div className="grid grid-col-1 items-center max-w-20">
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

  return (
    <Form form={formcreateImage} name="form-generate" autoComplete="off" layout="vertical" onFinish={handleSubmit} initialValues={{ type: "image" }}>
      <div className="w-full grid grid-cols-5 !gap-2">
        <div className="w-full col col-span-4 ">
          {!clicksubmit ? (
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
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    {/* Avatar - ด้านซ้ายสำหรับ AI */}
                    {message.type === "ai" && (
                      <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                    )}

                    {message.type === "user" ? (
                      // User Message
                      <div className="flex gap-3 items-start">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl px-5 py-3 max-w-2xl shadow-lg">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <Avatar size={40} icon={<UserOutlined />} className="bg-gray-700 flex-shrink-0" />
                      </div>
                    ) : (
                      // AI Message with Images
                      <div className="flex flex-col items-start space-y-3 flex-1">
                        <div className="bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl px-5 py-3 max-w-2xl border border-gray-700/50">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>

                        {/* แสดงรูปภาพ */}
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
                            {message.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                                  <img
                                    src={image}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                                    alt={`AI Generated Image ${imgIndex + 1}`}
                                  />

                                  {/* Overlay Gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                  {/* Action Buttons */}
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
                                      <Download className="w-4 h-4 text-gray-800" />
                                    </button>
                                  </div>

                                  {/* Image Number Badge */}
                                  {message.images && message.images.length > 1 && (
                                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                      {imgIndex + 1} / {message.images.length}
                                    </div>
                                  )}
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
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                    <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl flex-1 max-w-2xl">
                      <div className="flex flex-col justify-center items-center space-y-4">
                        <div className="relative">
                          {/* Main Spinner */}
                          <div className="relative z-10">
                            <Spin size="large" />
                          </div>

                          {/* Animated Rings */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center animation-delay-150">
                            <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping" />
                          </div>

                          {/* Sparkle Icon */}
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-5 h-5 text-purple-400" />
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
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                        <PaperClipOutlined className="text-lg" />
                      </div>
                    </Upload>
                  </Form.Item>
                  <Button
                    htmlType="submit"
                    size="large"
                    className=" rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer"
                  >
                    <SendOutlined className="text-lg" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-screen">
          <div className=" text-[24px] font-bold">Configure</div>
          <div className="flex flex-col h-screen ">
            <Tabs defaultActiveKey="1" tabPosition="bottom" className="flex-1" items={items} />
          </div>
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
