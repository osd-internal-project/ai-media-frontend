import type { TGroup } from "@/app/common/groups.type";
import { Button, Card, Divider, Form, Input, Modal, Select, type FormInstance } from "antd";
import React, { type FC, type ReactElement } from "react";
import { useRouter } from "next/navigation";

export interface props {
  setOpen: (value: boolean) => void;
  open: boolean;
  formmanage: FormInstance;
  onFinish: (values: TGroup) => void;
  dataGroups: TGroup[];
}

const ManageGroups: FC<props> = ({ setOpen, open, formmanage, onFinish, dataGroups }): ReactElement => {
  const navigate = useRouter();
  return (
    <div className="grid grid-cols-4 gap-5">
      {dataGroups?.length > 0 ? (
        <>
          {dataGroups?.map((e) => {
            return (
              <>
                <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
                  <div className="bg-black hover:bg-black rounded-lg transition-all duration-300">
                    <Card>
                      <div className="font-semibold text-base text-xl">{`Total ${e?.users ? e?.users.length : 0} Users`}</div>
                      <Divider className="!border-gray-700 !p-0" />
                      <div className="text-2xl font-bold ">{e.name}</div>
                      <a
                        type="link"
                        className="!underline !text-[#87DDDE]"
                        onClick={() => navigate.push(`group-permission/${e.groupId}`)}
                      >{`Edit group`}</a>
                    </Card>
                  </div>
                </div>
              </>
            );
          })}
        </>
      ) : null}
      <div className="p-0 hover:p-[1px] bg-gradient-to-r from-[#87DDDE] via-[#6366F1] to-[#87DDDE] rounded-lg !transition-all duration-300  ">
        <div className="bg-black hover:bg-black rounded-lg transition-all duration-300"></div>
        <Card className="col-span-1 flex flex-col  h-full ">
          <div className="font-semibold text-base text-xl mb-3">{`Add Group`}</div>
          <div className="text-lg text-gray-500 mb-3">{`Add new group, if it doesn’t exist.`}</div>
          <div className="flex justify-center w-full ">
            <Button type="primary" className="mt-2 !bg-[#6366F1] w-full" onClick={() => setOpen(true)} size="large">
              Add Group
            </Button>
          </div>
        </Card>
      </div>

      {open ? (
        <>
          <Modal
            title={`Add Group`}
            open={open}
            footer={false}
            onCancel={() => setOpen(false)}
            width={700}
            className="custom-modal"
            styles={{
              header: {
                backgroundColor: "#1f1f1f",
                color: "#fff",
                borderBottom: "none",
                padding: "16px 16px 16px",
              },
              body: {
                backgroundColor: "#1f1f1f",
                padding: "16px",
              },
              content: {
                backgroundColor: "#1f1f1f",
                borderRadius: "16px",
              },
              mask: {
                backdropFilter: "blur(8px)",
              },
            }}
          >
            <Form<TGroup> name={`manage-group`} form={formmanage} layout="vertical" autoComplete="off" className="dark-form" onFinish={onFinish}>
              <Form.Item
                label={<span className="text-gray-300">User group name</span>}
                name={"name"}
                rules={[{ required: true, message: "Please input user group name!" }]}
              >
                <Input
                  placeholder="Text"
                  className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                />
              </Form.Item>
              <div className="text-xs text-gray-500 -mt-4 mb-4 flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-[10px]">i</span>
                {`Support letters, numbers, and the following special characters: ".", "_", "-", up to 64 characters`}
              </div>

              <Form.Item label={<span className="text-gray-300">Display name</span>} name={"displayName"}>
                <Input
                  placeholder="Text"
                  className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                />
              </Form.Item>
              <div className="text-xs text-gray-500 -mt-4 mb-4 flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-[10px]">i</span>
                up to 64 characters
              </div>

              <Form.Item label={<span className="text-gray-300">Description</span>} name={"description"}>
                <Input.TextArea
                  placeholder="up to 128 characters"
                  rows={4}
                  className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                />
              </Form.Item>

              <div className="flex justify-center w-full mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-[#6366F1] hover:!bg-[#5558E3] !border-none w-full !h-11 !text-base !font-medium"
                >
                  Add Group
                </Button>
              </div>
            </Form>

            <style jsx global>{`
              .custom-modal .ant-modal-close {
                color: #9ca3af;
              }
              .custom-modal .ant-modal-close:hover {
                color: #fff;
                background-color: rgba(255, 255, 255, 0.1);
              }
              .custom-modal .ant-modal-title {
                color: #fff !important;
                font-size: 24px;
                font-weight: 600;
              }
              .dark-form .ant-form-item-label > label {
                color: #d1d5db;
              }
              .dark-form .ant-input-status-error:not(.ant-input-disabled) {
                background-color: #2a2a2a !important;
                border-color: #ef4444 !important;
              }
              .dark-form .ant-form-item-explain-error {
                color: #ef4444;
              }
            `}</style>
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default ManageGroups;
