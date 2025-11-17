import type { ITFromGenerate } from "@/app/common";
import { Button, Form, Input, Popover, Spin, Upload, type FormInstance, type UploadProps } from "antd";
import React, { type FC, type ReactElement, useEffect, useRef } from "react";

import { PaperClipOutlined, SendOutlined, TikTokOutlined, FacebookOutlined, InstagramOutlined, WechatWorkOutlined } from "@ant-design/icons";
import { Download, Share2 } from "lucide-react";

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
  image?: string;
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

  // เมื่อได้ข้อมูลรูปภาพจาก API
  useEffect(() => {
    if (getdata?.data && Array.isArray(getdata.data) && getdata.data.length > 0 && getdata.data[0]?.url) {
      setMessages((prev) => {
        // ตรวจสอบว่ามีรูปภาพนี้อยู่แล้วหรือไม่
        const hasImage = prev.some((msg) => msg.image === getdata.data[0].url);
        if (!hasImage) {
          return [
            ...prev,
            {
              type: "ai",
              content: "สร้างรูปภาพสำเร็จแล้วค่ะ",
              image: getdata.data[0].url,
              timestamp: new Date(),
            },
          ];
        }
        return prev;
      });
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

  return (
    <div>
      {!clicksubmit ? (
        <div className="text-white mt-15">
          <h1 className="text-4xl font-light text-center mb-4">AI Cave : Seedream 4.0</h1>
          <p className="text-gray-400 text-center mb-12">Kickstart your innovation process with our comprehensive selection of predefined prompts.</p>
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
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors">
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
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors">
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
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors">
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
          <div className="mb-8 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                {message.type === "user" ? (
                  // User Message
                  <div className="bg-gray-800 text-white rounded-xl px-4 py-3 max-w-2xl">
                    <p className="text-sm">{message.content}</p>
                  </div>
                ) : (
                  // AI Message with Image
                  <div className="flex flex-col items-start">
                    {message.image && (
                      <div className="relative w-fit">
                        <img
                          src={message.image}
                          width="250"
                          className="rounded-xl shadow-2xl border border-gray-600/50 group-hover:shadow-purple-500/20 transition-all duration-300 max-w-full h-auto block"
                          alt="AI Generated Image"
                        />
                        {/* ปุ่ม Share - มุมขวาบน */}
                        <Popover placement="topRight" content={content}>
                          <button className="absolute top-4 right-4 p-2 border hover:bg-white rounded-lg shadow-lg">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </Popover>
                        {/* ปุ่ม Download - มุมขวาล่าง */}
                        <button
                          className="absolute bottom-0 right-[-50px] p-2  hover:bg-white rounded-lg shadow-lg border"
                          onClick={() => {
                            window.open(message.image, "_blank");
                          }}>
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {loading && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12">
                <div className="flex flex-col justify-center items-center space-y-4">
                  <div className="relative">
                    <Spin size="large" />
                    <div className="absolute inset-0 animate-ping bg-purple-500/20 rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">กำลังสร้างรูปภาพ AI</h3>
                    <p className="text-gray-400">โปรดรอสักครู่ เรากำลังประมวลผล Prompt ของคุณ...</p>
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
          <Form
            form={formcreateImage}
            name="form-generate"
            autoComplete="off"
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: "image" }}>
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
                    showUploadList={false}>
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                      <PaperClipOutlined className="text-lg" />
                    </div>
                  </Upload>
                </Form.Item>
                <Button
                  htmlType="submit"
                  size="large"
                  className=" rounded-lg !bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 cursor-pointer">
                  <SendOutlined className="text-lg" />
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerateImage;
