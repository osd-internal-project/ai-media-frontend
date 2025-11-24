"use client";

import React, { useEffect, useState, type FC } from "react";
import { Form, message, Tabs, type UploadFile } from "antd";
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
import { libraryDatas } from "./test";
import PromptLibrary from "./components/prompt-library";
import PromptActivity from "./components/prompt-activity";
import { useSession } from "next-auth/react";
const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const projectService = ProjectService(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const [filesvdo, setFilesVdo] = useState<UploadFile[]>([]);
  const [formcreateVdo] = Form.useForm();
  const [getdatavdo, setDataVdo] = useState<any>([]);
  const [clicksubmitVdo, setClickVdo] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [libraries, setLibraries] = useState<any[]>([]);
  const { id } = params as { id: string };

  useEffect(() => {
    if (loadingData) {
      fecthdata();
    }
  }, [loadingData]);

  const fecthdata = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) {
      setLoadingData(false);
      return;
    }
    try {
      const response = await projectService.findById(id);
      setProject(response);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingData(false);
    }
  };
  function fecthDataLibrary() {
    setLibraries(libraryDatas || []);
  }

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
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const response = await GenerateImageServices(axiosCore).create({ ...base, projectId: id, userId: session?.user?.id });
      if (!response?.id) {
        message.error("สร้างคำขอล้มเหลว");
        setLoading(false);
        return;
      }
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
              formcreateVdo.resetFields();
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

  const onChangeTab = (key: string) => {
    if (key === "4") {
      fecthDataLibrary();
    }
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
            children: <PromptGenerateImage projectId={id} userId={session?.user?.id} />,
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
                files={filesvdo}
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
            children: <PromptLibrary libraries={libraries} />,
          },
          {
            key: "5",
            label: (
              <span>
                <AppstoreOutlined />
                All Activity.
              </span>
            ),
            children: <PromptActivity />,
          },
        ]}
        onChange={onChangeTab}
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
