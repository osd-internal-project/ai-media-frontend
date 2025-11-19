import type { ITFromGenerate } from "@/app/common";
import { Avatar, Button, Form, Input, Popover, Select, Spin, Tabs, Upload, type FormInstance, type UploadProps } from "antd";
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
  PlayCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Download, Share2, Sparkles } from "lucide-react";

export interface props {
  formcreateVdo: FormInstance;
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
  videoUrl?: string;
  videoInfo?: {
    duration?: number;
    resolution?: string;
    ratio?: string;
  };
  timestamp: Date;
}

const PromptGenerateVdo: FC<props> = ({
  formcreateVdo,
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

  // เมื่อได้ข้อมูลวิดีโอจาก API - แก้ไขให้ตรงกับโครงสร้างข้อมูลจริง
  useEffect(() => {
    console.log("getdata:", getdata); // Debug: ดูข้อมูลที่ได้รับ

    if (getdata?.content?.video_url) {
      const videoUrl = getdata.content.video_url;

      setMessages((prev) => {
        // ตรวจสอบว่ามีวิดีโอนี้อยู่แล้วหรือไม่
        const lastMessage = prev[prev.length - 1];
        const hasVideo = lastMessage?.videoUrl === videoUrl;

        if (!hasVideo) {
          console.log("Adding video to messages:", videoUrl); // Debug
          return [
            ...prev,
            {
              type: "ai",
              content: "สร้างวิดีโอสำเร็จแล้วค่ะ",
              videoUrl: videoUrl,
              videoInfo: {
                duration: getdata.duration,
                resolution: getdata.resolution,
                ratio: getdata.ratio,
              },
              timestamp: new Date(),
            },
          ];
        }
        return prev;
      });
    }
  }, [getdata]);

  const handleSubmit = (values: ITFromGenerate) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: values.text,
        timestamp: new Date(),
      },
    ]);

    formcreateVdo.resetFields(["text"]);
    onFinish(values);
  };

  const handleDownloadVideo = (videoUrl: string) => {
    // เปิด URL ในแท็บใหม่
    window.open(videoUrl, "_blank");
  };

  const content = (
    <div className="grid grid-cols-1 gap-2 min-w-[120px]">
      <Button block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <TikTokOutlined /> <span>Tiktok</span>
      </Button>
      <Button block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <FacebookOutlined /> <span>Facebook</span>
      </Button>
      <Button block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <InstagramOutlined /> <span>Instagram</span>
      </Button>
      <Button block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <WechatWorkOutlined /> <span>Line</span>
      </Button>
    </div>
  );
  console.log(messages);

  const items = [
    {
      key: "1",
      label: "Configure",
      children: (
        <div>
          <Form.Item name="resolution" className="w-full" label={`Resolution`} initialValue={"1080p"}>
            <Select
              optionFilterProp="label"
              placeholder="เลือกความละเอียด"
              allowClear
              options={[
                { value: "480p", label: "480p - Standard" },
                { value: "720p", label: "720p - HD" },
                { value: "1080p", label: "1080p - Full HD" },
              ]}
            />
          </Form.Item>
          <Form.Item<ITFromGenerate>
            className="w-full"
            name={`ratio`}
            label={<span className="text-white font-medium">Aspect ratio</span>}
            rules={[{ required: true, message: "กรุณาเลือกอัตราส่วนของวิดีโอ!" }]}
          >
            <Select
              className="w-full custom-select"
              optionFilterProp="label"
              placeholder="เลือกอัตราส่วน"
              allowClear
              options={[
                { value: "16:9", label: "16:9 - Widescreen" },
                { value: "4:3", label: "4:3 - Standard" },
                { value: "1:1", label: "1:1 - Square" },
                { value: "3:4", label: "3:4 - Portrait" },
                { value: "9:16", label: "9:16 - Vertical" },
                { value: "21:9", label: "21:9 - Ultrawide" },
              ]}
            />
          </Form.Item>
          <Form.Item<ITFromGenerate>
            className="w-full"
            name={`duration`}
            label={<span className="text-white font-medium">Video length</span>}
            rules={[{ required: true, message: "กรุณาเลือกความยาวของวิดีโอ!" }]}
          >
            <Select
              optionFilterProp="label"
              placeholder="เลือกความยาว"
              allowClear
              options={[
                { value: "5", label: "5 วินาที" },
                { value: "10", label: "10 วินาที" },
              ]}
            />
          </Form.Item>
        </div>
      ),
    },
    { key: "2", label: "Prompt Guide", children: <div>Content 2</div> },
  ];

  return (
    <Form
      form={formcreateVdo}
      name="form-generate"
      autoComplete="off"
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ type: "vdo", resolution: "1080p" }}
    >
      <div className="w-full grid grid-cols-5 !gap-2">
        <div className="w-full col col-span-4 ">
          {!clicksubmit ? (
            <div className="text-white mt-10">
              <h1 className="text-4xl font-light text-center mb-4">AI Cave : Seedance</h1>
              <p className="text-gray-400 text-center mb-12">
                Kickstart your innovation process with our comprehensive selection of predefined prompts.
              </p>
              <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto !px-10">
                <div>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">✏️</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-6">Product Showcase</h3>
                  <div className="!space-y-3">
                    {["Credit Card Close-up Shots", "Animated Card Reveal", "Transaction Flow Visuals", "Luxury & Premium Experience"].map((item) => (
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
                    {["Customer Journey Scenes", "Travel & Freedom", "Future Tech & Innovation", "Everyday Convenience"].map((item) => (
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
                <div className="max-w-6xl mx-auto space-y-6">
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
                        // AI Message with Video - ใช้สไตล์จาก Image UI
                        <div className="flex flex-col items-start space-y-3 flex-1">
                          <div className="bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl px-5 py-3 max-w-2xl border border-gray-700/50">
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>

                          {/* แสดงวิดีโอ - ใช้ Layout แบบเดียวกับรูปภาพ */}
                          {message.videoUrl && (
                            <div className="w-full max-w-3xl">
                              <div className="relative group">
                                <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                                  <video src={message.videoUrl} controls className="w-full h-auto object-cover" preload="metadata">
                                    Your browser does not support the video tag.
                                  </video>

                                  {/* Overlay Gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                  {/* Action Buttons */}
                                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Popover placement="topRight" content={content}>
                                      <button className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110">
                                        <Share2 className="w-4 h-4 text-gray-800" />
                                      </button>
                                    </Popover>

                                    <button
                                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                      onClick={() => window.open(message.videoUrl, "_blank")}
                                    >
                                      <Download className="w-4 h-4 text-gray-800" />
                                    </button>
                                  </div>

                                  {/* Video Info Badge */}
                                  {/* {message.videoInfo && (
                                      <div className="absolute bottom-3 left-3 flex gap-2">
                                        <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                                          <Play className="w-3 h-3" />
                                          {message.videoInfo.duration}s
                                        </div>
                                        <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                          {message.videoInfo.resolution}
                                        </div>
                                        <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                          {message.videoInfo.ratio}
                                        </div>
                                      </div>
                                    )} */}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <style>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>

                {/* Enhanced Loading State */}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar size={40} icon={<RobotOutlined />} className="bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                    <div className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl flex-1 max-w-2xl">
                      <div className="flex flex-col justify-center items-center space-y-4">
                        <div className="relative">
                          <div className="relative z-10">
                            <Spin size="large" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center animation-delay-150">
                            <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            กำลังสร้างวิดีโอ AI
                          </h3>
                          <p className="text-gray-400 text-sm">โปรดรอสักครู่ อาจใช้เวลา 1-2 นาที...</p>
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
              <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                <Form.Item name="text" className="mb-0" rules={[{ required: true, message: "กรุณากรอก prompt!" }]}>
                  <Input.TextArea
                    placeholder="อธิบายวีดีโอที่คุณต้องการสร้าง เช่น 'แมวตัวน้อยกำลังเล่นในสวน ด้วยแสงแดดยามเช้า...'"
                    className="bg-transparent border-none text-zinc-300 placeholder:text-zinc-600 resize-none"
                    style={{
                      fontSize: "16px",
                      padding: "20px 24px",
                      minHeight: "120px",
                      boxShadow: "none",
                    }}
                    autoSize={{ minRows: 3, maxRows: 8 }}
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

export default PromptGenerateVdo;
