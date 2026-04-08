import { AlertTriangle } from "lucide-react";
import { FC } from "react";

export const mockCreditSummary = {
  balance: 5090,
  totalEarned: 3000,
  totalSpent: 635,
  expiresAt: '2026-06-30',
  alertThreshold: 20,
  dailyHistory:0,
};

const ExpireNotice: FC = () => {
    return (
    <div>
         {/* Expires notice */}
          {mockCreditSummary.expiresAt && (
            <div className="p-3.5 bg-orange-500/10 border border-orange-400/30 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <p className="text-[11px] text-orange-700 dark:text-orange-400">
                Your current credit allocation expires on <strong>{mockCreditSummary.expiresAt}</strong>.
                Unused credits will be forfeited after this date. Contact your admin to roll over credits.
              </p>
            </div>
          )}</div>
    );
}
 export default ExpireNotice;