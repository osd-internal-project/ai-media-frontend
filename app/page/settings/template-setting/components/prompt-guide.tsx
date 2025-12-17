import type { TPromptGuideType } from "@/app/common/prompt-guide.type";
import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from "antd";
import React, { useState, type FC, type ReactElement } from "react";

export interface props {
  promptGuideTypes: TPromptGuideType[];
  promptGuideForm: FormInstance;
  onSelectPromptGuide: (id: number) => void;
  selectedPromptGuide: TPromptGuideType | null;
  onUpdatePromptGuide: (values: TPromptGuideType) => void;
}

const PromptGuideComponent: FC<props> = ({
  promptGuideTypes,
  promptGuideForm,
  onSelectPromptGuide,
  selectedPromptGuide,
  onUpdatePromptGuide,
}): ReactElement => {
  return (
    <div className="min-h-screen p-8 text-white font-sans">
      <Row gutter={[16, 16]}>
        <Col span={5}>
          <h1 className="text-lg font-bold mb-8">Prompt Guide</h1>
          <div className="space-y-4">
            {/* <Button icon={<PlusOutlined />} className=" w-full">
              Add Type
            </Button> */}
            {promptGuideTypes.map((group) => (
              <div key={group.id}>
                <h3 className="text-[#888]  mb-2 font-medium">{group.title}</h3>
                {/* <Button icon={<PlusOutlined />} className=" w-full mb-4 ">
                  Add Prompt
                </Button> */}
                <div className="space-y-2">
                  {group.promptGuide?.map((item) => {
                    const isActive = selectedPromptGuide?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectPromptGuide(item.id!)}
                        className={`
                          group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
                          ${
                            isActive
                              ? "bg-[#1E1E1E]"
                              : "bg-[#1E1E1E] hover:bg-[#252525]"
                          }
                        `}
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(#1E1E1E, #1E1E1E) padding-box, linear-gradient(90deg, #64E9FF, #9F55FF) border-box",
                                border: "1px solid transparent",
                                boxShadow: "0 0 20px rgba(100, 233, 255, 0.1)",
                              }
                            : {
                                border: "1px solid transparent",
                                borderColor: "transparent",
                              }
                        }
                      >
                        <span
                          className={`text-base ${
                            isActive ? "text-white" : "text-[#CCC]"
                          }`}
                        >
                          {item.title}
                        </span>
                        <ArrowRightOutlined
                          className={`text-base transition-colors duration-300 ${
                            isActive
                              ? "text-[#888]"
                              : "text-[#555] group-hover:text-[#888]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Col>
        <Col span={19}>
          {selectedPromptGuide && (
            <Card>
              <div className="font-bold text-lg">Prompt </div>
              <Form
                layout="vertical"
                form={promptGuideForm}
                onFinish={onUpdatePromptGuide}
              >
                {" "}
                <Form.Item name={"id"} label="id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={"title"} label="Title">
                  <Input />
                </Form.Item>
                {/* <Form.Item name={"type"} label="Type">
                <Select />
              </Form.Item> */}
                <Form.Item name={"textPrompt"} label="Text Prompt">
                  <Input.TextArea rows={10} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PromptGuideComponent;
