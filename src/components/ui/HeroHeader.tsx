import type { ReactNode } from "react";

type HeroHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  actions?: ReactNode;
};

export function HeroHeader({ eyebrow, title, subtitle, icon, actions }: HeroHeaderProps) {
  return (
    <header className="hero-header">
      <div className="hero-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="hero-copy">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="hero-actions">{actions}</div>}
    </header>
  );
}
