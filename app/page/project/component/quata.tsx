import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Popover, Skeleton, Typography, theme } from "antd";
import { DownOutlined, FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { formatNumber } from "@/app/utils/format";
import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import useModelNames from "@/app/hooks/useModelNames";

type QuataSize = "small" | "middle" | "large";

interface QuataProps {
  creditUsed: number;
  creditTotal: number;
  cerrentUsedCredit: number | 0;
  /** When set, the figure opens a per-model breakdown of this member's credit in the project. */
  projectId?: string;

  // tokenUsed?: number;
  // tokenTotal?: number;
  semantic?: any;
  size?: QuataSize;
  showToken?: boolean;
  showProgress?: boolean;
  title?: string;
}

const SIZE_MAP: Record<
  QuataSize,
  { icon: number; label: number; value: number; gap: number }
> = {
  small: { icon: 12, label: 12, value: 12, gap: 2 },
  middle: { icon: 14, label: 11, value: 11, gap: 4 },
  large: { icon: 16, label: 12, value: 12, gap: 6 },
};

const Quata: React.FC<QuataProps> = ({
  creditUsed,
  creditTotal,
  cerrentUsedCredit,
  // tokenUsed = 0,
  // tokenTotal = 0,
  semantic,
  size = "middle",
  showToken = true,
  showProgress = true,
  title,
  projectId,
}) => {
  const ui = SIZE_MAP[size];
  const { token } = theme.useToken();

  const safeImageTotal = Math.max(0, creditTotal);
  // const safeTokenTotal = Math.max(0, tokenTotal);
  // const tokenPercent = safeTokenTotal > 0 ? Math.round((tokenUsed / safeTokenTotal) * 100) : 0;
 

  // Callers rarely pass `semantic`; the active antd theme keeps text readable in light mode too.
  const colorTextBase = semantic?.colorTextBase ?? token.colorText;
  const colorTextSecondary = semantic?.colorTextSecondary ?? token.colorTextSecondary;
  const colorPrimary = semantic?.colorPrimary ?? token.colorPrimary;
  const colorTrail = semantic?.colorFillSecondary ?? token.colorFillSecondary;

  return (
    <div
      style={{
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: ui.gap,
      }}
    >
      {title ? (
        <Typography.Text
          style={{
            color: colorTextSecondary,
            fontSize: ui.label,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography.Text>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: ui.gap, whiteSpace: "nowrap" }}>
          <FileImageOutlined
            style={{ fontSize: ui.icon, color: colorTextSecondary }}
          />
          <Typography.Text
            style={{ color: colorTextSecondary, fontSize: ui.label }}
          >
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Credit</span>
          </Typography.Text>
        </span>
        <CreditFigure projectId={projectId}>
        <Typography.Text
          strong
          style={{ color: colorTextBase, fontSize: ui.value, whiteSpace: "nowrap" }}
        >
          {formatNumber(creditUsed)}
          {cerrentUsedCredit && cerrentUsedCredit > 0 ? (
            // The lighter text step of indigo: the base reads 2.8:1 on the dark panel.
            <strong style={{ color: token.colorPrimaryTextHover }}>
              {" "}
              +{formatNumber(cerrentUsedCredit || 0)}
            </strong>
          ) : (
            ""
          )}
          /{formatNumber(safeImageTotal)}
        </Typography.Text>
        </CreditFigure>
      </div>
      {showProgress ? (
        <CreditBar
          used={creditUsed}
          pending={cerrentUsedCredit || 0}
          total={safeImageTotal}
          colors={{
            used: colorTextSecondary,
            pending: colorPrimary,
            remaining: semantic?.colorInfoText ?? token.colorInfoText ?? token.colorInfo,
            trail: colorTrail,
          }}
        />
      ) : null}

      {/* {showToken ? (
				<>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<span style={{ display: "flex", alignItems: "center", gap: ui.gap }}>
							<VideoCameraOutlined style={{ fontSize: ui.icon, color: colorTextSecondary }} />
							<Typography.Text style={{ color: colorTextSecondary, fontSize: ui.label }}>
								VDO Token
							</Typography.Text>
						</span>
						<Typography.Text strong style={{ color: colorTextBase, fontSize: ui.value }}>
							{tokenUsed.toLocaleString()}/{safeTokenTotal.toLocaleString()}
						</Typography.Text>
					</div>
					{showProgress ? (
						<Progress
							percent={tokenPercent}
							size="small"
							showInfo={false}
							strokeColor={colorPrimary}
							trailColor={colorTrail}
							style={{ margin: 0, padding: 0 }}
						/>
					) : null}
				</>
			) : null} */}
    </div>
  );
};

/** Wraps the credit figure in a click-to-open breakdown when a project is known. */
function CreditFigure({ projectId, children }: { projectId?: string; children: React.ReactNode }) {
  const { token } = theme.useToken();
  if (!projectId) return <>{children}</>;
  return (
    <Popover
      trigger="click"
      placement="topRight"
      title="Credits by model"
      destroyTooltipOnHide
      content={<CreditByModel projectId={projectId} />}
    >
      <Button
        type="text"
        size="small"
        aria-label="Show credits by model"
        style={{ height: "auto", paddingInline: 4, marginInlineEnd: -4 }}
      >
        {children}
        <DownOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
      </Button>
    </Popover>
  );
}

type ModelCredit = { modelName: string | null; credit: number };

/** Mounted only while the popover is open, so the fetch runs on open, not on every tab. */
function CreditByModel({ projectId }: { projectId: string }) {
  const { token } = theme.useToken();
  const { data: session } = useSession();
  const { nameOf } = useModelNames();
  const logsServices = useMemo(() => LogsServices(axiosCore), []);
  const [rows, setRows] = useState<ModelCredit[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const organizationId = session?.user?.organizationId;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!organizationId || !userId) return;
    let cancelled = false;
    setError(false);
    setRows(null);
    logsServices
      .findUsedCreditByModel(projectId, organizationId, userId)
      .then((next) => {
        if (!cancelled) setRows(next ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load credits by model", err);
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, organizationId, userId, logsServices, reloadKey]);

  const body = (() => {
    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          message="Couldn't load credits by model."
          action={
            <Button size="small" onClick={() => setReloadKey((key) => key + 1)}>
              Retry
            </Button>
          }
        />
      );
    }
    if (!rows) return <Skeleton active title={false} paragraph={{ rows: 3 }} />;
    if (rows.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No credits spent in this project yet."
        />
      );
    }
    const max = Math.max(...rows.map((row) => row.credit), 1);
    const total = rows.reduce((sum, row) => sum + row.credit, 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row) => (
          <div key={row.modelName ?? "unknown"} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <Typography.Text ellipsis style={{ fontSize: 13 }}>
                {nameOf(row.modelName)}
              </Typography.Text>
              <Typography.Text strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                {formatNumber(row.credit)}
              </Typography.Text>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: token.colorFillSecondary }}>
              <div
                style={{
                  width: `${(row.credit / max) * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: token.colorPrimary,
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${token.colorSplit}`,
            paddingTop: 8,
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Total
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            {formatNumber(total)}
          </Typography.Text>
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Your finished and in-progress jobs in this project.
        </Typography.Text>
      </div>
    );
  })();

  return <div style={{ width: 280 }}>{body}</div>;
}

type CreditBarProps = {
  used: number;
  pending: number;
  total: number;
  colors: { used: string; pending: string; remaining: string; trail: string };
};

/** Swatch Book colour bar: used | this job | remaining, so the cost shows before Generate. */
function CreditBar({ used, pending, total, colors }: CreditBarProps) {
  const pct = (v: number) => (total > 0 ? Math.max(0, Math.min(100, (v / total) * 100)) : 0);
  const usedPct = pct(used);
  const pendingPct = Math.min(pct(pending), 100 - usedPct);
  const remainingPct = Math.max(0, 100 - usedPct - pendingPct);
  const segments = [
    { key: "used", w: usedPct, color: colors.used, opacity: 0.55 },
    { key: "pending", w: pendingPct, color: colors.pending, opacity: 1 },
    { key: "remaining", w: remainingPct, color: colors.remaining, opacity: 0.85 },
  ].filter((s) => s.w > 0);

  return (
    <div
      role="img"
      aria-label={`Credit used ${formatNumber(used)}, this job ${formatNumber(pending)}, remaining ${formatNumber(Math.max(0, total - used - pending))} of ${formatNumber(total)}`}
      className="credit-bar"
      style={{ display: "flex", gap: 1, height: 6, borderRadius: 999, overflow: "hidden", background: colors.trail }}
    >
      {segments.map((s) => (
        // A cheap job still shows: the pending segment never shrinks below 3px.
        <span key={s.key} style={{ width: `${s.w}%`, minWidth: s.key === "pending" ? 3 : undefined, background: s.color, opacity: s.opacity }} />
      ))}
    </div>
  );
}

export default Quata;
