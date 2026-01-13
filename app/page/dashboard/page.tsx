"use client";
import React, { useEffect, useState, type FC } from "react";
import { useForm } from "antd/es/form/Form";
import { Col, ConfigProvider, Row, Tabs, type TabsProps, Result } from "antd";
import { axiosCore, axiosReport, axiosUser } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import { useSession } from "next-auth/react";
import type {
  IDashboardProject,
  IDashboardUser,
  ITDashboardOwner,
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
import TableUserComponent from "./components/table-user";
const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const { organizationRole, organizationId } = useOrganization();
  const dashboardServices = DashboardServices(axiosCore);
  const organizationServices = OrganizationServices(axiosUser);
  const projectServices = ProjectService(axiosCore);
  const [loading, setLoading] = useState<boolean>(true);

  const [summaryByProject, setSummaryByProject] = useState<IDashboardProject[]>(
    []
  );
  const [summaryByUser, setSummaryByUser] = useState<IDashboardUser[]>([]);
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
      fectdataTableUser(organizationId);
      setLoading(false);
    }
  };

  const fecthOrganizationDetail = async (organizationId: string) => {
    const response = await organizationServices.findById(organizationId);
    setOrganization(response);
    console.log(response);
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
      fectdataTableUser(organizationId);
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
  async function fectdataTableUser(organizationId: string) {
    const response = await dashboardServices.findDashboardSummaryUser(
      organizationId,
      params
    );
    setSummaryByUser(response);
  }
  const tableTabs: TabsProps["items"] = [
    {
      key: "1",
      label: "Team",
      children: (
        <>
          <TableProjectComponent data={summaryByProject} />
        </>
      ),
    },
    {
      key: "2",
      label: "Users",
      children: (
        <>
          <TableUserComponent data={summaryByUser} />
        </>
      ),
    },
  ];

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
      <div className={`w-full space-y-3 ${isMobile ? "pt-3 px-3" : "pt-6"}`}>
        <CardOrganization organization={organization} session={session} />
        <Row gutter={[isMobile ? 4 : 8, isMobile ? 4 : 8]} className="">
          <Col span={24}>
            <div className="text-[#99a1af] text-lg">Usage Summary</div>
            <Tabs
              size="small"
              defaultActiveKey="1"
              items={tableTabs}
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
