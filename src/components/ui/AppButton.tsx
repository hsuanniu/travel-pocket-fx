import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function AppButton({ variant = "secondary", className = "", children, ...props }: AppButtonProps) {
  return (
    <button className={`app-button app-button-${variant}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </button>
  );
}
