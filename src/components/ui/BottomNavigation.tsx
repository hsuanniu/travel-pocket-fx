import type { ReactNode } from "react";

type BottomNavigationItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

type BottomNavigationProps = {
  items: BottomNavigationItem[];
};

export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="主要導覽">
      {items.map((item) => (
        <button
          key={item.label}
          className={`bottom-navigation-item${item.active ? " is-active" : ""}`}
          type="button"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
