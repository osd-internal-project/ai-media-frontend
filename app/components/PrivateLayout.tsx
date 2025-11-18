"use client";
import { ConfigProvider, Layout, Menu, Image, Avatar, Badge, Button, Form, Modal, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { renderMenuItems, MenuSider } from "../config/menu";
import Sider from "antd/es/layout/Sider";
import PrivateNavigation from "./PrivateNavigation";
import PrivateContent from "./PrivateContent";
import { useSession } from "next-auth/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import UserServices from "../services/users.service";
import ProjectService from "../services/project.service";
import { axiosCore, axiosUser } from "../lib/axios/axios";
import type { TUser } from "../common/user.type";
import type { IProject } from "../common/project.type";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];
  const currentPathSub = pathname.split("/")[3];
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const userServices = UserServices(axiosUser);
  const projectService = ProjectService(axiosCore);
  const [getdata, setData] = useState<TUser[]>([]);
  const [getProject, setProject] = useState<IProject[]>([]);

  useEffect(() => {
    fecthMasterData();
    if (loading) {
      fecthdata();
    }
  }, [loading]);

  const fecthdata = async () => {
    const response = await projectService.findAll();
    console.log(response);
    setProject(response);
    setLoading(false);
  };

  const fecthMasterData = async () => {
    const response = await userServices.findAll();
    setData(response);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    const response = await projectService.create(values);
    if (response) {
      setOpen(false);
      setLoading(true);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: "#000000",
          colorBgContainer: "#000000",
          colorBgElevated: "#1a1a1a",
          colorTextBase: "#f0f0f0",
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemColor: "white",
            itemHoverBg: "#363A3D",
            itemHoverColor: "white",
            itemSelectedBg: "#363A3D",
            itemSelectedColor: "white",
            itemDisabledColor: "#white",
          },
          Layout: {
            siderBg: "#0f0f0f",
          },
          Select: {
            selectorBg: "#151515",
            colorBgContainer: "#151515",
            colorText: "white",
            colorTextPlaceholder: "#777",
            colorBorder: "#333",
            colorBgElevated: "#1e1e1e",
            optionActiveBg: "#333",
            optionSelectedBg: "#444",
          },
        },
      }}
    >
      {open ? (
        <Modal title="Create Project" open={open} onCancel={handleClose} footer={false} okText="Create" width={500}>
          <Form form={form} layout="vertical" name="create_project_form" onFinish={onFinish}>
            <Form.Item label="Project Name" name="name" rules={[{ required: true, message: "Please enter project name" }]}>
              <Input placeholder="Enter project name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional description" />
            </Form.Item>

            <Form.Item label="Add Members" name="members">
              <Select
                mode="multiple"
                placeholder="Select users"
                options={getdata.map((e) => ({
                  value: e.userId,
                  label: e.fullname,
                }))}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit">{`Create Project`}</Button>
          </Form>
        </Modal>
      ) : null}
      <Layout className="h-screen overflow-hidden">
        <Sider width={250} trigger={null} collapsible collapsed={collapsed} className="hidden md:block p-2 h-screen">
          <div className="bg-black rounded-2xl h-full flex flex-col">
            <div className="w-full flex justify-center items-center py-5 flex-shrink-0">
              <Image width={"150px"} src="/images/Logo.png" alt="OSD Logo" preview={false} className="mb-2" />
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Menu
                mode="inline"
                selectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
                defaultSelectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
                items={renderMenuItems(MenuSider)}
              />
              <div className=" !text-gray-400 px-4 mt-2">
                {`PROJECT`}
                <div className="mt-3 w-full">
                  <Button icon={<PlusCircleOutlined />} className="w-full" onClick={handleOpen}>{`Add new project`}</Button>
                </div>
                {getProject.map((e) => {
                  return (
                    <div className="w-full flex justify-center mt-2 gap-4">
                      <Button className="w-full !bg-gray-800" onClick={() => router.push(`/page/project/${e.id}`)}>
                        {e.name}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-black rounded-2xl p-4 flex items-center gap-5 flex-shrink-0 mt-3">
              <Badge dot color="green">
                <Avatar />
              </Badge>
              <div className="grid grid-cols-1">
                <span className="text-white text-sm">{`${session?.user?.name}`}</span>
                <span className="text-[#6366F1]">Premium</span>
              </div>
            </div>
          </div>
        </Sider>
        <Layout className="flex-1 w-full h-full overflow-auto">
          <PrivateNavigation user={session?.user ? { fullname: session.user.name ?? "" } : undefined} />
          <div className="w-full h-full">
            <PrivateContent user={session?.user ? { fullname: session.user.name ?? "" } : undefined}>{children}</PrivateContent>
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
