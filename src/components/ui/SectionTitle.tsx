import type { ReactNode } from "react";

type SectionTitleProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionTitle({ icon, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="section-title">
      <div className="section-title-main">
        {icon && <span className="section-title-icon">{icon}</span>}
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
