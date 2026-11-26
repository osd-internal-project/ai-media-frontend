"use client";

import React, { useEffect, useState } from "react";
import { Alert, Modal, Radio, Skeleton, theme } from "antd";
import PlanServices from "@/app/services/plan.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { TApplyScope, TPlanImpact } from "@/app/common/plan.type";

const planService = PlanServices(axiosCore);

interface Props {
  open: boolean;
  /** plan ที่ Access หรือ model เปลี่ยน */
  plans: { id: string; name: string }[];
  saving: boolean;
  onCancel: () => void;
  onConfirm: (scope: TApplyScope) => void;
}

const sum = (impacts: TPlanImpact[], key: keyof TPlanImpact) =>
  impacts.reduce((total, impact) => total + impact[key], 0);

/** ถามก่อนบันทึกว่าจะคัดลอก Access / model ใหม่ไปที่ org ไหน พร้อมจำนวนจริงจาก backend */
const ApplyImpactModal: React.FC<Props> = ({ open, plans, saving, onCancel, onConfirm }) => {
  const { token } = theme.useToken();
  const [impacts, setImpacts] = useState<TPlanImpact[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [scope, setScope] = useState<TApplyScope>("matching");
  const planIds = plans.map((plan) => plan.id).join(",");

  useEffect(() => {
    if (!open) return;
    setImpacts(null);
    setFailed(false);
    setScope("matching");
    Promise.all(plans.map((plan) => planService.organizationsImpact(plan.id)))
      .then(setImpacts)
      .catch(() => {
        setFailed(true);
        setScope("none");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, planIds]);

  const total = impacts ? sum(impacts, "total") : 0;
  const matching = impacts ? sum(impacts, "matching") : 0;
  const customized = impacts ? sum(impacts, "customized") : 0;
  const count = (value: number) => (impacts ? <span className="tabular-nums"> ({value} org)</span> : null);
  const title = plans.length === 1 ? `บันทึก ${plans[0].name}` : `บันทึก ${plans.length} plan`;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => onConfirm(scope)}
      okText="บันทึก"
      cancelText="ยกเลิก"
      confirmLoading={saving}
      okButtonProps={{ disabled: !impacts && !failed }}
    >
      <p className="mb-3" style={{ color: token.colorTextSecondary }}>
        Access หรือ model เปลี่ยน — จะคัดลอกค่าใหม่ไปที่ org ที่ใช้ plan นี้อยู่ไหม (user limit ไม่เปลี่ยน)
      </p>
      {!impacts && !failed && <Skeleton active paragraph={{ rows: 3 }} title={false} />}
      {failed && (
        <Alert
          className="!mb-3"
          type="warning"
          showIcon
          message="นับ org ที่ได้รับผลกระทบไม่ได้ — เลือก 'ไม่เปลี่ยน org' ไว้ให้ ถ้าจะคัดลอกให้ลองเปิดหน้าต่างนี้ใหม่"
        />
      )}
      {(impacts || failed) && (
        <Radio.Group
          className="flex flex-col gap-2"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        >
          <Radio value="matching" disabled={failed}>
            เฉพาะ org ที่ยังใช้ค่าตาม plan{count(matching)}
          </Radio>
          <Radio value="all" disabled={failed}>
            ทุก org รวมที่กำหนดเอง{count(total)}
          </Radio>
          <Radio value="none">ไม่เปลี่ยน org — ใช้กับ org ที่เปลี่ยนมา plan นี้ครั้งถัดไป</Radio>
        </Radio.Group>
      )}
      {impacts && scope === "all" && customized > 0 && (
        <Alert
          className="!mt-3"
          type="warning"
          showIcon
          message={`${customized} org ที่ admin กำหนดค่าเองจะถูกทับด้วยค่าของ plan`}
        />
      )}
    </Modal>
  );
};

export default ApplyImpactModal;
