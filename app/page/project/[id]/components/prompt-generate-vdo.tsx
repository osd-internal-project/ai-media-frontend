import type { ITFromGenerate } from "@/app/common";
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Popover,
  Select,
  Spin,
  Tabs,
  Upload,
  type FormInstance,
  type UploadFile,
  type UploadProps,
} from "antd";
import React, { type FC, type ReactElement, useEffect, useState } from "react";

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
  shouldRefetch?: boolean;
}

const PromptGenerateVdo: FC<props> = ({ projectId, userId, shouldRefetch }): ReactElement => {
  const [messageApi, contextHolder] = message.useMessage();
  const [filesvdo, setFilesVdo] = useState<UploadFile[]>([]);
  const [formcreateVdo] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [gethistory, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (loading) {
      fecthdata();
    }
  }, [loading, submitting]);

  useEffect(() => {
    if (shouldRefetch) {
      fecthdata();
    }
  }, [shouldRefetch]);

  const fecthdata = async () => {
    try {
      const response = await LogsServices(axiosCore).findVdo(projectId as string);
      const messages: any[] = [];
      response.forEach((item: any) => {
        messages.push({
          type: "user",
          content: item.prompt,
          username: item.users.fullname,
          time: item.createdAt,
          taskId: item.taskId,
        });
        // AI message
        messages.push({
          type: "ai",
          content: "AI Generated Video",
          videoUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [item.imageUrls],
          taskId: item.taskId,
          status: item.status || false,
          videoInfo: {
            duration: item.duration,
            resolution: item.resolution,
            ratio: item.ratio,
          },
          username: "AICave",
          time: item.createdAt,
        });
      });

      setHistory(messages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch logs:", err);
    }
  };

  const onFinishVDO = async (values: ITFromGenerate) => {
    // เก็บ prompt ที่พิมพ์
    setCurrentPrompt(values.text);
    setSubmitting(true);

    let base: ITFromGenerate = values;
    if (filesvdo.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      formData.append("files", filesvdo[0].originFileObj);
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload[0] };
    }

    try {
      const response = await GenerateImageServices(axiosCore).create({ ...base, projectId, userId });
      if (response.status === 400) {
        messageApi.open({
          type: "error",
          content: `${response.data}`,
        });
        setSubmitting(false);
        return true;
      }
      const checkStatus = async () => {
        try {
          console.log(response);

          const task = await GenerateImageServices(axiosCore).findById(response.data.id);
          if (task?.status === "succeeded") {
            if (task && task.content) {
              const taskId = task.id;
              const base = {
                content: task.content,
                status: "success",
                tokenUsed: task.usage.total_tokens,
              };
              const updateLogs = await LogsServices(axiosCore).findByTaskId(taskId, base);
              if (updateLogs) {
                message.success("สร้างวิดีโอสำเร็จ");
                formcreateVdo.resetFields();
                setFilesVdo([]);
                setCurrentPrompt("");
                // Fetch ข้อมูลใหม่
                await fecthdata();
                setSubmitting(false);
                return;
              }
            } else {
              message.error("ไม่มีข้อมูลวิดีโอที่ได้รับกลับมา");
              setSubmitting(false);
              return;
            }
          }

          if (task?.status === "failed") {
            message.error("การสร้างวิดีโอล้มเหลว");
            setSubmitting(false);
            return;
          }

          if (task?.status === "processing" || task?.status === "pending") {
            setTimeout(checkStatus, 3000);
            return;
          }

          console.warn("Unknown status:", task?.status);
          setTimeout(checkStatus, 3000);
        } catch (err) {
          console.error("Error checking status:", err);
          message.error("เกิดข้อผิดพลาดระหว่างตรวจสอบสถานะ");
          setSubmitting(false);
        }
      };
      checkStatus();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  };

  const beforeUploadFilesVDO = (file: RcFile) => {
    if (filesvdo.find((oneFile) => oneFile.name === file.name)) {
      message.warning(`ชื่อไฟล์ ${file.name} ซ้ำ`);
      return false;
    }
    return false;
  };

  const handleChangeVDO: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
    return setFilesVdo(newFileList);
  };

  const content = (
    <div className="grid grid-cols-1 gap-2 min-w-[120px]">
      <Button htmlType="button" block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <TikTokOutlined /> <span>Tiktok</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <FacebookOutlined /> <span>Facebook</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <InstagramOutlined /> <span>Instagram</span>
      </Button>
      <Button htmlType="button" block className="!flex !justify-start !items-center gap-2 hover:bg-gray-700">
        <WechatWorkOutlined /> <span>Line</span>
      </Button>
    </div>
  );

  const updateShareOptions = async (taskId: string, videoUrl: string, status: boolean) => {
    try {
      const update = await GalleryServices(axiosCore).updateShareOptions(taskId, videoUrl, status);
      if (update) {
        message.success(status ? "ยกเลิกถูกใจแล้ว" : "ถูกใจแล้ว");
        await fecthdata();
      }
    } catch (error) {
      console.error("Error updating share options:", error);
      message.error("เกิดข้อผิดพลาด");
    }
  };

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
  const handleOpenImage = async (url: string) => {
    await window.open(url, "_blank");
  };

  return (
    <Form
      form={formcreateVdo}
      name="form-generate"
      autoComplete="off"
      layout="vertical"
      onFinish={onFinishVDO}
      initialValues={{ type: "vdo", resolution: "1080p", ratio: "16:9", duration: "5" }}
    >
      {contextHolder}
      <div className="w-full grid grid-cols-5 !gap-2">
        <div className="w-full col col-span-4 ">
          {gethistory.length === 0 && !submitting ? (
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
                      <Button
                        htmlType="button"
                        key={item}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{item}</span>
                        <span>→</span>
                      </Button>
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
                      <Button
                        htmlType="button"
                        key={item}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{item}</span>
                        <span>→</span>
                      </Button>
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

                        {/* Videos */}
                        {message.videoUrls && message.videoUrls.length > 0 && (
                          <div
                            className={`grid gap-4 w-full ${
                              message.videoUrls.length === 1
                                ? "grid-cols-1 max-w-md"
                                : message.videoUrls.length === 2
                                ? "grid-cols-2 max-w-2xl"
                                : message.videoUrls.length === 3
                                ? "grid-cols-3 max-w-3xl"
                                : "grid-cols-2 lg:grid-cols-4 max-w-4xl"
                            }`}
                          >
                            {message.videoUrls.map((videoUrl: string, vidIndex: number) => (
                              <div key={vidIndex} className="relative group">
                                {/* --- FRAME ของวิดีโอ --- */}
                                <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-300">
                                  <video src={videoUrl} controls className="w-full h-auto object-cover" preload="metadata">
                                    Your browser does not support the video tag.
                                  </video>

                                  {/* --- OVERLAY GRADIENT --- */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                  {/* --- ACTION BUTTONS (บนขวา) --- */}
                                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Popover placement="topRight" content={content}>
                                      <Button
                                        htmlType="button"
                                        className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                      >
                                        <Share2 className="w-4 h-4 text-gray-800" />
                                      </Button>
                                    </Popover>

                                    <Button
                                      htmlType="button"
                                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                      // onClick={() => handleDownload(videoUrl)}
                                      onClick={() => handleOpenImage(videoUrl)}
                                    >
                                      <Download className="w-4 h-4 !text-gray-800" />
                                    </Button>
                                    <Button
                                      htmlType="button"
                                      onClick={() => updateShareOptions(message.taskId, videoUrl, message.status)}
                                      className="p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg transition-all hover:scale-110"
                                    >
                                      <LikeOutlined className={`text-base ${message.status ? "!text-red-600" : "!text-gray-800"}`} />
                                    </Button>
                                  </div>

                                  {/* --- VIDEO NUMBER (ซ้ายล่าง) --- */}
                                  {message.videoUrls.length > 1 && (
                                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                      {vidIndex + 1} / {message.videoUrls.length}
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
                            {/* Sparkle Icon */}
                            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                              <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                          </div>
                          <div className="text-center space-y-1">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                              กำลังสร้างวิดีโอ AI
                            </h3>
                            <p className="text-gray-400 text-sm">โปรดรอสักครู่ อาจใช้เวลา 1-2 นาที...</p>
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

                {loading && !submitting && gethistory.length > 0 && (
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
                          {/* Sparkle Icon */}
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            กำลังโหลดข้อมูล
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
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className=" w-full max-w-4xl mt-20">
              <Form.Item name="type" hidden>
                <Input />
              </Form.Item>
              <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                <Form.Item name="text" className="mb-0">
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
                    disabled={submitting}
                  />
                </Form.Item>

                <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800">
                  <Form.Item name="image" className="mb-0">
                    <Upload
                      listType="picture"
                      fileList={filesvdo}
                      onChange={handleChangeVDO}
                      beforeUpload={beforeUploadFilesVDO}
                      multiple={false}
                      maxCount={1}
                      showUploadList={true}
                      disabled={submitting}
                      itemRender={(originNode, file, fileList, actions) => {
                        return (
                          <div className="flex items-center gap-2">
                            <img src={file.thumbUrl} alt="" className="w-16 h-16 object-cover rounded" />
                            {/* ไม่ใส่ชื่อไฟล์ */}
                            <Button htmlType="button" onClick={actions.remove} className="text-red-500">
                              ลบ
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
          <div className=" text-[24px] font-bold p-4">Configure</div>
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
