import React from "react";
import { Empty } from "antd";

interface SectionEmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

const SectionEmptyState: React.FC<SectionEmptyStateProps> = ({
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl border border-dashed border-[var(--legacy-line-white-10)] bg-[var(--legacy-panel-white-5)] px-4 py-8 text-center ${className}`.trim()}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="space-y-1">
            <div className="text-sm font-medium text-[var(--legacy-ink)]">{title}</div>
            {description ? (
              <div className="text-xs text-[var(--legacy-gray-400)]">{description}</div>
            ) : null}
          </div>
        }
      />
    </div>
  );
};

export default SectionEmptyState;