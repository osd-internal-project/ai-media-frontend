import { TPlan } from "@/app/common/plan.type";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
  Avatar,
  Switch,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { Boxes } from "lucide-react";

interface PlanGridViewProps {
  loading: boolean;
  filteredData: TPlan[];
  handleDeletePlan: (planId: string) => void;
}

const { Text, Title } = Typography;

const PlanGridView: FC<PlanGridViewProps> = ({
  loading,
  filteredData,
  handleDeletePlan,
}) => {
  const router = useRouter();
    const { mode } = useThemeMode();
    const semantic = getThemeConfig(mode).token ?? {};

  return (
    <div className="rounded-lg overflow-hidden ">
      <Spin spinning={loading}>
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Empty description="No plans found" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredData.map((record) => {
              // 👉 เลือก default price ก่อน
              const defaultPrice =
                record.prices?.find((p) => p.isDefault) ||
                record.prices?.[0];

              return (
                <Card
                  key={record.id}
                  className="h-full shadow-sm"
                  style={{ position: "relative" }}
                  styles={{
                    body: {
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    },
                  }}
                >
                 
                   {record.isPopular && (<div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: semantic.colorPrimary,
                        color: "#fff",
                        padding: "2px 14px",
                        borderRadius:"0px 8px 0px 8px",
                        fontSize: "12px",
                        zIndex: 1,
                      }}
                    >
                      Popular
                    </div>)}
                <div className="flex flex-1 flex-col gap-4">
                    {/* TOP */}
                    <div className="space-y-3 flex-1">
                    <Space direction="horizontal" align="start" size={8} style={{ width: "100%" }}>
  <Avatar
    size={32}
    style={{
      backgroundColor: semantic.colorBgTextActive,
      color: semantic.colorPrimary,
      flexShrink: 0,
    }}
    icon={<Boxes size={15} />}
  />
  <div className="flex-1 min-w-0">
    <Title level={5} className="!mb-0">
      {record.name}
    </Title>
    <Text type="secondary" style={{ fontSize: "12px" }}>
      {record.description}
    </Text>
  </div>
  <Switch defaultChecked style={{ marginLeft: "auto" }} />
</Space>
                      <div className="flex flex-col gap-2 py-5" >
                      {/* Price */}
                      {record.prices.map((price) => (
                        <div key={price.id} className="flex items-baseline gap-1">
                       <Title level={4} className="!mb-0">
                         {price.price}{price.currency} / {price.interval}
                      </Title>
                        </div>  
                      ))}
                        <Text color="primary" style={{color: semantic.colorPrimary, fontSize: "12px"}} >
                           💳 {record.detailJson?.creditAllowance} Credits / {record.detailJson?.duration} {record.detailJson?.unit}
                        </Text>
                      </div>
                     

                      {/* CREDIT COSTS PER RUN   */}
                      <div className="flex flex-col gap-1 py-5" >
                        <Text type="secondary"  >
                          Credit Costs Per Run
                      </Text>
                      {/* credit/month */}
                    <div className="flex gap-2 w-full">
  <Card
    style={{
      background: semantic.colorBgTextActive,
      border: "none",
      width: "50%",
      padding: "4px 8px",
      boxSizing: "border-box",
      margin: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
    bodyStyle={{ padding: 0, width: "100%" }}
  >
  
   <div className="flex justify-between w-full">
  <Text color="white" style={{  fontSize: "12px" }}>
      🖼️ Image:
  </Text>
  <Text color="primary" style={{ color: semantic.colorPrimary, fontSize: "12px" }}>
    {record.detailJson?.imageAllowance} Image
  </Text>
</div>
  </Card>
  <Card
    style={{
      background: semantic.colorBgTextActive,
      border: "none",
      width: "50%",
      padding: "4px 8px",
      boxSizing: "border-box",
      margin: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
    bodyStyle={{ padding: 0, width: "100%" }}
  >
   <div className="flex justify-between w-full">
  <Text color="white" style={{  fontSize: "12px" }}>
    👥 Max User:
  </Text>
  <Text color="primary" style={{ color: semantic.colorPrimary, fontSize: "12px" }}>
    {record.detailJson?.maxUserAccess} Person
  </Text>
</div>
  </Card>
</div>
                      </div>

                {/* FEATURES */}
<div className="flex flex-col gap-2">
  {record.features?.map((feature, index) => (
    <div key={feature.id || index} className="flex items-start gap-2">
      
      {/* ICON */}
      <span className="text-base leading-none" style={{color: aiCaveColors.success}}>
        {feature.icon || "•"}
      </span>

      {/* TEXT */}
      <Text type="secondary" style={{fontSize: "12px"}} >
        {feature.text}
      </Text>

    </div>
  ))}
</div>

                      {/* TAGS */}
                      <Space size="small" wrap>
                   
                        {/* {record.badge && (
                          <Tag color="blue">{record.badge}</Tag>
                        )} */}
                        {/* {record.isDefault && (
                          <Tag color="green">Default</Tag>
                        )} */}
                      </Space>
                    </div>

                    {/* ACTION */}
                   <div
      className="flex justify-end gap-2 mt-auto pt-0"
      style={{ marginTop: "auto", paddingTop: 0, alignItems: "center" }}
    >
                      <Button
                        size="small"
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() =>
                          router.push(
                            `/page/admin-management/plan-management/${record.id}`
                          )
                        }
                        className="w-full"
                      >
                        Edit
                        </Button>
                      <Popconfirm
                        title="Delete Plan"
                        description="Are you sure you want to delete this plan?"
                        onConfirm={() => handleDeletePlan(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          className="text-red-400! hover:text-red-300!"
                          danger
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default PlanGridView;