"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Divider,
  Card,
  Typography,
  message,
  Spin,
  Breadcrumb,
  Select,
  Checkbox,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import PlanServices from "@/app/services/plan.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { PlanFeaturesEditor } from "./components/PlanFeaturesEditor";
import { PlanPricesEditor } from "./components/PlanPricesEditor";
import { TPlan, TPlanFeature, TPlanPrice } from "@/app/common/plan.type";

const { Title, Text } = Typography;

export default function PlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<TPlanFeature[]>([]);
  const [prices, setPrices] = useState<TPlanPrice[]>([]);
  const planService = PlanServices(axiosCore);
  const ACCESS_CODE: { label: string; value: string; className: string }[] = [
    { label: "Image", value: "image", className: "label-1" },
    { label: "Video", value: "video", className: "label-2" },
    { label: "Omnihuman", value: "omni", className: "label-3" },
    { label: "Dream Actor", value: "dream", className: "label-4" },
    { label: "Editor", value: "editor", className: "label-5" },
  ];
  useEffect(() => {
    if (id && id !== "create") {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const data = await planService.findById(id as string);
      if (data) {
        console.log(data);
        form.setFieldsValue({
          ...data,
        });
        setFeatures(data.features || []);
        setPrices(data.prices || []);
      }
    } catch (error) {
      messageApi.error("Failed to fetch plan details");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    console.log(values);
    setSaving(true);
    try {
      const payload = {
        ...values,
        // name: values.name,
        // description: values.description,
        // badge: values.badge,
        // borderColor: values.borderColor,
        // isDefault: values.isDefault,
        // popular: values.popular || false,
        // status: values.status ?? false,
        prices: prices,
        // detailJson: {
        //   creditAllowance: +values.creditAllowance,
        //   imageAllowance: +values.imageAllowance,
        //   maxUserAccess: +values.maxUserAccess,
        // },
        features: features,
      };

      if (id === "create") {
        await planService.create(payload);
        messageApi.success("Plan created successfully");
      } else {
        await planService.update(id as string, payload);
        messageApi.success("Plan updated successfully");
      }
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full h-full  p-6 text-white pb-20">
      {contextHolder}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { title: "Admin Management" },
            {
              title: (
                // eslint-disable-next-line @next/next/no-html-link-for-pages
                <a href="/page/admin-management/plan-management">
                  Plan Management
                </a>
              ),
            },
            { title: id === "create" ? "Create Plan" : "Edit Plan" },
          ]}
          className="mb-4"
        />
        <div className="flex justify-between items-center">
          <Space size="middle">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                router.push("/page/admin-management/plan-management")
              }
              className="bg-gray-800! border-gray-700! text-white!"
            />
            <Title level={2} className="text-white! m-0!">
              {id === "create"
                ? "Create New Plan"
                : `Edit Plan: ${form.getFieldValue("name") || ""}`}
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
            className="bg-indigo-600! hover:bg-indigo-700!"
          >
            Save Changes
          </Button>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ popular: false, isDefault: false, status: false }}
        className="max-w-6xl space-y-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
          <Card title="Basic Information" className="">
            <Form.Item
              name="name"
              label="Plan Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Professional" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Best for power users" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="badge" label="Badge">
                <Input placeholder="Best Value" />
              </Form.Item>
              <Form.Item name="borderColor" label="Border Color">
                <Input placeholder="#3b82f6" />
              </Form.Item>
            </div>

            <Space size="large">
              <Form.Item
                name="status"
                label="Active Status"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="popular"
                label="Is Popular"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="isDefault"
                label="Is Default"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>
            </Space>
          </Card>

          <Card title="Global Quotas" className="bg-[#1a1a1a] border-[#303030]">
            {/* <Text type="secondary" className="block mb-4">
              These quotas apply to the entire organization regardless of
              specific price period.
            </Text> */}
            <div className="grid grid-cols-1 ">
              {/* <Form.Item name="packageTokenAmount" label="Organization Tokens">
                <InputNumber className="w-full" />
              </Form.Item> */}
              {/* <div className="flex gap-4 items-center">
                <Form.Item>Used in</Form.Item>{" "}
                <Form.Item
                  name={["detailJson", "duration"]}
                  // label="Duration "
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item className=" w-[100px]"
                  name={["detailJson", "unit"]}
                  // label="Unit "
                  // layout="inline"
                  // labelCol={{ span: 10 }}
                >
                  <Select
                    className="dark-select "
                    options={[
                      { value: "day", label: "Day" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                  />
                </Form.Item>
              </div> */}
              <Form.Item
                name={["detailJson", "maxUserAccess"]}
                label="Max User Access"
                layout="horizontal"
                labelCol={{ span: 10 }}
              >
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item
                name={["detailJson", "creditAllowance"]}
                label="Credit Allowance "
                layout="horizontal"
                labelCol={{ span: 10 }}
              >
                <InputNumber className="w-full" min={0} />
              </Form.Item>
              <Form.Item
                name={["detailJson", "imageAllowance"]}
                label="Image Allowance "
                layout="horizontal"
                labelCol={{ span: 10 }}
              >
                <InputNumber className="w-full" min={0} />
              </Form.Item>
              <Form.Item name="accessCodes" label="Access">
                <Checkbox.Group options={ACCESS_CODE} />
              </Form.Item>
            </div>
          </Card>
        </div>
        <div>
          <PlanPricesEditor prices={prices} onChange={setPrices} />
        </div>

        <div>
          <PlanFeaturesEditor features={features} onChange={setFeatures} />
        </div>
        {/* <div className="mt-8 flex justify-end">
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
            className="bg-indigo-600! hover:bg-indigo-700! w-48"
          >
            Save Changes
          </Button>
        </div> */}
      </Form>{" "}
      <style>{`
        /* Dark Select Styling */
        .dark-select .ant-select-selector {
          background-color: #27272a !important;
          border: 1px solid #3f3f46 !important;
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-item {
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-placeholder {
          color: #6b7280 !important;
        }

        .dark-select:hover .ant-select-selector {
          border-color: #52525b !important;
        }

        .dark-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .dark-select .ant-select-arrow {
          color: #9ca3af !important;
        }

        /* Custom Sidebar Menu Styling */
        .ant-menu-item-selected .menu-icon-container {
          background-color: #1677ff; 
          border-radius: 8px; 
          padding: 8px;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-text-label {
          color:gray !important;
        }
        .ant-menu-item-selected .menu-text-label {
          font-weight: bold !important;
          color: white !important; 
        }
  
        /* Remove ALL sidebar borders and lines */
        .ant-layout-sider,
        .ant-layout-sider *,
        .ant-layout-sider::before,
        .ant-layout-sider::after {
          border: none !important;
          border-right: none !important;
          border-left: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* Force transparent borders on layout */
        .ant-layout {
          border: none !important;
        }
        
        /* Ensure icon container is centered and has spacing */
        .menu-icon-container {
          padding: 8px;
          border-radius: 8px;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
     

      `}</style>
    </div>
  );
}
