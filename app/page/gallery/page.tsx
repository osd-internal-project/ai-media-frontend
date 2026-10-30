"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Pagination, Segmented, Select, Skeleton } from "antd";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import { useOrganization } from "@/app/context/OrganizationContext";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import type {
  GalleryType,
  OrgGalleryItem,
  OrgGalleryPage,
  PublishStatusFilter,
} from "@/app/common/org-gallery.type";
import GalleryTile from "./components/gallery-tile";
import "./styles/gallery.css";

const PAGE_SIZE = 24;
const ORG_WIDE_ROLES = ["OWNER", "ADMIN", "SUPER_ADMIN"];

const TYPE_OPTIONS: { label: string; value: GalleryType | "all" }[] = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ภาพ", value: "image" },
  { label: "วิดีโอ", value: "video" },
  { label: "เสียง", value: "audio" },
];

const STATUS_OPTIONS: { label: string; value: PublishStatusFilter | "all" }[] = [
  { label: "ทุกสถานะ", value: "all" },
  { label: "ยังไม่เผยแพร่", value: "NONE" },
  { label: "รอตรวจ", value: "PENDING" },
  { label: "เผยแพร่แล้ว", value: "PUBLISHED" },
  { label: "ไม่ผ่านการตรวจ", value: "REJECTED" },
];

type MemberRow = { userId: string; users?: { fullname?: string } };

export default function OrgGalleryPage() {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId ?? undefined;
  const { organizationRole } = useOrganization();
  const orgWide = ORG_WIDE_ROLES.includes(organizationRole ?? "");
  const { mode } = useThemeMode();
  const token = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);

  const galleryService = useMemo(() => GalleryServices(axiosCore), []);
  const memberService = useMemo(() => OrganizationMembersServices(axiosUser), []);

  const [type, setType] = useState<GalleryType | "all">("all");
  const [status, setStatus] = useState<PublishStatusFilter | "all">("all");
  const [memberId, setMemberId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<OrgGalleryPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [members, setMembers] = useState<{ label: string; value: string }[]>([]);
  // เก็บทั้ง item ไว้ เพื่อให้ตัวนับยังถูกเมื่อเปลี่ยนหน้าหรือเปลี่ยนตัวกรอง
  const [selected, setSelected] = useState<Map<string, OrgGalleryItem>>(new Map());

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setFailed(false);
    try {
      const data = await galleryService.findByOrg(organizationId, {
        page,
        pageSize: PAGE_SIZE,
        ...(type !== "all" && { type }),
        ...(status !== "all" && { publishStatus: status }),
        ...(memberId && { memberId }),
      });
      setResult(data);
    } catch (err) {
      console.error("load org gallery failed", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [organizationId, galleryService, page, type, status, memberId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!organizationId || !orgWide) return;
    memberService.findByOrganization(organizationId).then((rows: MemberRow[] | undefined) => {
      setMembers(
        (rows ?? []).map((m) => ({ value: m.userId, label: m.users?.fullname || m.userId }))
      );
    });
  }, [organizationId, orgWide, memberService]);

  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const toggle = useCallback((item: OrgGalleryItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  }, []);

  const publishable = [...selected.values()].filter((i) => i.publishBlock === null).length;
  const filtered = type !== "all" || status !== "all" || !!memberId;

  const cssVars = {
    "--og-primary": token.colorPrimary,
    "--og-panel": token.colorBgContainer,
    "--og-elevated": token.colorBgElevated,
    "--og-border": token.colorBorder,
    "--og-muted": token.colorTextSecondary,
    "--og-text": token.colorText,
    "--og-success": token.colorSuccess,
    "--og-warning": token.colorWarning,
    "--og-error": token.colorError,
  } as React.CSSProperties; // CSS custom properties ไม่อยู่ใน type ของ CSSProperties

  return (
    <div className="og-page" style={cssVars}>
      <header className="og-header">
        <div>
          <h1 className="og-title">Gallery ขององค์กร</h1>
          <p className="og-subtitle">
            {orgWide ? "ผลงานที่สมาชิกสร้างใน AI Cave ทุก project" : "ผลงานของคุณจากทุก project ในองค์กรนี้"}
          </p>
        </div>
        {orgWide && (
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="สมาชิกทุกคน"
            options={members}
            value={memberId}
            onChange={resetPage(setMemberId)}
            style={{ minWidth: 200 }}
          />
        )}
      </header>

      <div className="og-filters">
        <Segmented options={TYPE_OPTIONS} value={type} onChange={resetPage(setType)} />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={resetPage(setStatus)}
          style={{ minWidth: 170 }}
          aria-label="สถานะ Community"
        />
      </div>

      {failed ? (
        <div className="og-empty">
          <p>โหลดผลงานไม่สำเร็จ ตรวจการเชื่อมต่อแล้วลองอีกครั้ง</p>
          <Button onClick={load}>ลองอีกครั้ง</Button>
        </div>
      ) : loading && !result ? (
        <div className="og-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton.Node key={i} active className="og-skeleton" />
          ))}
        </div>
      ) : result && result.data.length === 0 ? (
        <div className="og-empty">
          {filtered ? (
            <p>ไม่มีผลงานที่ตรงกับตัวกรองนี้</p>
          ) : (
            <>
              <p>ผลงานที่สร้างสำเร็จใน project จะมาอยู่ที่นี่</p>
              <Link href="/page/project">
                <Button type="primary">ไปที่ Projects</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="og-grid" aria-busy={loading}>
            {result?.data.map((item) => (
              <GalleryTile key={item.id} item={item} selected={selected.has(item.id)} onToggle={toggle} />
            ))}
          </div>
          {result && result.total > PAGE_SIZE && (
            <Pagination
              className="og-pagination"
              current={page}
              pageSize={PAGE_SIZE}
              total={result.total}
              showSizeChanger={false}
              onChange={setPage}
            />
          )}
        </>
      )}

      {selected.size > 0 && (
        <div className="og-selection" role="status">
          <strong>เลือกแล้ว {selected.size} ชิ้น</strong>
          <span>เผยแพร่ได้ {publishable}</span>
          {selected.size - publishable > 0 && (
            <span className="og-muted">เผยแพร่ไม่ได้ {selected.size - publishable}</span>
          )}
          <Button type="text" onClick={() => setSelected(new Map())} className="og-clear">
            ล้างที่เลือก
          </Button>
        </div>
      )}
    </div>
  );
}
