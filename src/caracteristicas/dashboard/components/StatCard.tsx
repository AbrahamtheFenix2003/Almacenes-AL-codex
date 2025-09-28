import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Trend = "positive" | "negative" | "neutral";

export type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  trend?: string;
  trendType?: Trend;
  icon?: LucideIcon;
};

const trendColors: Record<Trend, string> = {
  positive: "text-[#1f8f4d]",
  negative: "text-[#d43852]",
  neutral: "text-[color:var(--muted-foreground)]",
};

export function StatCard({ title, value, helper, trend, trendType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <Card className="rounded-[16px] border-[color:var(--border)] shadow-[0_18px_40px_-32px_rgba(18,60,96,0.45)]">
      <CardHeader className="flex flex-row items-start justify-between px-6 pt-6 pb-0">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
            {title}
          </p>
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--primary)]">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-[34px] font-semibold text-[color:var(--foreground)]">{value}</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {trend ? <span className={trendColors[trendType]}>{trend}</span> : null}
          {helper ? <span className="text-[color:var(--muted-foreground)]">{helper}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
