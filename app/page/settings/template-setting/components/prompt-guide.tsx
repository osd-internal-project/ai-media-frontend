import type { TPromptGuideType } from "@/app/common/prompt-guide.type";
import {
  ArrowRightOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Modal,
  Popconfirm,
  Space,
} from "antd";
import React, { useState, type FC, type ReactElement } from "react";

export interface props {
  promptGuideTypes: TPromptGuideType[];
  promptGuideForm: FormInstance;
  onSelectPromptGuide: (id: number) => void;
  selectedPromptGuide: TPromptGuideType | null;
  onUpdatePromptGuide: (values: TPromptGuideType) => void;
  onCreatePromptGuideType: (values: any) => void;
  onDeletePromptGuideType: (id: number) => void;
  onCreatePromptGuide: (values: any) => void;
  onDeletePromptGuide: (id: number) => void;
}

const PromptGuideComponent: FC<props> = ({
  promptGuideTypes,
  promptGuideForm,
  onSelectPromptGuide,
  selectedPromptGuide,
  onUpdatePromptGuide,
  onCreatePromptGuideType,
  onDeletePromptGuideType,
  onCreatePromptGuide,
  onDeletePromptGuide,
}): ReactElement => {
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [typeForm] = Form.useForm();
  const [guideForm] = Form.useForm();

  const handleAddType = () => {
    typeForm.resetFields();
    setIsTypeModalOpen(true);
  };

  const handleCreateType = (values: any) => {
    onCreatePromptGuideType(values);
    setIsTypeModalOpen(false);
  };

  const handleAddGuide = (typeId: number) => {
    guideForm.resetFields();
    setSelectedTypeId(typeId);
    setIsGuideModalOpen(true);
  };

  const handleCreateGuide = (values: any) => {
    if (selectedTypeId) {
      onCreatePromptGuide({ ...values, promptGuideTypeId: selectedTypeId });
      setIsGuideModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen p-8 text-white font-sans">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-lg font-bold">Prompt Guide</h1>
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddType}
              type="primary"
              size="small"
            >
              Add Type
            </Button>
          </div>
          <div className="space-y-4">
            {promptGuideTypes.map((group) => (
              <div key={group.id}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#888] font-medium">{group.title}</h3>
                  <Space>
                    <Button
                      icon={<PlusOutlined />}
                      size="small"
                      type="text"
                      className="text-[#888] hover:text-white"
                      onClick={() => handleAddGuide(group.id)}
                    />
                    <Popconfirm
                      title="Delete this type?"
                      onConfirm={() => onDeletePromptGuideType(group.id)}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        type="text"
                        danger
                      />
                    </Popconfirm>
                  </Space>
                </div>
                <div className="space-y-2 pl-2">
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
                          className={`text-base truncate ${
                            isActive ? "text-white" : "text-[#CCC]"
                          }`}
                        >
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <Popconfirm
                            title="Delete this prompt?"
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              onDeletePromptGuide(item.id!);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                          >
                            <DeleteOutlined
                              className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                          <ArrowRightOutlined
                            className={`text-base transition-colors duration-300 ${
                              isActive
                                ? "text-[#888]"
                                : "text-[#555] group-hover:text-[#888]"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Col>
        <Col span={18}>
          {selectedPromptGuide && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">Edit Prompt</div>
                <Button
                  danger
                  type="primary"
                  onClick={() => onDeletePromptGuide(selectedPromptGuide.id!)}
                >
                  Delete
                </Button>
              </div>
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
                <Form.Item name={"textPrompt"} label="Text Prompt">
                  <Input.TextArea rows={10} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Form>
            </Card>
          )}
        </Col>
      </Row>

      {/* Type Modal */}
      <Modal
        title="Create Prompt Type"
        open={isTypeModalOpen}
        onCancel={() => setIsTypeModalOpen(false)}
        onOk={() => typeForm.submit()}
      >
        <Form form={typeForm} onFinish={handleCreateType} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Guide Modal */}
      <Modal
        title="Create Prompt Guide"
        open={isGuideModalOpen}
        onCancel={() => setIsGuideModalOpen(false)}
        onOk={() => guideForm.submit()}
      >
        <Form form={guideForm} onFinish={handleCreateGuide} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* Default Status */}
          <Form.Item name="status" initialValue={true} hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromptGuideComponent;
