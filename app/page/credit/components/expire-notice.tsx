import { Empty } from "antd";
import { AlertTriangle } from "lucide-react";
import { FC } from "react";

type ExpireNoticeProps = {
  expiresAt?: string | Date | null;
};

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ExpireNotice: FC<ExpireNoticeProps> = ({ expiresAt }) => {
    return (
    <div>
         {/* Expires notice */}
          {expiresAt ? (
            <div className="p-3.5 bg-orange-500/10 border border-orange-400/30 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <p className="text-[11px] text-orange-700 dark:text-orange-400">
                Your current credit allocation expires on <strong>{formatDate(expiresAt)}</strong>.
                Unused credits will be forfeited after this date. Contact your admin to roll over credits.
              </p>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No expiry information"
            />
          )}</div>
    );
}
 export default ExpireNotice;