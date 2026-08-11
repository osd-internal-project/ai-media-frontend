"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import { axiosUser } from "@/app/lib/axios/axios";
import SocialAccountServices from "@/app/services/social-account.service";
import {
  PLATFORM_LABELS,
  PLATFORM_MANUAL_FIELDS,
  SOCIAL_PLATFORMS,
  SocialAccount,
  SocialPlatform,
} from "@/app/common/activity-share.type";
import PlatformIcon from "./platform-icon";

interface ManualTokenModalProps {
  open: boolean;
  organizationId: string;
  userId: string;
  /** บัญชีที่กำลังแก้ — null = เพิ่มใหม่ */
  editing: SocialAccount | null;
  /** platform ที่ preselect ไว้เมื่อกดมาจากการ์ดของ platform นั้น */
  presetPlatform?: SocialPlatform;
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  platform: SocialPlatform;
  externalId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Dayjs;
  displayName?: string;
}

/**
 * ฟอร์มวาง token เอง (SUPER_ADMIN เท่านั้น)
 *
 * เป็น write-only — ไม่มีทางอ่าน token เดิมกลับมาแสดง เวลาแก้บัญชีเดิมจึงเว้นช่อง
 * token ว่างไว้ได้เพื่อคงค่าเดิม แล้วแก้แค่ชื่อ/วันหมดอายุ
 */
const ManualTokenModal: React.FC<ManualTokenModalProps> = ({
  open,
  organizationId,
  userId,
  editing,
  presetPlatform,
  onClose,
  onSaved,
}) => {
  const [form] = Form.useForm<FormValues>();
  const socialAccountServices = useMemo(
    () => SocialAccountServices(axiosUser),
    []
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform>(
    presetPlatform ?? "FACEBOOK"
  );
  const [refreshTokenTouched, setRefreshTokenTouched] = useState<boolean>(false);

  const fields = PLATFORM_MANUAL_FIELDS[platform];

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    setRefreshTokenTouched(false);
    const initialPlatform = editing?.platform ?? presetPlatform ?? "FACEBOOK";
    setPlatform(initialPlatform);
    form.setFieldsValue({
      platform: initialPlatform,
      externalId: editing?.externalId ?? "",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiresAt: undefined,
      displayName: editing?.displayName ?? "",
    });
  }, [open, editing, presetPlatform, form]);

  const handleSubmit = useCallback(async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return; // antd แสดง error ใต้ช่องให้แล้ว
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await socialAccountServices.saveManualToken({
        organizationId,
        userId,
        platform: values.platform,
        externalId: values.externalId.trim(),
        ...(values.accessToken?.trim() && {
          accessToken: values.accessToken.trim(),
        }),
        ...(values.refreshToken?.trim() && {
          refreshToken: values.refreshToken.trim(),
        }),
        ...(values.tokenExpiresAt && {
          tokenExpiresAt: values.tokenExpiresAt.toISOString(),
        }),
        ...(values.displayName?.trim() && {
          displayName: values.displayName.trim(),
        }),
      });
      onSaved();
      onClose();
    } catch (error) {
      // backend ตรวจ token กับ provider แล้วส่งเหตุผลจริงกลับมา — โชว์ตรง ๆ
      const reason = (
        error as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      setSubmitError(
        Array.isArray(reason)
          ? reason.join(", ")
          : reason || "Could not save the token"
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form,
    socialAccountServices,
    organizationId,
    userId,
    onSaved,
    onClose,
  ]);

  const refreshTokenMissing =
    fields.needsRefreshToken &&
    refreshTokenTouched &&
    !form.getFieldValue("refreshToken");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={editing ? "Save token" : "Add account"}
      confirmLoading={submitting}
      destroyOnHidden
      width={560}
      title={
        editing ? `Edit token — ${editing.displayName}` : "Configure token manually"
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="The token is verified with the platform before it is saved"
        description="It is stored encrypted and can never be read back — only replaced."
      />

      {submitError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="The platform rejected this token"
          description={submitError}
        />
      )}

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="platform"
          label="Platform"
          rules={[{ required: true }]}
        >
          <Select
            // เปลี่ยน platform แล้วชื่อช่อง/กติกาเปลี่ยนตาม จึงล็อกไว้ตอนแก้บัญชีเดิม
            disabled={Boolean(editing)}
            onChange={(value: SocialPlatform) => setPlatform(value)}
            options={SOCIAL_PLATFORMS.map((value) => ({
              value,
              label: (
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <PlatformIcon platform={value} size={20} />
                  {PLATFORM_LABELS[value]}
                </span>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item
          name="externalId"
          label={fields.idLabel}
          rules={[{ required: true, message: `${fields.idLabel} is required` }]}
          extra={fields.hint}
        >
          <Input
            placeholder={fields.idPlaceholder}
            disabled={Boolean(editing)}
          />
        </Form.Item>

        <Form.Item
          name="accessToken"
          label="Access token"
          rules={
            editing
              ? []
              : [{ required: true, message: "An access token is required" }]
          }
        >
          <Input.Password
            autoComplete="off"
            placeholder={
              editing ? "•••• leave blank to keep the current token" : "Paste the access token"
            }
          />
        </Form.Item>

        {fields.needsRefreshToken && (
          <>
            <Form.Item
              name="refreshToken"
              label="Refresh token"
              extra="Used to renew the access token automatically before each post."
            >
              <Input.Password
                autoComplete="off"
                placeholder={
                  editing ? "•••• leave blank to keep" : "Paste the refresh token"
                }
                onBlur={() => setRefreshTokenTouched(true)}
              />
            </Form.Item>

            <Form.Item
              name="tokenExpiresAt"
              label="Access token expires at"
              extra="Optional. When set, the token is renewed shortly before this time."
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>

            {refreshTokenMissing && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="No refresh token given"
                description={`${PLATFORM_LABELS[platform]} access tokens are short-lived. Without a refresh token this account will stop working once it expires and you will have to paste a new token.`}
              />
            )}
          </>
        )}

        <Form.Item
          name="displayName"
          label="Display name"
          extra="Leave blank to use the name reported by the platform."
        >
          <Input placeholder="Auto-filled from the platform" />
        </Form.Item>
      </Form>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        This account will be available to every project in this organization.
      </Typography.Text>
    </Modal>
  );
};

export default ManualTokenModal;
