import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type GlassCardProps<T extends ElementType> = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<T>;

export function GlassCard<T extends ElementType = "section">({
  as: Component = "section",
  className = "",
  children,
  ...props
}: GlassCardProps<T>) {
  return (
    <Component className={`glass-card${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </Component>
  );
}
