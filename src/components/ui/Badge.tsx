import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "blue" | "gold";
};

export function Badge({ children, tone = "green" }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
