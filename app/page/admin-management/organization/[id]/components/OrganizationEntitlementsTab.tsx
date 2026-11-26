"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, InputNumber, Switch, message, theme } from "antd";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import OrganizationServices from "@/app/services/organization.service";
import PlanServices from "@/app/services/plan.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { IOrganization } from "@/app/common/organization.type";
import { TPlan } from "@/app/common/plan.type";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { sameSet } from "@/app/common/access-codes";
import { PHOTO_EVENT_ACCESS_CODE } from "@/app/utils/permissions";
import { CustomizedBadge, SeatBar } from "../../../components/admin-ui";
import { AccessPicker, ModelPicker, ModelSelection, selectionIds, selectionOf } from "../../../components/entitlement-pickers";

interface Props {
  organization: IOrganization;
  onSaved: () => void;
}

interface Draft {
  unlimited: boolean;
  limit: number;
  accessCodes: string[];
  models: ModelSelection;
}

const organizationService = OrganizationServices(axiosUser);
const planService = PlanServices(axiosCore);
const modelService = MasterModelTypeServices(axiosCore);

const draftOf = (org: IOrganization): Draft => ({
  unlimited: org.maxUserAccess === null || org.maxUserAccess === undefined,
  limit: org.maxUserAccess ?? 0,
  accessCodes: org.accessCodes ?? [],
  models: selectionOf(org.allowedModelIds),
});

/** plan ที่ org ใช้: subscription ชี้ plan; org personal ไม่มี subscription จึงเทียบกับ plan ค่าเริ่มต้น */
async function loadPlan(org: IOrganization): Promise<TPlan | null> {
  if (org.subscription?.planId) return planService.findById(org.subscription.planId);
  if (org.type?.toLowerCase() !== "personal") return null;
  const plans = await planService.findAllFormatted();
  return plans.find((plan) => plan.isDefault) ?? null;
}

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  "Could not save. Check the connection and try again.";

const OrganizationEntitlementsTab: React.FC<Props> = ({ organization, onSaved }) => {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<Draft>(() => draftOf(organization));
  const [plan, setPlan] = useState<TPlan | null>(null);
  const [models, setModels] = useState<TMasterModelType[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(draftOf(organization)), [organization]);

  useEffect(() => {
    loadPlan(organization).then(setPlan).catch(() => setPlan(null));
    modelService
      .findAll()
      .then(setModels)
      .catch(() => {
        setModels([]);
        messageApi.error("Could not load AI models.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization.organizationId]);

  const saved = draftOf(organization);
  const nextLimit = draft.unlimited ? null : draft.limit;
  const nextModelIds = selectionIds(draft.models);
  const dirty =
    nextLimit !== (organization.maxUserAccess ?? null) ||
    !sameSet(draft.accessCodes, saved.accessCodes) ||
    !sameSet(nextModelIds, selectionIds(saved.models));
  const matchesPlan =
    !!plan &&
    sameSet(draft.accessCodes, plan.accessCodes) &&
    sameSet(nextModelIds, plan.allowedModelIds);
  const seatInUse = (organization.seatUsed ?? 0) + (organization.seatPending ?? 0);

  const applyPlan = () => {
    if (!plan) return;
    setDraft((current) => ({
      ...current,
      accessCodes: plan.accessCodes ?? [],
      models: selectionOf(plan.allowedModelIds),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await organizationService.update(organization.organizationId, {
        maxUserAccess: nextLimit,
        accessCodes: draft.accessCodes,
        allowedModelIds: nextModelIds,
      });
      messageApi.success("Saved limit, access and models");
      onSaved();
    } catch (error) {
      messageApi.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle = (title: string, aside?: React.ReactNode) => (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <h3 className="text-base font-semibold" style={{ color: token.colorTextBase }}>{title}</h3>
      {aside}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}

      <section>
        {sectionTitle("User limit")}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <Switch
              checked={draft.unlimited}
              onChange={(unlimited) => setDraft((current) => ({ ...current, unlimited }))}
            />
            <span>ไม่จำกัด</span>
          </label>
          <InputNumber
            min={0}
            disabled={draft.unlimited}
            value={draft.limit}
            onChange={(limit) => setDraft((current) => ({ ...current, limit: limit ?? 0 }))}
            addonAfter="seats"
            aria-label="Seat limit"
          />
          <SeatBar active={organization.seatUsed ?? 0} pending={organization.seatPending ?? 0} max={nextLimit} />
        </div>
        {nextLimit !== null && seatInUse > nextLimit && (
          <Alert
            className="!mt-3"
            type="warning"
            showIcon
            message={`ตอนนี้ใช้ ${seatInUse} seat มากกว่า limit ${nextLimit} — สมาชิกเดิมอยู่ต่อ แต่เพิ่มหรือเชิญคนใหม่ไม่ได้จนกว่าจะต่ำกว่า limit`}
          />
        )}
      </section>

      <section>
        {sectionTitle(
          "Access",
          plan ? (
            matchesPlan ? (
              <span className="text-xs" style={{ color: token.colorTextSecondary }}>ตรงกับ plan {plan.name}</span>
            ) : (
              <>
                <CustomizedBadge />
                <span className="text-xs" style={{ color: token.colorTextSecondary }}>ต่างจาก plan {plan.name}</span>
              </>
            )
          ) : (
            <span className="text-xs" style={{ color: token.colorTextSecondary }}>ไม่มี plan ให้เทียบ</span>
          ),
        )}
        <AccessPicker
          value={draft.accessCodes}
          onChange={(accessCodes) => setDraft((current) => ({ ...current, accessCodes }))}
        />
      </section>

      <section>
        {sectionTitle("AI models")}
        <ModelPicker
          models={models}
          value={draft.models}
          onChange={(next) => setDraft((current) => ({ ...current, models: next }))}
          warning={
            draft.accessCodes.includes(PHOTO_EVENT_ACCESS_CODE)
              ? "org นี้เปิด Photo Event อยู่ — ถ้า template ของ event ใช้ model ที่ไม่ได้เลือก ตู้ kiosk จะ generate ไม่ได้"
              : undefined
          }
        />
      </section>

      <div
        className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-end gap-2 px-1 py-3"
        style={{ background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}` }}
      >
        {dirty && <span className="mr-auto text-xs" style={{ color: token.colorTextSecondary }}>มีการแก้ที่ยังไม่บันทึก</span>}
        <Button onClick={applyPlan} disabled={!plan || matchesPlan}>
          ใช้ค่าตาม plan
        </Button>
        <Button onClick={() => setDraft(saved)} disabled={!dirty}>
          ยกเลิก
        </Button>
        <Button type="primary" onClick={save} loading={saving} disabled={!dirty}>
          บันทึก
        </Button>
      </div>
    </div>
  );
};

export default OrganizationEntitlementsTab;
