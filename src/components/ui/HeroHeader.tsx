import type { ReactNode } from "react";

type HeroHeaderProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  actions?: ReactNode;
};

export function HeroHeader({ title, subtitle, icon, actions }: HeroHeaderProps) {
  return (
    <header className="hero-header">
      <div className="hero-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="hero-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="hero-actions">{actions}</div>}
    </header>
  );
}
