import type { ITFromGenerate } from "@/app/common";
import { Avatar, Button, Form, Input, message, notification, Popover, Select, Spin, Tabs, Upload, type UploadFile, type UploadProps } from "antd";
import React, { type FC, type ReactElement, useEffect, useRef, useState } from "react";

import Avatars from "@/public/images/Avatar.jpg";
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
import { Download, Share2, Trash } from "lucide-react";
import GenerateImageServices from "@/app/services/generate-image.service";
import { axiosCore } from "@/app/lib/axios/axios";
import type { RcFile } from "antd/es/upload";
import LogsServices from "@/app/services/logs.service";
import GalleryServices from "@/app/services/gellory.service";
import type { StaticImageData } from "next/image";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import type { TPromptGuideType } from "@/app/common/prompt-guide.type";

export interface props {
  projectId: string;
  activeKey: "image" | "vdo" | "library" | "activity";
  userId?: string;
  shouldRefetch?: boolean;
  promptGuideTypes: TPromptGuideType[];
}

const PromptGenerateVdo: FC<props> = ({ projectId, activeKey, userId, shouldRefetch, promptGuideTypes }): ReactElement => {
  const contentRef = useRef<HTMLDivElement>(null);
  const promptguideService = PromptGuideServices(axiosCore);
  const [masterdataPromptGuide, setMasterdataPromptGuide] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [filesvdo, setFilesVdo] = useState<UploadFile[]>([]);
  const [formcreateVdo] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [gethistory, setHistory] = useState<any[]>([]);
  const [api, contextHolders] = notification.useNotification();

  // useEffect(() => {
  //   if (loading) {
  //     fecthdata();
  //   }
  //   masterdata();
  // }, [loading, submitting]);

  // useEffect(() => {
  //   if (shouldRefetch) {
  //     fecthdata();
  //   }
  // }, [shouldRefetch]);

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

  const masterdata = async () => {
    const response = await promptguideService.findAll();
    // จัดกลุ่มตาม typeName
    const grouped = response.reduce((acc: any, item) => {
      const key = item.typeName || "Others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    setMasterdataPromptGuide(grouped);
  };

  const onFinishVDO = async (values: ITFromGenerate) => {
    setCurrentPrompt(values.text);
    setSubmitting(true);
    let base: ITFromGenerate = values;
    if (filesvdo.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      filesvdo.forEach((file) => {
        formData.append("files", file.originFileObj);
      });
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload };
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

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  } as any;

  const colors = {
    blue: "bg-blue-500",
    white: "bg-white",
    gray: "bg-gray-500",
    purple: "bg-purple-500",
  } as any;

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
  const handleOpenImage = async (imageName: string) => {
    const res = await GenerateImageServices(axiosCore).downloadVDO(imageName);
    const blob = new Blob([res], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = imageName.split("/").pop()!;
    link.click();
    URL.revokeObjectURL(url);
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
      {contextHolders}
      {contextHolder}
      <div className="w-full grid grid-cols-5 gap-2">
        <div className="w-full col col-span-4 h-[calc(90vh-62px)] flex flex-col">
          {gethistory.length === 0 && !submitting && !loading ? (
            <div className="text-white pt-10 px-5 flex-1 overflow-auto">
              <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedance`}</h1>
              <p className="text-gray-400 text-center mb-10">
                {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
              </p>
              <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div>
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">✏️</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">{`Product Showcase`}</h3>
                  <div className="space-y-3 w-full">
                    {["Credit Card Close-up Shots", "Animated Card Reveal", "Transaction Flow Visuals", "Luxury & Premium Experience"].map((item) => (
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
                      <span className="text-2xl">💡</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">{`Branding & Visuals`}</h3>
                  <div className="space-y-3">
                    {["Customer Journey Scenes", "Travel & Freedom", "Future Tech & Innovation", "Everyday Convenience"].map((item) => (
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
              </div>
            </div>
          ) : (
            <div ref={contentRef} className="h-[500px] overflow-y-scroll pr-2 mt-8 hide-scrollbar scroll-smooth">
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

                        <div className="bg-gray-800/50 text-white rounded-2xl px-5 py-3 max-w-2xl border border-gray-700/50">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>

                        {/* Videos */}
                        {message.videoUrls && message.videoUrls.length > 0 && (
                          <div
                            className={`grid gap-4 w-full ${message.videoUrls.length === 1
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
                                  <video
                                    src={`/api/vdo/${encodeURIComponent(videoUrl)}`}
                                    controls
                                    className="w-full h-auto object-cover"
                                    preload="metadata"
                                  >
                                    Your browser does not support the video tag.
                                  </video>

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

                    <div className="flex gap-3 justify-start">
                      <Avatar size={40} src={(Avatars as StaticImageData).src} />
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

                <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800">
                  <Form.Item name="image" className="mb-0" style={{ marginBottom: 0, lineHeight: 1 }}>
                    <Upload
                      listType="picture"
                      fileList={filesvdo}
                      onChange={handleChangeVDO}
                      beforeUpload={beforeUploadFilesVDO}
                      multiple={true}
                      maxCount={2}
                      showUploadList={true}
                      disabled={submitting}
                      itemRender={(originNode, file, fileList, actions) => {
                        return (
                          <div className="flex items-center gap-2">
                            <img src={file.thumbUrl} alt="" className="w-16 h-16 object-cover rounded" />
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
  );
};

export default PromptGenerateVdo;
