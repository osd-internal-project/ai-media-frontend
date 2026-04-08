import React, { useEffect, useState, type FC, type ReactElement } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Tag,
  Upload,
  UploadFile,
  UploadProps,
  notification,
} from "antd";
import { Upload as UploadIcon, Mic, Sparkles } from "lucide-react";
import type { RcFile } from "antd/es/upload";
// import OmnihumenServices from "@/app/services/omnihumen.service";
import { axiosCore } from "@/app/lib/axios/axios";
import OmnihumenTaskServices from "@/app/services/omnihumen-task.service";
import { TOmnihumenTask } from "@/app/common/omnihumen.type";
import { fallbackImage } from "@/app/utils/fallback";

// import * as dayjs from "dayjs";
export interface props {
  projectId?: string;
  token?: string;
  shouldRefetch?: boolean;
  isActive?: boolean;
}

const PromptOmnihumen: FC<props> = ({
  projectId,
  token,
  shouldRefetch,
  isActive,
}): ReactElement => {
  // const omnihumenServices = OmnihumenServices(axiosCore);
  const omnihumenTaskServices = OmnihumenTaskServices(axiosCore);
  const [api, contextHolders] = notification.useNotification();
  // const [api, contextHolders] = notification.useNotification();

  const [formAvatar] = Form.useForm();
  const [imageFile, setImageFile] = useState<UploadFile[]>([]);
  const [audioFile, setAudioFile] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [avatarName, setAvatarName] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [tasks, setTasks] = useState<TOmnihumenTask[]>([]);

  useEffect(() => {
    fetchData();

    // let interval: NodeJS.Timeout;
    // if (isActive) {
    //   interval = setInterval(() => {
    //     fetchData();
    //   }, 60000);
    // }

    // return () => {
    //   if (interval) clearInterval(interval);
    // };
  }, [isActive]);
  const fetchData = async () => {
    if (projectId) {
      const data = await omnihumenTaskServices.findByProjectId(projectId);
      setTasks(data || []);
    }
  };
  const beforeUploadImage = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      api.error({ message: "You can only upload image files!" });
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      api.error({ message: "Image must be smaller than 5MB!" });
      return false;
    }
    return false; // Prevent auto upload
  };

  const beforeUploadAudio = (file: RcFile) => {
    const isAudio =
      file.type.startsWith("audio/") || file.name.endsWith(".mp3");
    if (!isAudio) {
      api.error({ message: "You can only upload audio files!" });
      return false;
    }
    const isLt35S = file.size / 1024 / 1024 < 10; // Approximate 35 seconds
    if (!isLt35S) {
      api.error({
        message: "Audio must be smaller than 10MB (approximately 35 seconds)!",
      });
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleImageChange: UploadProps["onChange"] = ({ fileList }) => {
    setImageFile(fileList.slice(0, 1)); // Only keep one file
  };

  const handleAudioChange: UploadProps["onChange"] = ({ fileList }) => {
    setAudioFile(fileList.slice(0, 1)); // Only keep one file
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // Handle avatar creation logic here
      console.log("Avatar creation:", {
        ...values,
        imageFile: imageFile[0]?.originFileObj,
        audioFile: audioFile[0]?.originFileObj,
        projectId,
        token,
      });

      const formData = new FormData();
      if (projectId) formData.append("projectId", projectId);
      if (token) formData.append("token", token);
      if (values.avatarName) formData.append("avatarName", values.avatarName);
      if (values.prompt) formData.append("prompt", values.prompt);

      if (imageFile[0]?.originFileObj) {
        formData.append("image", imageFile[0].originFileObj);
      }
      if (audioFile[0]?.originFileObj) {
        formData.append("audio", audioFile[0].originFileObj);
      }
      // const res = await omnihumenServices.create(formData);
      // console.log(res);
      // if (res) {
      //   await fetchData();
      //   setSubmitting(false);
      //   //  Reset form
      //   formAvatar.resetFields();
      //   setImageFile([]);
      //   setAudioFile([]);
      //   setAvatarName("");
      //   setPromptText("");
      //   setSubmitting(false);
      // }
    } catch (error) {
      console.error(error);
      api.error({ message: "Failed to create avatar" });
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg mb-4">
      {contextHolders}

      <div className="grid sm:grid-cols-2 md:grid-cols-5">
        <div className="gap-4 md:col-span-4 sm:col-span-2">
          <div className="w-full">
            <Form
              form={formAvatar}
              layout="vertical"
              onFinish={onFinish}
              className="w-full space-y-6 h-[calc(100vh-300px)] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light text-white mb-2">
                  Create Your Avatar
                </h1>
                <p className="text-gray-400">
                  Upload your image and audio to get started
                </p>
              </div>

              {/* Assets Section */}
              <div>
                {/* <h3 className="text-lg font-semibold text-white mb-4">
                  Assets
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Image */}
                  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                    <h4 className="text-base font-medium text-white mb-2">
                      Upload Image
                    </h4>
                    <Form.Item name="image" className="mb-0">
                      <Upload
                        accept=".jpg,.jpeg,image/jpeg"
                        listType="picture-card"
                        fileList={imageFile}
                        onChange={handleImageChange}
                        beforeUpload={beforeUploadImage}
                        maxCount={1}
                        className="avatar-uploader"
                      >
                        {imageFile.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-2 text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                              <UploadIcon className="w-6 h-6 " />
                            </div>
                            <div className="text-sm font-medium text-white mb-1">
                              Click to upload image
                            </div>
                            <div className="text-xs text-gray-500">
                              JPG up to 5MB, max 4096x4096
                            </div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </div>

                  {/* Upload Audio */}
                  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                    <h4 className="text-base font-medium text-white mb-2">
                      Upload Audio
                    </h4>
                    <Form.Item name="audio" className="mb-0">
                      <Upload
                        accept=".mp3,audio/mpeg"
                        listType="picture-card"
                        fileList={audioFile}
                        onChange={handleAudioChange}
                        beforeUpload={beforeUploadAudio}
                        maxCount={1}
                        className="avatar-uploader audio-uploader"
                      >
                        {audioFile.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-2 text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                              <Mic className="w-6 h-6 " />
                            </div>
                            <div className="text-sm font-medium text-white mb-1">
                              Click to upload audio
                            </div>
                            <div className="text-xs text-gray-500">
                              MP3 up to 35 seconds
                            </div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Avatar Name */}
              <div>
                <Form.Item
                  name="avatarName"
                  label={
                    <span className="text-white font-medium">
                      Avatar Name (optional)
                    </span>
                  }
                >
                  <Input
                    placeholder="Name your avatar..."
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    maxLength={80}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus:border-purple-500"
                    size="large"
                  />
                </Form.Item>
                <div className="text-right text-xs text-gray-500 -mt-4">
                  {avatarName.length}/80
                </div>
              </div>

              {/* Prompt */}
              <div>
                <Form.Item
                  name="prompt"
                  label={
                    <span className="text-white font-medium">
                      Prompt (optional)
                    </span>
                  }
                >
                  <Input.TextArea
                    placeholder="Describe how you want your avatar to behave, speak, or look..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    maxLength={200}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-700 focus:border-purple-500 resize-none"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                  />
                </Form.Item>
                <div className="text-right text-xs text-gray-500 -mt-4">
                  {promptText.length}/200
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  htmlType="submit"
                  size="large"
                  disabled={submitting || imageFile.length === 0}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {/* <Sparkles className="w-5 h-5" /> */}
                  Create Avatar
                </Button>
              </div>
            </Form>

            <style>{`
          .avatar-uploader .ant-upload-list-item-container {
            width: 100% !important;
            height: auto !important;
          }
          
          .avatar-uploader .ant-upload-select {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            background: transparent !important;
            border: 2px dashed #3f3f46 !important;
            border-radius: 12px !important;
          }
          
          .avatar-uploader .ant-upload-select:hover {
            border-color: #8b5cf6 !important;
          }
          
          .audio-uploader .ant-upload-select:hover {
            border-color: #14b8a6 !important;
          }
          
          .avatar-uploader .ant-upload-list-item {
            border-radius: 12px !important;
            border-color: #3f3f46 !important;
            background: #18181b !important;
          }
        `}</style>
          </div>
        </div>
        <div className="ml-2">
          <div className="text-[24px] font-bold ">{`Task`}</div>{" "}
          {/* <Button onClick={() => message.success({ message: "success" })}>
            11
          </Button> */}
          <div className="h-[calc(100vh-300px)]  overflow-y-auto">
            {tasks.map((task) => (
              <Card size="small" key={task.id} className=" space-y-2 !mb-2 ">
                <div className=" flex justify-between">
                  <div className="  mb-2">{task?.avatarName || task.uuid}</div>
                  <Space className=" flex justify-between">
                    <Tag
                      color={
                        task?.filePath
                          ? "green"
                          : !task.status
                            ? `blue`
                            : `${"red"}`
                      }
                    >
                      {task?.filePath
                        ? "Completed"
                        : !task.status
                          ? `Panding`
                          : `${task?.taskMessage || ""}`}
                    </Tag>
                    {/* <div className=" !text-[12px] text-gray-500">
                    {dayjs(task.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                  </div> */}
                  </Space>
                </div>{" "}
                {task?.filePath && (
                  <div className="relative overflow-hidden rounded-xl border border-gray-700/50 shadow-2xl h-[200px]">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    >
                      <source
                        src={`/api/video/${encodeURIComponent(task?.filePath)}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptOmnihumen;
