"use client";
import React, { useEffect, useState, type FC } from "react";
import SummaryFilterComponent from "./components/table-filter";
import { useForm } from "antd/es/form/Form";
import SummaryCardComponent from "./components/card-orgnization";
import {
  Button,
  Col,
  ConfigProvider,
  message,
  Row,
  Tabs,
  type TabsProps,
  Result,
  Space,
} from "antd";
import { axiosCore, axiosReport, axiosUser } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import { useSession } from "next-auth/react";
import type {
  IDashboardProject,
  IDashboardUser,
  ITDashboard,
  ITDashboardOwner,
  ProductSummary,
} from "@/app/common/dashbaord";
import ProjectService from "@/app/services/project.service";
import type { IProject } from "@/app/common/project.type";
import ReportServices from "@/app/services/report.service";
import { canViewDashboard } from "@/app/utils/permissions";
import { useOrganization } from "@/app/context/OrganizationContext";
import { IOrganization } from "@/app/common/organization.type";
import OrganizationServices from "@/app/services/organization.service";
import CardOrganization from "./components/card-orgnization";
import TableFilter from "./components/table-filter";
import TableProjectComponent from "./components/table-project";
const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const { organizationRole, organizationId } = useOrganization();
  const dashboardServices = DashboardServices(axiosCore);
  const organizationServices = OrganizationServices(axiosUser);
  const projectServices = ProjectService(axiosCore);
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryByOwner, setSummaryByOwner] = useState<ITDashboardOwner[]>([]);

  const [summaryByProject, setSummaryByProject] = useState<IDashboardProject[]>(
    []
  );
  const [organization, setOrganization] = useState<IOrganization>();
  const [projectOptions, setProjectOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [params, setParams] = useState<{
    projectId: string;
    createdAt: Date | string;
  }>({ projectId: "", createdAt: "" });
  const [searchForm] = useForm();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (loading) fecthdata();
  }, [loading, session, params]);
  useEffect(() => {
    if (organizationId) fecthOrganizationDetail(organizationId);
  }, [organizationId]);
  const fecthdata = async () => {
    if (organizationId) {
      fectdataTableProject(organizationId);
      setLoading(false);
    }
  };

  const fecthOrganizationDetail = async (organizationId: string) => {
    const response = await organizationServices.findById(organizationId);
    setOrganization(response);
    console.log(response);
  };
  const fectdataTableUser = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummaryOwner(
        session?.user.id as string,
        params
      );
      setSummaryByOwner(response);
      setLoading(false);
    }
  };

  useEffect(() => {
    masterData();
  }, [organizationId]);

  const masterData = async () => {
    if (organizationId) {
      const response = await projectServices.findByOrganizationId(
        organizationId as string,
        session?.user.id as string
      );
      const mapOptions = await response?.map((project: IProject) => {
        return { value: project.id, label: project.name };
      });
      setProjectOptions(mapOptions || []);
      fectdataTableProject(organizationId);
    }
  };

  function onSearch(value: { projectId: string; createdAt: string }): void {
    if (value) {
      setParams(value);
      setLoading(true);
    } else {
      setParams({ projectId: "", createdAt: "" });
      setLoading(true);
    }
  }
  const fectdataTableProject = async (organizationId: string) => {
    const response = await dashboardServices.findDashboardSummaryProject(
      organizationId,
      params
    );
    setSummaryByProject(response);
    setLoading(false);
  };
  const exportcsv = async () => {
    try {
      const blob = await ReportServices(axiosReport).reportcsvDashboard(
        session?.user.id as string,
        params
      );
      if (!blob) {
        alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString();
      link.download = `report_test_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log("ดาวน์โหลดสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Owner",
      children: (
        <>
          <TableProjectComponent
            data={summaryByProject}
            getSummaryUsers={getSummaryUsers}
          />
        </>
      ),
    },
    {
      key: "2",
      label: "Product",
      children: <></>,
    },
  ];
  async function getSummaryUsers(projectId: string): Promise<IDashboardUser[]> {
    if (organizationId) {
      const response = await dashboardServices.findDashboardSummaryUser(
        organizationId,
        { ...params, projectId }
      );
      return response || [];
    }
    return [];
  }
  // Check if user has permission to view dashboard
  if (!canViewDashboard(organizationRole || "")) {
    return (
      <ConfigProvider
        theme={{
          token: { colorText: "#99a1af", colorBgContainer: "#2a2a2a" },
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Result
            status="403"
            title="Access Denied"
            subTitle="You don't have permission to view the dashboard. Only organization owners can access this page."
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: { colorText: "#99a1af", colorBgContainer: "#2a2a2a" },
      }}
    >
      <div className={`w-full ${isMobile ? "pt-3 px-3" : "pt-6"}`}>
        <div className="text-[#99a1af] text-lg">Package Overview</div>
        <CardOrganization organization={organization} session={session} />
        <Row gutter={[isMobile ? 4 : 8, isMobile ? 4 : 8]} className="">
          <Col span={24}>
            <Tabs
              defaultActiveKey="1"
              items={items}
              tabBarExtraContent={
                <TableFilter
                  searchForm={searchForm}
                  onSearch={onSearch}
                  projectOptions={projectOptions}
                  exportcsv={exportcsv}
                />
              }
            />
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};
export default DashboardPage;
