"use client";
import {
  TGenerateType,
  TPromptGuideType,
} from "@/app/common/prompt-guide.type";
import {
  Form,
  message,
  Modal,
  notification,
  Spin,
  Tabs,
  UploadFile,
} from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactElement,
} from "react";

import PromptGuideComponent from "./components/prompt-guide";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";

import { useOrganization } from "@/app/context/OrganizationContext";
import { canManageTemplates } from "@/app/utils/permissions";
import { RcFile, UploadChangeParam, UploadProps } from "antd/es/upload";
import UploadsServices from "@/app/services/uploads.service";
import { useSession } from "next-auth/react";

type NotificationType = "success" | "info" | "warning" | "error";

const TemplateSettingPage: FC = (): ReactElement => {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.userId;
  const [api, contextHolderNoti] = notification.useNotification();
  const [modal, contextHolder] = Modal.useModal();
  const promptguideServices = useMemo(() => PromptGuideServices(axiosCore), []);
  const promptguideTypeServices = useMemo(
    () => PromptGuideTypeServices(axiosCore),
    [],
  );
  const uploadsServices = useMemo(() => UploadsServices(axiosWorker), []);
  const { organizationRole } = useOrganization();

  const canManage = canManageTemplates(organizationRole || "");

  const [promptGuideForm] = Form.useForm();
  const [selectedPromptGuide, setSelectedPromptGuide] =
    useState<TPromptGuideType | null>(null);
  const [promptGuideTypes, setPromptGuideTypes] = useState<TPromptGuideType[]>(
    [],
  );
  const [generateType, setGenerateType] = useState<TGenerateType>("image");
  const [loading, setLoading] = useState(false);

  const fetchPromptGuideTypes = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const promptGuideTypes = await promptguideTypeServices.findAll(
        organizationId,
        generateType,
      );
      setPromptGuideTypes(promptGuideTypes || []);
    } catch (error) {
      console.error("Error fetching prompt guide types:", error);
      setPromptGuideTypes([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, promptguideTypeServices, generateType]);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [firstFrame, setFirstFrame] = useState<UploadFile[]>([]);
  const [lastFrame, setLastFrame] = useState<UploadFile[]>([]);

  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
  const [isLoadingFirstFrame, setIsLoadingFirstFrame] =
    useState<boolean>(false);
  const [isLoadingLastFrame, setIsLoadingLastFrame] = useState<boolean>(false);
  const [refImage, setRefImage] = useState<
    { name: string; status: string; uid: string; url: string }[]
  >([]);

  const fetchPromptGuideImages = async (id: number) => {
    setRefImage([]);
    setFiles([]);
    setFirstFrame([]);
    setLastFrame([]);
    setIsLoadingUpload(true);
    try {
      const promptGuideImages = await promptguideServices.getPromptGuideImages(
        String(id),
      );

      if (promptGuideImages && promptGuideImages.length > 0) {
        setRefImage(promptGuideImages);

        // Convert to UploadFile format for Ant Design Upload component
        const uploadFiles: UploadFile[] = promptGuideImages.map((img: any) => ({
          uid: img.uid,
          name: img.name,
          status: "completed" as const,
          url: img.url,
        }));

        // For video type, separate into firstFrame (index 1) and lastFrame (index 2)
        if (generateType === "video" || generateType === "omnihumen" || generateType === "dreamactor") {
          console.log("promptGuideImages", promptGuideImages);
          const firstFrameFiles = promptGuideImages
            .filter((img: any) => img.index === 1)
            .map((img: any) => ({
              uid: img.uid,
              name: img.name,
              status: "completed" as const,
              url: img.url,
            }));
          console.log("firstFrameFiles", firstFrameFiles);
          const lastFrameFiles = promptGuideImages
            .filter((img: any) => img.index === 2)
            .map((img: any) => ({
              uid: img.uid,
              name: img.name,
              status: "completed" as const,
              url: img.url,
            }));
          console.log("lastFrameFiles", lastFrameFiles);
          setFirstFrame(firstFrameFiles);
          setLastFrame(lastFrameFiles);
        } else {
          setFiles(uploadFiles);
        }
      }
    } catch (error) {
      console.error("Error fetching prompt guide images:", error);
    } finally {
      setIsLoadingUpload(false);
    }
  };

  useEffect(() => {
    setSelectedPromptGuide(null);
    promptGuideForm.resetFields();
    setRefImage([]);
    setFiles([]);
    setFirstFrame([]);
    setLastFrame([]);

    if (organizationId) {
      fetchPromptGuideTypes();
    } else {
      setPromptGuideTypes([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, fetchPromptGuideTypes]);

  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
  ) => {
    api[type]({
      message: type,
      description: message,
    });
  };

  const onSelectPromptGuide = async (id: number) => {
    const promptGuide = await promptguideServices.findById(String(id));
    setSelectedPromptGuide(promptGuide);
    await fetchPromptGuideImages(id);
    promptGuideForm.setFieldsValue(promptGuide);
  };

  const onUpdatePromptGuide = async (
    values: TPromptGuideType,
  ): Promise<void> => {
    console.log("values", refImage.length);
    console.log("values", refImage);
    const updatePromptGuide = await promptguideServices.update(values.id!, {
      ...values,
      promptGuideImages: refImage.map((image) => image.uid),
    });

    if (updatePromptGuide) {
      modal.success({
        title: "Success",
        content: "Update prompt guide successfully",
      });
    }
    fetchPromptGuideTypes();
  };

  const onCreatePromptGuideType = async (values: any) => {
    if (!organizationId) return;
    try {
      await promptguideTypeServices.create({
        ...values,
        organizationId,
        status: true,
        generateType: generateType,
      });
      modal.success({ title: "Success", content: "Created prompt type" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onDeletePromptGuideType = async (id: number) => {
    if (!organizationId) return;
    try {
      await promptguideTypeServices.del(id);
      modal.success({ title: "Success", content: "Deleted prompt type" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onCreatePromptGuide = async (values: any) => {
    if (!organizationId) return;
    try {
      await promptguideServices.create({
        ...values,
        organizationId,
        status: true,
        generateType: generateType,
      });
      modal.success({ title: "Success", content: "Created prompt guide" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onDeletePromptGuide = async (id: number) => {
    try {
      await promptguideServices.del(id);
      setSelectedPromptGuide(null);
      modal.success({ title: "Success", content: "Deleted prompt guide" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };
  function handleSelectGenerateType(value: TGenerateType): void {
    setGenerateType(value);
  }

  //Image
  const handleUploadChange: UploadProps["onChange"] = async ({
    file,
    fileList: newFileList,
  }) => {
    if (newFileList.length >= 1 && file.status !== "removed") {
      setIsLoadingUpload(true);
      const fileToUpload = file.originFileObj || file;
      if (fileToUpload instanceof Blob) {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(fileToUpload as Blob);
            img.onload = () => {
              const minSide = Math.min(img.width, img.height);
              URL.revokeObjectURL(img.src);
              if (minSide < 300) {
                reject(
                  "Image size is too small, minimum side length must not be less than 300 px",
                );
              } else {
                resolve();
              }
            };
            img.onerror = () => {
              URL.revokeObjectURL(img.src);
              resolve();
            };
          });
        } catch (error) {
          openNotificationWithIcon("error", String(error));
          return;
        }
      }
      if (!selectedPromptGuide?.id) {
        message.warning("Please select a prompt guide");
        return;
      }
      const promptGuideId = selectedPromptGuide.id;
      const formData = new FormData();
      formData.append("userId", userId ? userId : "");
      formData.append("index", newFileList.length.toString());
      formData.append("promptGuideId", String(promptGuideId));
      formData.append("generateType", generateType);
      formData.append("organizationId", organizationId || "");
      formData.append("uid", file.uid);

      // const fileToUpload = file.originFileObj || file;
      formData.append("file", fileToUpload as Blob);
      try {
        const result = await uploadsServices.uploadPromptGuideImage(formData);
        setRefImage((prev) => [...prev, result]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    setIsLoadingUpload(false);
    setFiles(newFileList);
  };

  const onRemoveFile = (file: UploadFile) => {
    setRefImage((prev) => prev.filter((f) => f.uid !== file.uid));
    uploadsServices.removePromptGuideImage(file.uid);
  };

  const beforeUpload = (file: RcFile) => {
    if (files.find((f) => f.name === file.name)) {
      message.warning(`Duplicate file: ${file.name}`);
      return false;
    }

    if (files.length >= 15) {
      message.warning(`Upload limit: 15 files max`);
      return false;
    }

    return false;
  };

  // Last Frame Upload Handler (index 2)
  const handleVideoImageUploadChange = async (
    { file, fileList: newFileList }: UploadChangeParam<UploadFile>,
    index: string,
  ) => {
    if (index === "1") {
      if (newFileList.length >= 1 && file.status !== "removed") {
        const fileToUpload = file.originFileObj || file;
        if (fileToUpload instanceof Blob) {
          try {
            await new Promise<void>((resolve, reject) => {
              const img = new window.Image();
              img.src = URL.createObjectURL(fileToUpload as Blob);
              img.onload = () => {
                const minSide = Math.min(img.width, img.height);
                URL.revokeObjectURL(img.src);
                if (minSide < 300) {
                  reject(
                    "Image size is too small, minimum side length must not be less than 300 px",
                  );
                } else {
                  resolve();
                }
              };
              img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve();
              };
            });
          } catch (error) {
            openNotificationWithIcon("error", String(error));
            return;
          }
        }
        setIsLoadingFirstFrame(true);
        if (!selectedPromptGuide?.id) {
          message.warning("Please select a prompt guide");
          setIsLoadingFirstFrame(false);
          return;
        }
        const promptGuideId = selectedPromptGuide.id;
        const formData = new FormData();
        formData.append("userId", userId ? userId : "");
        formData.append("index", index); // Fixed index 1
        formData.append("promptGuideId", String(promptGuideId));
        formData.append("generateType", generateType);
        formData.append("uid", file.uid);
        formData.append("organizationId", organizationId || "");
        formData.append("file", fileToUpload as Blob);
        try {
          const result = await uploadsServices.uploadPromptGuideImage(formData);
          setRefImage((prev) => [...prev, result]);
        } catch (error) {
          console.error("Upload failed:", error);
        }
        setIsLoadingFirstFrame(false);
      }
      setFirstFrame(newFileList);
    } else {
      if (newFileList.length >= 1 && file.status !== "removed") {
        const fileToUpload = file.originFileObj || file;
        if (fileToUpload instanceof Blob) {
          try {
            await new Promise<void>((resolve, reject) => {
              const img = new window.Image();
              img.src = URL.createObjectURL(fileToUpload as Blob);
              img.onload = () => {
                const minSide = Math.min(img.width, img.height);
                URL.revokeObjectURL(img.src);
                if (minSide < 300) {
                  reject(
                    "Image size is too small, minimum side length must not be less than 300 px",
                  );
                } else {
                  resolve();
                }
              };
              img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve();
              };
            });
          } catch (error) {
            openNotificationWithIcon("error", String(error));
            return;
          }
        }
        setIsLoadingLastFrame(true);
        if (!selectedPromptGuide?.id) {
          message.warning("Please select a prompt guide");
          setIsLoadingLastFrame(false);
          return;
        }
        const promptGuideId = selectedPromptGuide.id;
        const formData = new FormData();
        formData.append("userId", userId ? userId : "");
        formData.append("index", index); // Fixed index 2
        formData.append("promptGuideId", String(promptGuideId));
        formData.append("generateType", generateType);
        formData.append("uid", file.uid);
        formData.append("file", fileToUpload as Blob);
        formData.append("organizationId", organizationId || "");
        try {
          const result = await uploadsServices.uploadPromptGuideImage(formData);
          setRefImage((prev) => [...prev, result]);
        } catch (error) {
          console.error("Upload failed:", error);
        }
        setIsLoadingLastFrame(false);
      }
      setLastFrame(newFileList);
    }
  };

  const tabItems = [
    {
      key: "prompt-templates",
      label: "Prompt Templates",
      children: (
        <Spin spinning={loading}>
          <PromptGuideComponent
            promptGuideTypes={promptGuideTypes}
            promptGuideForm={promptGuideForm}
            onSelectPromptGuide={onSelectPromptGuide}
            selectedPromptGuide={selectedPromptGuide}
            onUpdatePromptGuide={onUpdatePromptGuide}
            onCreatePromptGuideType={onCreatePromptGuideType}
            onDeletePromptGuideType={onDeletePromptGuideType}
            onCreatePromptGuide={onCreatePromptGuide}
            onDeletePromptGuide={onDeletePromptGuide}
            canManage={canManage}
            generateType={generateType}
            handleSelectGenerateType={handleSelectGenerateType}
            files={files}
            isLoadingUpload={isLoadingUpload}
            handleUploadChange={handleUploadChange}
            beforeUpload={beforeUpload}
            onRemoveFile={onRemoveFile}
            firstFrame={firstFrame}
            lastFrame={lastFrame}
            isLoadingFirstFrame={isLoadingFirstFrame}
            isLoadingLastFrame={isLoadingLastFrame}
            handleVideoImageUploadChange={handleVideoImageUploadChange}
          />
        </Spin>
      ),
    },
  ];
  const onChangeTab = (key: string) => {
    if (key === "prompt-templates") {
      fetchPromptGuideTypes();
    }
  };

  return (
    <>
      {contextHolder}
      {contextHolderNoti}
      <Tabs
        defaultActiveKey="prompt-templates"
        items={tabItems}
        onChange={onChangeTab}
      />
    </>
  );
};

export default TemplateSettingPage;
