"use client";

import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import CouponService from "@/app/services/coupon.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import OrganizationServices from "@/app/services/organization.service";
import PlanServices from "@/app/services/plan.service";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Avatar, Card, Col, Row, Space, Typography } from "antd";
import {
    Boxes,
    Building2,
    Cpu,
    TicketPercent,
} from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";

const { Text } = Typography;

type AdminCounts = {
    plans: number;
    models: number;
    coupons: number;
    organizations: number;
};

const AdminHeader: FC = () => {
    const { mode } = useThemeMode();
    const semantic = getThemeConfig(mode).token ?? {};
    const [counts, setCounts] = useState<AdminCounts>({
        plans: 0,
        models: 0,
        coupons: 0,
        organizations: 0,
    });
    const [loading, setLoading] = useState(true);

    const planService = useMemo(() => PlanServices(axiosCore), []);
    const modelService = useMemo(() => MasterModelTypeServices(axiosCore), []);
    const couponService = useMemo(() => CouponService(axiosUser), []);
    const organizationService = useMemo(() => OrganizationServices(axiosUser), []);

    useEffect(() => {
        let isMounted = true;

        const fetchCounts = async () => {
            setLoading(true);

            const [plansResult, modelsResult, couponsResult, organizationsResult] =
                await Promise.allSettled([
                    planService.findAllFormatted(),
                    modelService.findAll(),
                    couponService.findAll(),
                    organizationService.findAll({}),
                ]);

            if (!isMounted) {
                return;
            }

            setCounts({
                plans:
                    plansResult.status === "fulfilled"
                        ? plansResult.value?.length ?? 0
                        : 0,
                models:
                    modelsResult.status === "fulfilled"
                        ? modelsResult.value?.length ?? 0
                        : 0,
                coupons:
                    couponsResult.status === "fulfilled"
                        ? couponsResult.value?.total ?? couponsResult.value?.data?.length ?? 0
                        : 0,
                organizations:
                    organizationsResult.status === "fulfilled"
                        ? organizationsResult.value?.length ?? 0
                        : 0,
            });
            setLoading(false);
        };

        fetchCounts();

        return () => {
            isMounted = false;
        };
    }, [couponService, modelService, organizationService, planService]);

    const headerStats = [
        {
            label: "Plans",
            value: loading ? "..." : counts.plans.toLocaleString(),
            icon: Boxes,
            tint: "#4f46e5",
            bg: "rgba(79, 70, 229, 0.14)",
        },
        {
            label: "AI Models",
            value: loading ? "..." : counts.models.toLocaleString(),
            icon: Cpu,
            tint: "#0891b2",
            bg: "rgba(8, 145, 178, 0.14)",
        },
        {
            label: "Coupons",
            value: loading ? "..." : counts.coupons.toLocaleString(),
            icon: TicketPercent,
            tint: "#ea580c",
            bg: "rgba(234, 88, 12, 0.14)",
        },
        {
            label: "Organizations",
            value: loading ? "..." : counts.organizations.toLocaleString(),
            icon: Building2,
            tint: "#16a34a",
            bg: "rgba(22, 163, 74, 0.14)",
        },
    ];

  return (
        <div>
            <div
                style={{
                    overflow: "hidden",
             
                    background: semantic.colorBgContainer,
                  
                }}
            >
      <PageSubHeader
        title="Admin Panel"
        subtitle="Package · AI Models · Coupon Management"
        background={semantic.colorBgContainer!!}
        borderColor={"transparent"}
        titleColor={semantic.colorTextBase!!}
        subtitleColor={semantic.colorTextSecondary!!}
        chipBg={semantic.colorBgTextActive!!}
        chipText={"Admin Only"}
        compact
            />

                <div style={{ padding: 6 }}>
                    <Row gutter={[10, 10]}>
                        {headerStats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <Col xs={12} xl={6} key={stat.label}>
                                    <Card
                                        style={{
                                            height: "100%",
                                            borderRadius: 18,
                                            background: semantic.colorBgBase,
                                          
                                        }}
                                        styles={{ body: { padding: 12 } }}
                                    >
                                        <Space align="start" size={10} style={{ width: "100%" }}>
                                            <Avatar
                                                size={32}
                                                style={{
                                                    backgroundColor: stat.bg,
                                                    color: stat.tint,
                                                    flexShrink: 0,
                                                }}
                                                icon={<Icon size={15} />}
                                            />
                                            <Space direction="vertical" size={1} style={{ minWidth: 0 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        lineHeight: 1,
                                                        fontWeight: 600,
                                                        color: semantic.colorTextBase,
                                                    }}
                                                >
                                                    {stat.value}
                                                </Text>
                                                <Text style={{ color: semantic.colorTextSecondary, fontSize: 12 }}>
                                                    {stat.label}
                                                </Text>
                                            </Space>
                                        </Space>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;