"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, message, Space, Table, Modal, Tag, Switch, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import { axiosCore } from "@/app/lib/axios/axios";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { CopyOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const ModelPricingManagementPage = () => {
  const masterModelTypeServices = MasterModelTypeServices(axiosCore);
  
  const [form] = Form.useForm();
  const [models, setModels] = useState<TMasterModelType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Watch calculation type to change input fields dynamically
  const calculationType = Form.useWatch("calculationType", form);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await masterModelTypeServices.findAll();
      setModels(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load model configurations");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record?: TMasterModelType) => {
    if (record) {
      setEditingId(record.id);
      
      let calcType = "FORMULA";
      let creditFormula = "";
      let tokenFormula = "";
      let fixedCreditPerSec = 0;
      let fixedTokenPerSec = 0;
      let rawJson = "{}";

      if (record.modelDetails) {
        const details = record.modelDetails;
        calcType = details.calculationType || "FORMULA";
        if (calcType === "FORMULA" || calcType === "USE_TOKEN" || calcType === "NOT_USE_TOKEN") {
          creditFormula = details.creditFormula || details.formula || "";
          tokenFormula = details.tokenFormula || "";
        } else if (calcType === "FIXED_PER_SEC") {
          fixedCreditPerSec = details.fixedCreditPerSec || 0;
          fixedTokenPerSec = details.fixedTokenPerSec || 0;
        } else {
          // Fallback to raw JSON string for PIXEL_TIER or custom
          rawJson = JSON.stringify(details, null, 2);
        }
      }

      form.setFieldsValue({
        modelType: record.modelType,
        type: record.type,
        description: record.description,
        provider: record.provider,
        iconUrl: record.iconUrl,
        isDefault: record.isDefault,
        calculationType: calcType,
        creditFormula,
        tokenFormula,
        fixedCreditPerSec,
        fixedTokenPerSec,
        rawJson,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ 
        calculationType: "FORMULA",
        creditFormula: "body.duration * 42",
        tokenFormula: "body.duration * 49846.15385",
        rawJson: "{}" 
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    try {
      let detailsJson: any = { calculationType: values.calculationType };
      
      if (values.calculationType === 'FORMULA' || values.calculationType === 'USE_TOKEN' || values.calculationType === 'NOT_USE_TOKEN') {
        detailsJson.creditFormula = values.creditFormula;
        detailsJson.tokenFormula = values.tokenFormula;
      } else if (values.calculationType === 'FIXED_PER_SEC') {
        detailsJson.fixedCreditPerSec = values.fixedCreditPerSec;
        detailsJson.fixedTokenPerSec = values.fixedTokenPerSec;
      } else {
        // PIXEL_TIER or Others
        try {
          detailsJson = JSON.parse(values.rawJson);
          detailsJson.calculationType = values.calculationType; // Force to current type
        } catch (e) {
          message.error("Invalid JSON format in Raw Details");
          return;
        }
      }

      const payload = {
        modelType: values.modelType,
        type: values.type,
        description: values.description,
        isDefault: values.isDefault || false,
        provider: values.provider?.trim() || null,
        iconUrl: values.iconUrl?.trim() || null,
        modelDetails: detailsJson,
      };

      if (editingId) {
        await masterModelTypeServices.update(editingId, payload);
        message.success("Model updated successfully");
      } else {
        await masterModelTypeServices.create(payload);
        message.success("Model created successfully");
      }
      setIsModalOpen(false);
      fetchModels();
    } catch (error) {
      message.error("Action failed");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await masterModelTypeServices.delete(id);
      message.success("Model deleted successfully");
      fetchModels();
    } catch (error) {
      message.error("Failed to delete model");
    }
  };

  const columns: ColumnsType<TMasterModelType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Model Tag",
      dataIndex: "modelType",
      key: "modelType",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Category Type",
      dataIndex: "type",
      key: "type",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Calculation Strategy",
      dataIndex: "modelDetails",
      key: "strategy",
      render: (details) => {
        if (!details) return "-";
        return <Tag color="orange">{details?.calculationType || "Unknown"}</Tag>;
      },
    },
    {
      title: "Logic Config (JSON Preview)",
      dataIndex: "modelDetails",
      key: "modelDetails",
      render: (details) => {
        if (!details) return "-";
        return (
          <div className="max-w-md truncate text-[var(--legacy-gray-400)] text-xs bg-[var(--legacy-surface-gray-800)] p-2 rounded">
            {JSON.stringify(details)}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className="text-blue-500 hover:text-blue-400"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold  mb-2">Model Calculation Logic</h1>
          <p className="text-[var(--legacy-gray-400)]">Manage credit/token formulas for each GenAI model</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Model Logic
        </Button>
      </div>

      <Table
        dataSource={models}
        columns={columns}
        size="small"
        rowKey="id"
        loading={loading}
        pagination={false}
        className="rounded-lg  "
      />

      <Modal
        title={<span className="text-[var(--legacy-ink)]">{editingId ? "Edit Model Logic" : "Create Model Logic"}</span>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        className="dark-modal"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="modelType"
              label={<span className="text-[var(--legacy-gray-300)]">Model Key (e.g. seedance, realman)</span>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)]" />
            </Form.Item>

            <Form.Item
              name="type"
              label={<span className="text-[var(--legacy-gray-300)]">Category (e.g. VIDEO, IMAGE)</span>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)]" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="text-[var(--legacy-gray-300)]">Description</span>}
          >
            <Input.TextArea rows={2} className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)]" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="provider"
              label={<span className="text-[var(--legacy-gray-300)]">Provider (e.g. BytePlus)</span>}
            >
              <Input maxLength={50} className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)]" />
            </Form.Item>

            <Form.Item
              name="iconUrl"
              label={<span className="text-[var(--legacy-gray-300)]">Icon URL</span>}
              rules={[{ pattern: /^(https?:\/\/|\/(?!\/))\S+$/, message: "Use https://... or a path like /providers/byteplus.png" }]}
            >
              <Input placeholder="/providers/byteplus.png" className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)]" />
            </Form.Item>
          </div>

          <Form.Item
            name="isDefault"
            valuePropName="checked"
          >
             <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          </Form.Item>

          <div className="border border-[var(--legacy-line-gray-700)] p-4 rounded-lg bg-[var(--legacy-surface-1c1c1e)] mt-4 mb-4">
            <Form.Item
              name="calculationType"
              label={<span className="text-[var(--legacy-ink)] font-bold">Calculation Strategy</span>}
              rules={[{ required: true }]}
            >
              <Select 
                options={[
                  { value: 'FORMULA', label: 'FORMULA (Normal Evaluated Logic)' },
                  { value: 'USE_TOKEN', label: 'USE_TOKEN (Uses execution token if available + Fallback formula)' },
                  { value: 'NOT_USE_TOKEN', label: 'NOT_USE_TOKEN (Ignores generation tokens, calculates by inputs)' },
                ]}
                className="w-full"
                popupClassName="dark-dropdown"
              />
            </Form.Item>

            {(calculationType === "FORMULA" || calculationType === "USE_TOKEN" || calculationType === "NOT_USE_TOKEN") && (
              <div className="mt-4 p-4 border border-blue-900 bg-[var(--legacy-surface-16213e)] rounded text-sm text-blue-200 space-y-3">

                {/* Variables reference */}
                <div>
                  <p className="font-semibold text-blue-300 mb-1">Available variables</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs">
                    <li><code>token</code> — execution token count (from API response)</li>
                    <li><code>body.duration</code> — duration in seconds</li>
                    <li><code>body.width</code>, <code>body.height</code> — resolution</li>
                    <li><code>body.images</code> — number of images</li>
                    <li><code>body.generateAudio</code> — boolean or <code>&apos;Yes&apos;</code></li>
                    <li><code>body.quality</code>, <code>body.size</code>, <code>body.model</code> — any field from the request</li>
                  </ul>
                </div>

                {/* Math helpers */}
                <div>
                  <p className="font-semibold text-blue-300 mb-1">Math helpers</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs">
                    <li><code>pow(base, exp)</code> — e.g. <code>pow(body.width, 2)</code></li>
                    <li><code>abs(x)</code>, <code>min(a,b)</code>, <code>max(a,b)</code></li>
                    <li><code>round(x)</code>, <code>ceil(x)</code>, <code>floor(x)</code></li>
                    <li>Ternary: <code>condition ? valueIfTrue : valueIfFalse</code></li>
                  </ul>
                </div>

                {/* Examples per calculationType */}
                {calculationType === "NOT_USE_TOKEN" && (
                  <div>
                    <p className="font-semibold text-blue-300 mb-1">NOT_USE_TOKEN — Credit formula examples (no token used)</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs">
                      <li><code>body.duration * 42</code></li>
                      <li><code>body.images * 10</code></li>
                      <li><code>ternary(body.resolution === &apos;2k&apos;, 20, 22.5)</code></li>
                      <li><code>ternary(body.resolution === &apos;2k&apos;, 20, ternary(body.resolution === &apos;4k&apos;, 30, 15))</code></li>
                      <li><code>ternary(body.generateAudio === true, body.duration * 25, body.duration * 15)</code></li>
                      <li><code>round(body.duration * 42)</code></li>
                    </ul>
                  </div>
                )}

                {calculationType === "USE_TOKEN" && (
                  <div>
                    <p className="font-semibold text-blue-300 mb-1">USE_TOKEN examples</p>
                    <p className="text-blue-400 text-xs mb-1">Token formula (used when token = 0 from API):</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs mb-2">
                      <li><code>body.duration * 49846.15</code></li>
                      <li><code>body.duration * 20769.23</code></li>
                    </ul>
                    <p className="text-blue-400 text-xs mb-1">Credit formula (receives resolved <code>token</code>):</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs">
                      <li><code>round(token / 1186.813)</code></li>
                      <li><code>ternary(token &gt; 0, round(token / 1000), body.duration * 30)</code></li>
                      <li><code>ternary(body.generateAudio === &apos;Yes&apos;, round(token / 800), round(token / 1186.813))</code></li>
                    </ul>
                  </div>
                )}

                {calculationType === "FORMULA" && (
                  <div>
                    <p className="font-semibold text-blue-300 mb-1">FORMULA — Token + Credit formula examples</p>
                    <p className="text-blue-400 text-xs mb-1">Token formula:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs mb-2">
                      <li><code>body.duration * 49846.15</code></li>
                      <li><code>token</code> — pass through raw token</li>
                    </ul>
                    <p className="text-blue-400 text-xs mb-1">Legacy formula base (credit):</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-400 font-mono text-xs">
                      <li><code>body.duration * 42</code></li>
                      <li><code>ternary(body.resolution === &apos;2k&apos;, 20, 22.5)</code></li>
                      <li><code>ternary(body.resolution === &apos;2k&apos;, 20, ternary(body.resolution === &apos;4k&apos;, 30, 15))</code></li>
                      <li><code>ternary(body.quality === &apos;hd&apos;, body.duration * 60, body.duration * 30)</code></li>
                      <li><code>round(pow(body.duration, 1.2) * 5)</code></li>
                    </ul>
                  </div>
                )}

                {(calculationType === "USE_TOKEN" || calculationType === "FORMULA") && (
                  <Form.Item
                    name="tokenFormula"
                    label={<span className="text-[var(--legacy-gray-300)]">{calculationType === "USE_TOKEN" ? "Token Fallback Formula (if token = 0)" : "Token Usage Formula"}</span>}
                    rules={[{ required: calculationType === "FORMULA", message: "Required" }]}
                  >
                    <Input placeholder="e.g., body.duration * 49846.15" className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)] font-mono" />
                  </Form.Item>
                )}

                {(calculationType === "USE_TOKEN" || calculationType === "NOT_USE_TOKEN") && (
                  <Form.Item
                    name="creditFormula"
                    label={<span className="text-[var(--legacy-gray-300)]">Credit Usage Formula</span>}
                    rules={[{ required: true, message: "Required" }]}
                  >
                  <Input placeholder="e.g., ternary(body.resolution === '2k', 20, ternary(body.resolution === '4k', 30, 15))" className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)] font-mono" />
                  </Form.Item>
                )}

                {calculationType === "FORMULA" && (
                   <Form.Item
                   name="creditFormula"
                   label={<span className="text-[var(--legacy-gray-300)]">Legacy Formula Base</span>}
                   rules={[{ required: true, message: "Required" }]}
                 >
                   <Input placeholder="e.g., ternary(body.resolution === '2k', 20, 22.5)" className="bg-[var(--legacy-panel-2a2a2e)] border-[var(--legacy-line-gray-700)] text-[var(--legacy-ink)] font-mono" />
                 </Form.Item>
                )}
              </div>
            )}
          </div>

          <Form.Item className="mb-0 text-right mt-6">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit Calculation Config
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelPricingManagementPage;
