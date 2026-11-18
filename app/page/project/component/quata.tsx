import React from "react";
import { Typography, theme } from "antd";
import { FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { formatNumber } from "@/app/utils/format";

type QuataSize = "small" | "middle" | "large";

interface QuataProps {
  creditUsed: number;
  creditTotal: number;
  cerrentUsedCredit: number | 0;

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
