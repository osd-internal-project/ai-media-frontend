"use client";
import {
  TGenerateType,
  TPromptGuide,
  TPromptGuideType,
} from "@/app/common/prompt-guide.type";
import { Form, message, Modal, notification, Spin, UploadFile } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactElement,
} from "react";

import PromptGuideComponent from "@/app/page/settings/template-new/components/prompt-guide";
import { axiosCore, axiosWorker } from "@/app/lib/axios/axios";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";

import { useOrganization } from "@/app/context/OrganizationContext";
import { canManageTemplates } from "@/app/utils/permissions";
import { RcFile, UploadChangeParam, UploadProps } from "antd/es/upload";
import UploadsServices from "@/app/services/uploads.service";
import { useSession } from "next-auth/react";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { readImageSize } from "@/app/page/project/[id]/components/tab-layout/utils/file-preview.util";

type NotificationType = "success" | "info" | "warning" | "error";

const TemplateSettingPage: FC = (): ReactElement => {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.userId;
  const [api, contextHolderNoti] = notification.useNotification();
  const [modal, contextHolder] = Modal.useModal();
  const promptguideServices = useMemo(() => PromptGuideServices(axiosCore), []);
  const masterModelTypeServices = useMemo(
    () => MasterModelTypeServices(axiosCore),
    [],
  );

  const promptguideTypeServices = useMemo(
    () => PromptGuideTypeServices(axiosCore),
    [],
  );
  const uploadsServices = useMemo(() => UploadsServices(axiosWorker), []);
  const { organizationRole } = useOrganization();

  const canManage = canManageTemplates(organizationRole || "");

  const [promptGuideForm] = Form.useForm();
  const [promptGuilds, setPromptGuilds] = useState<TPromptGuide[]>([]);
  const [allPromptGuilds, setAllPromptGuilds] = useState<TPromptGuide[]>([]);

  const [selectedPromptGuide, setSelectedPromptGuide] =
    useState<TPromptGuide | null>(null);
  const [promptGuideTypes, setPromptGuideTypes] = useState<TPromptGuideType[]>(
    [],
  );
  const [allModel, setAllModel] = useState<TMasterModelType[]>([]);
  const [generateType, setGenerateType] = useState<TGenerateType | "all">(
    "all",
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchPromptGuideTypes = async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await fetchPromptGuilds(generateType);
      const promptGuideTypes = await promptguideTypeServices.findAll();
      const models = await masterModelTypeServices.findAll();
      setAllModel(models);
      // console.log(models);
      setPromptGuideTypes(promptGuideTypes || []);
    } catch (error) {
      console.error("Error fetching prompt guide types:", error);
      setPromptGuideTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromptGuilds = async (generateType: string) => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // const models = await masterModelTypeServices.findAll();
      // setAllModel(models)
      const promptGuilds =
        await promptguideServices.findByOrganization(organizationId);
      // console.log("promptGuilds", promptGuilds);
      if (generateType === "all") {
        setPromptGuilds(promptGuilds || []);
        setAllPromptGuilds(promptGuilds || []);
      } else {
        const filterPromptGuilds = promptGuilds.filter(
          (promptGuild: TPromptGuide) =>
            promptGuild.generateType === generateType && promptGuild.title,
        );
        setPromptGuilds(filterPromptGuilds || []);
        setAllPromptGuilds(filterPromptGuilds || []);
      }
    } catch (error) {
      console.error("Error fetching prompt guilds:", error);
      setPromptGuilds([]);
    } finally {
      setLoading(false);
    }
  };
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

  // ผลลัพธ์ตัวอย่าง (showcase) — แยกจาก refImage เพราะไม่ถูกแนบตอนผู้ใช้กด Use
  const [resultFiles, setResultFiles] = useState<UploadFile[]>([]);
  const [resultUids, setResultUids] = useState<string[]>([]);
  const [isLoadingResult, setIsLoadingResult] = useState<boolean>(false);

  const fetchPromptGuideResults = async (id: number) => {
    setResultUids([]);
    setResultFiles([]);
    setIsLoadingResult(true);
    try {
      const results = await promptguideServices.getPromptGuideResults(
        String(id),
      );
      setResultUids(results.map((media) => media.uid));
      setResultFiles(
        results.map((media) => ({
          uid: media.uid,
          name: media.name,
          status: "done" as const,
          url: media.url,
        })),
      );
    } catch (error) {
      openNotificationWithIcon("error", "Failed to load result media");
      console.error("Error fetching prompt guide results:", error);
    } finally {
      setIsLoadingResult(false);
    }
  };

  const fetchPromptGuideImages = async (
    id: number,
    templateType: TGenerateType | "all",
  ) => {
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
        if (templateType === "omnihumen" || templateType === "dreamactor") {
          // console.log("promptGuideImages", promptGuideImages);
          const firstFrameFiles = promptGuideImages
            .filter((img: any) => img.index === 1)
            .map((img: any) => ({
              uid: img.uid,
              name: img.name,
              status: "completed" as const,
              url: img.url,
            }));
          // console.log("firstFrameFiles", firstFrameFiles);
          const lastFrameFiles = promptGuideImages
            .filter((img: any) => img.index === 2)
            .map((img: any) => ({
              uid: img.uid,
              name: img.name,
              status: "completed" as const,
              url: img.url,
            }));
          // console.log("lastFrameFiles", lastFrameFiles);
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
    // setSearchQuery("");
    setSelectedPromptGuide(null);
    promptGuideForm.resetFields();
    setRefImage([]);
    setFiles([]);
    setFirstFrame([]);
    setLastFrame([]);
    setResultUids([]);
    setResultFiles([]);

    if (organizationId) {
      // console.log(organizationId);
      fetchPromptGuideTypes();
    } else {
      setPromptGuideTypes([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, generateType]);

  useEffect(() => {
    const newFilter = allPromptGuilds.filter((promptGuild: TPromptGuide) =>
      promptGuild?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setPromptGuilds(newFilter);
  }, [searchQuery]);

  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
  ) => {
    api[type]({
      message: type,
      description: message,
    });
  };

  /** type ของ template ที่กำลังแก้ — ตัวกรองหน้าเป็น "all" ได้ จึงใช้แทนกันไม่ได้ */
  const editingType: TGenerateType =
    selectedPromptGuide?.generateType ??
    (generateType === "all" ? "image" : generateType);

  const onSelectPromptGuide = async (id: number) => {
    const promptGuide = await promptguideServices.findById(String(id));
    setSelectedPromptGuide(promptGuide);
    await Promise.all([
      fetchPromptGuideImages(id, promptGuide?.generateType ?? generateType),
      fetchPromptGuideResults(id),
    ]);
    promptGuideForm.setFieldsValue(promptGuide);
  };

  const onUpdatePromptGuide = async (values: TPromptGuide): Promise<void> => {
    const updatePromptGuide = await promptguideServices.update(values.id!, {
      ...values,
      organizationId,
      promptGuideImages: refImage.map((image) => image.uid),
      promptGuideResults: resultUids,
    });

    if (!updatePromptGuide) {
      openNotificationWithIcon("error", "Failed to update prompt guide");
      return;
    }
    modal.success({
      title: "Success",
      content: "Update prompt guide successfully",
    });
    fetchPromptGuideTypes();
  };

  const onCreatePromptGuideType = async (values: any) => {
    if (!organizationId) return;
    if (generateType === "all") {
      modal.warning({
        title: "Select generator type",
        content:
          "Please select a specific generator type before creating a prompt type.",
      });
      return;
    }
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

  /** คืน true เมื่อสร้างสำเร็จ แล้วเลือก template ใหม่ไว้ให้ upload รูปต่อ */
  const onCreatePromptGuide = async (values: any): Promise<boolean> => {
    if (!organizationId) return false;
    const created: TPromptGuide | undefined = await promptguideServices.create({
      ...values,
      organizationId,
      status: true,
      generateType:
        values.generateType ||
        (generateType === "all" ? "image" : generateType),
    });
    if (!created?.id) {
      openNotificationWithIcon("error", "Failed to create prompt guide");
      return false;
    }
    fetchPromptGuideTypes();
    await onSelectPromptGuide(created.id);
    message.success("Created — add images to finish the template");
    return true;
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
  function handleSelectGenerateType(value: TGenerateType | "all"): void {
    setSearchQuery("");
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
          // อ่านขนาดโดยไม่สร้าง blob: URL ซึ่ง CSP ของ prod บล็อก
          const size = await readImageSize(fileToUpload as Blob);
          if (size && Math.min(size.width, size.height) < 300) {
            throw "Image size is too small, minimum side length must not be less than 300 px";
          }
        } catch (error) {
          openNotificationWithIcon("error", String(error));
          setIsLoadingUpload(false);

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
      formData.append("generateType", editingType);
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

  const handleResultUploadChange: UploadProps["onChange"] = async ({
    file,
    fileList: newFileList,
  }) => {
    if (file.status === "removed") {
      setResultFiles(newFileList);
      return;
    }
    if (!selectedPromptGuide?.id) {
      message.warning("Please select a prompt guide");
      return;
    }
    const fileToUpload = file.originFileObj || file;
    if (!(fileToUpload instanceof Blob)) return;
    setIsLoadingResult(true);
    try {
      // เช็ก 300px เฉพาะรูป — ผลลัพธ์ของ video template เป็นไฟล์วิดีโอ
      if (fileToUpload.type.startsWith("image/")) {
        const size = await readImageSize(fileToUpload);
        if (size && Math.min(size.width, size.height) < 300) {
          throw new Error(
            "Image size is too small, minimum side length must not be less than 300 px",
          );
        }
      }
      const formData = new FormData();
      formData.append("userId", userId ? userId : "");
      formData.append("index", newFileList.length.toString());
      formData.append("promptGuideId", String(selectedPromptGuide.id));
      formData.append("generateType", editingType);
      formData.append("organizationId", organizationId || "");
      formData.append("uid", file.uid);
      formData.append("file", fileToUpload);
      const result = await uploadsServices.uploadPromptGuideImage(formData);
      setResultUids((prev) => [...prev, result.uid]);
      setResultFiles(newFileList);
    } catch (error) {
      openNotificationWithIcon(
        "error",
        error instanceof Error ? error.message : "Upload failed",
      );
    } finally {
      setIsLoadingResult(false);
    }
  };

  const onRemoveResult = (file: UploadFile) => {
    setResultUids((prev) => prev.filter((uid) => uid !== file.uid));
    uploadsServices.removePromptGuideImage(file.uid);
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
            // อ่านขนาดโดยไม่สร้าง blob: URL ซึ่ง CSP ของ prod บล็อก
            const size = await readImageSize(fileToUpload as Blob);
            if (size && Math.min(size.width, size.height) < 300) {
              throw "Image size is too small, minimum side length must not be less than 300 px";
            }
          } catch (error) {
            openNotificationWithIcon("error", String(error));
            setIsLoadingFirstFrame(false);
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
        formData.append("generateType", editingType);
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
            // อ่านขนาดโดยไม่สร้าง blob: URL ซึ่ง CSP ของ prod บล็อก
            const size = await readImageSize(fileToUpload as Blob);
            if (size && Math.min(size.width, size.height) < 300) {
              throw "Image size is too small, minimum side length must not be less than 300 px";
            }
          } catch (error) {
            openNotificationWithIcon("error", String(error));
            setIsLoadingLastFrame(false);
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
        formData.append("generateType", editingType);
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

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {contextHolder}
      {contextHolderNoti}
      <Spin
        spinning={loading}
        style={{
          height: "100%",
          minHeight: 0,
          display: "block",
        }}
      >
        <PromptGuideComponent
          searchQuery={searchQuery}
          allModel={allModel}
          setSearchQuery={setSearchQuery}
          promptGuilds={promptGuilds}
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
          resultFiles={resultFiles}
          isLoadingResult={isLoadingResult}
          handleResultUploadChange={handleResultUploadChange}
          onRemoveResult={onRemoveResult}
        />
      </Spin>
    </div>
  );
};

export default TemplateSettingPage;
