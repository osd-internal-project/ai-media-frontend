"use client";
import type { TGroup } from "@/app/common/groups.type";
import { Card, Form, Input } from "antd";
import React from "react";

const UpdateGroupPage = () => {
  const [formmanage] = Form.useForm();

  const onFinish = async (value: TGroup) => {};
  return (
    <div>
      <Form<TGroup> name={`manage-group`} form={formmanage} layout="vertical" autoComplete="off" className="dark-form" onFinish={onFinish}>
        <div className="grid grid-cols-2 w-full gap-3">
          <Card className="col col-span-1 !bg-transparent !border-gray-800">
            <div className="text-xl mb-2">{`Edit group details`}</div>
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
              Support letters, numbers, and the following special characters: ".", "_", "-", up to 64 characters
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
          </Card>
          <Card className="col col-span-1 "></Card>
        </div>
        <Card></Card>
      </Form>
    </div>
  );
};

export default UpdateGroupPage;
