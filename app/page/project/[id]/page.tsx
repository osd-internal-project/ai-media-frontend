"use client";

import React, { useEffect, useState, type FC } from "react";
import { Form, message, Spin, Tabs, type UploadFile } from "antd";
import PromptGenerateImage from "./components/prompt-generate-image";
import { AppstoreOutlined, PictureOutlined } from "@ant-design/icons";
import type { ITFromGenerate } from "@/app/common";
import type { RcFile, UploadProps } from "antd/es/upload";
import GenerateImageServices from "@/app/services/generate-image.service";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import PromptGenerateVdo from "./components/prompt-generate-vdo";

const GenerateImagePage: FC = () => {
  const params = useParams();
  const [formcreateImage] = Form.useForm();
  const [formcreateVdo] = Form.useForm();
  const projectService = ProjectService(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [filesvdo, setFilesVdo] = useState<UploadFile[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [getdata, setData] = useState<any>([]);
  const [getdatavdo, setDataVdo] = useState<any>([]);

  const [clicksubmit, setClickSubmit] = useState<boolean>(false);
  const [clicksubmitVdo, setClickVdo] = useState<boolean>(false);

  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    if (loadingData) {
      fecthdata();
    }
  }, [loadingData]);

  const fecthdata = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) {
      console.warn("No project id provided in route params");
      setLoadingData(false);
      return;
    }

    try {
      const response = await projectService.findById(id);
      console.log(response);
      setProject(response);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const onFinish = async (values: ITFromGenerate) => {
    let base: ITFromGenerate = values;
    setClickSubmit(true);
    setLoading(true);
    if (files.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      formData.append("files", files[0].originFileObj);
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload.fileName };
    }
    try {
      const response = await GenerateImageServices(axiosCore).create(base);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setData(response);
        message.success("สร้างคำขอสำเร็จ");
        formcreateImage.resetFields();
        setFiles([]);
      } else {
        message.error("ไม่มีข้อมูลที่ได้กลับมา");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  const onFinishVDO = async (values: ITFromGenerate) => {
    let base: ITFromGenerate = values;
    setClickVdo(true);
    setLoading(true);
    if (filesvdo.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      formData.append("files", filesvdo[0].originFileObj);
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload.fileName };
    }
    try {
      // ปรับปรุงเงื่อนไขการเช็คสถานะ
      const response = await GenerateImageServices(axiosCore).create(base);

      // เช็คว่ามี response และมี id หรือไม่
      if (!response?.id) {
        message.error("สร้างคำขอล้มเหลว");
        setLoading(false);
        return;
      }

      // ฟังก์ชันเช็คสถานะแบบ polling
      const checkStatus = async () => {
        try {
          const task = await GenerateImageServices(axiosCore).findById(response.id);
          console.log(task);

          // กรณีสำเร็จ
          if (task?.status === "succeeded") {
            // เช็คว่ามีข้อมูลรูปภาพหรือไม่
            if (task && task.content) {
              setDataVdo(task);
              message.success("สร้างรูปภาพสำเร็จ");
              formcreateImage.resetFields();
              setFilesVdo([]);
              setLoading(false);
              return;
            } else {
              message.error("ไม่มีข้อมูลรูปภาพที่ได้รับกลับมา");
              setLoading(false);
              return;
            }
          }

          // กรณีล้มเหลว
          if (task?.status === "failed") {
            message.error("การสร้างรูปภาพล้มเหลว");
            setLoading(false);
            return;
          }

          // กรณียังประมวลผลอยู่ (processing, pending, etc.)
          if (task?.status === "processing" || task?.status === "pending") {
            // เช็คสถานะอีกครั้งหลังจาก 3 วินาที
            setTimeout(checkStatus, 3000);
            return;
          }

          // กรณีสถานะอื่นๆ ที่ไม่รู้จัก
          console.warn("Unknown status:", task?.status);
          setTimeout(checkStatus, 3000);
        } catch (err) {
          console.error("Error checking status:", err);
          message.error("เกิดข้อผิดพลาดระหว่างตรวจสอบสถานะ");
          setLoading(false);
        }
      };

      // เริ่มเช็คสถานะ
      checkStatus();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  const beforeUploadFiles = (file: RcFile) => {
    if (files.find((oneFile) => oneFile.name === file.name)) {
      message.warning(`ชื่อไฟล์ ${file.name} ซ้ำ`);
      return false;
    }
    return false;
  };
  const beforeUploadFilesVDO = (file: RcFile) => {
    if (filesvdo.find((oneFile) => oneFile.name === file.name)) {
      message.warning(`ชื่อไฟล์ ${file.name} ซ้ำ`);
      return false;
    }
    return false;
  };

  const handleChangeFiles: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
    return setFiles(newFileList);
  };

  const handleChangeVDO: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
    return setFilesVdo(newFileList);
  };

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div>
        <HeaderGenerateImagePage getProject={getProject} />
      </div>
      <Tabs
        className="custom-tabs"
        type="card"
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: (
              <span>
                <PictureOutlined />
                Image Gen.
              </span>
            ),
            children: (
              <PromptGenerateImage
                formcreateImage={formcreateImage}
                onFinish={onFinish}
                handleChangeFiles={handleChangeFiles}
                beforeUploadFiles={beforeUploadFiles}
                files={filesvdo}
                loading={loading}
                getdata={getdata}
                setData={setData}
                clicksubmit={clicksubmit}
              />
            ),
          },
          {
            key: "2",
            label: (
              <span>
                <AppstoreOutlined />
                VDO Gen.
              </span>
            ),
            children: (
              <PromptGenerateVdo
                formcreateVdo={formcreateVdo}
                onFinish={onFinishVDO}
                handleChangeFiles={handleChangeVDO}
                beforeUploadFiles={beforeUploadFilesVDO}
                files={files}
                loading={loading}
                getdata={getdatavdo}
                setData={setDataVdo}
                clicksubmit={clicksubmitVdo}
              />
            ),
          },
          {
            key: "4",
            label: (
              <span>
                <AppstoreOutlined />
                Library.
              </span>
            ),
          },
          {
            key: "5",
            label: (
              <span>
                <AppstoreOutlined />
                All Activity.
              </span>
            ),
          },
        ]}
        onChange={onChange}
      />
      <style>{`
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 0;
        }

        .custom-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }

        .custom-tabs .ant-tabs-nav-wrap {
          background: #000000;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          padding: 8px 12px;
          display: inline-block;
        }

        .custom-tabs .ant-tabs-tab {
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #9ca3af;
        }

        .custom-tabs .ant-tabs-tab-active {
          background: transparent;
        }

        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ffffff;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background: #6366f1;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        .custom-tabs .ant-tabs-tab .anticon {
          margin-right: 8px;
        }

        .custom-tabs .ant-tabs-content-holder {
          padding-top: 40px;
        }
      `}</style>
    </div>
  );
};
export default GenerateImagePage;
