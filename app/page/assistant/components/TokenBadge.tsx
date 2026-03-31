"use client";
import { theme, Typography } from "antd";
import { Zap } from "lucide-react";

interface TokenBadgeProps {
  totalTokens: number;
  model?: string;
}

const TokenBadge = ({ totalTokens, model }: TokenBadgeProps) => {
  const { token } = theme.useToken();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
      style={{
        backgroundColor: token.colorFillAlter,
        color: token.colorTextSecondary,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Zap className="h-3 w-3" />
      {totalTokens.toLocaleString()} tokens{model ? ` · ${model}` : ""}
    </span>
  );
};

export default TokenBadge;
