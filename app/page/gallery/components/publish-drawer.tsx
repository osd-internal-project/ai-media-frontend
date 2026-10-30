"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Radio, Switch, message } from "antd";
import { AudioLines, Play } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPublicationServices from "@/app/services/community-publication.service";
import { getPhotoEventErrorMessage as getErrorMessage } from "@/app/services/photo-event.service";
import { SmartImage } from "@/app/page/project/[id]/components/shared/smart-media";
import type {
  CommunityVisibility,
  OrgGalleryItem,
  PublishResult,
} from "@/app/common/org-gallery.type";

const SKIP_REASON: Record<string, string> = {
  NOT_OWNER: "งานของคนอื่น เผยแพร่ได้เฉพาะเจ้าของงาน",
  MODEL_NOT_ALLOWED: "สร้างด้วย model ที่ยังไม่อนุญาตให้เผยแพร่",
  NOT_FOUND: "ไม่พบงานนี้แล้ว",
};
const ACTIVE = ["PENDING", "PUBLISHED"];

type Props = {
  open: boolean;
  organizationId: string;
  items: OrgGalleryItem[];
  onClose: () => void;
  /** เรียกหลังเผยแพร่หรือถอดสำเร็จ ให้หน้า gallery โหลดสถานะใหม่ */
  onChanged: () => void;
  /** Drawer render นอก .og-page จึงต้องส่ง CSS var ของ theme มาเอง */
  themeVars: React.CSSProperties;
};

const Thumb: React.FC<{ item: OrgGalleryItem }> = ({ item }) => {
  const poster = item.thumbnailUrl ?? (item.type === "image" ? item.mediaUrl : null);
  return (
    <div className="og-pd-thumb" title={item.prompt ?? undefined}>
      {poster ? (
        <SmartImage src={poster} alt="" wrapperStyle={{ position: "absolute", inset: 0 }} />
      ) : item.type === "audio" ? (
        <AudioLines size={20} />
      ) : (
        <Play size={20} />
      )}
    </div>
  );
};

const PublishDrawer: React.FC<Props> = ({
  open,
  organizationId,
  items,
  onClose,
  onChanged,
  themeVars,
}) => {
  const service = useMemo(() => CommunityPublicationServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [includePrompt, setIncludePrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [results, setResults] = useState<PublishResult[] | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setResults(null);
    setRemoved(new Set());
  }, [open]);

  const publishable = items.filter((i) => i.publishBlock === null);
  const blocked = items.filter((i) => i.publishBlock !== null);
  const live = items.filter(
    (i) => i.publication && ACTIVE.includes(i.publication.status) && !removed.has(i.id)
  );
  const skippedBy = blocked.reduce<Record<string, number>>((acc, i) => {
    const reason = i.publishBlock ?? "NOT_FOUND";
    acc[reason] = (acc[reason] ?? 0) + 1;
    return acc;
  }, {});

  const publish = async () => {
    setSubmitting(true);
    try {
      const res = await service.publish({
        organizationId,
        galleryIds: publishable.map((i) => i.id),
        visibility,
        includePrompt,
      });
      setResults(res);
      onChanged();
    } catch (error) {
      messageApi.error(`เผยแพร่ไม่สำเร็จ: ${getErrorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item: OrgGalleryItem) => {
    if (!item.publication) return;
    setRemovingId(item.publication.id);
    try {
      await service.unpublish(item.publication.id);
      setRemoved((prev) => new Set(prev).add(item.id));
      messageApi.success("ถอดออกจาก Community แล้ว");
      onChanged();
    } catch (error) {
      messageApi.error(`ถอดออกไม่สำเร็จ: ${getErrorMessage(error)}`);
    } finally {
      setRemovingId(null);
    }
  };

  const sent = results?.filter((r) => r.status === "PENDING").length ?? 0;
  const failed =
    results?.filter(
      (r): r is Extract<PublishResult, { status: "FAILED" }> => r.status === "FAILED"
    ) ?? [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={440}
      title="เผยแพร่ไป Community"
      rootStyle={themeVars}
      rootClassName="og-pd-root"
      destroyOnClose
      footer={
        results ? (
          <Button block onClick={onClose}>
            ปิด
          </Button>
        ) : (
          <Button
            type="primary"
            block
            loading={submitting}
            disabled={publishable.length === 0}
            onClick={publish}
          >
            {publishable.length > 0 ? `เผยแพร่ ${publishable.length} ชิ้น` : "ไม่มีชิ้นที่เผยแพร่ได้"}
          </Button>
        )
      }
    >
      {contextHolder}
      {results ? (
        <div className="og-pd">
          {sent > 0 && (
            <p className="og-pd-ok">
              ส่งแล้ว {sent} ชิ้น Community จะตรวจก่อนแสดง สถานะเปลี่ยนเป็น &quot;เผยแพร่แล้ว&quot; เมื่อผ่าน
            </p>
          )}
          {failed.length > 0 && (
            <div className="og-pd-error">
              <p>ส่งไม่สำเร็จ {failed.length} ชิ้น เลือกแล้วกดเผยแพร่ใหม่ได้</p>
              <ul>
                {failed.map((f) => (
                  <li key={f.galleryId}>{f.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="og-pd">
          {publishable.length > 0 && (
            <section>
              <p className="og-pd-label">จะเผยแพร่ {publishable.length} ชิ้น</p>
              <div className="og-pd-thumbs">
                {publishable.map((item) => (
                  <Thumb key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {blocked.length > 0 && (
            <section>
              <p className="og-pd-label">ข้าม {blocked.length} ชิ้น</p>
              <ul className="og-pd-skips">
                {Object.entries(skippedBy).map(([reason, count]) => (
                  <li key={reason}>
                    {SKIP_REASON[reason]} ({count})
                  </li>
                ))}
              </ul>
            </section>
          )}

          {publishable.length > 0 && (
            <>
              <section>
                <p className="og-pd-label">ใครเห็นได้</p>
                <Radio.Group value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                  <Radio value="PUBLIC">ทุกคนบน Community</Radio>
                  <Radio value="PRIVATE">เฉพาะฉัน</Radio>
                </Radio.Group>
              </section>
              <section className="og-pd-row">
                <div>
                  <p className="og-pd-label">แสดง prompt</p>
                  <p className="og-pd-hint">ปิดไว้ คนอื่นจะเห็นแค่ผลงาน ไม่เห็นวิธีสร้าง</p>
                </div>
                <Switch checked={includePrompt} onChange={setIncludePrompt} aria-label="แสดง prompt" />
              </section>
            </>
          )}

          {live.length > 0 && (
            <section>
              <p className="og-pd-label">อยู่บน Community แล้ว {live.length} ชิ้น</p>
              <ul className="og-pd-live">
                {live.map((item) => (
                  <li key={item.id}>
                    <Thumb item={item} />
                    <span>{item.publication?.status === "PENDING" ? "รอตรวจ" : "เผยแพร่แล้ว"}</span>
                    <Button
                      size="small"
                      danger
                      loading={removingId === item.publication?.id}
                      onClick={() => remove(item)}
                    >
                      ถอดออก
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default PublishDrawer;
