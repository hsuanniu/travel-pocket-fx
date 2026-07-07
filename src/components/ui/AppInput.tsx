import type { InputHTMLAttributes } from "react";

type AppInputProps = InputHTMLAttributes<HTMLInputElement>;

export function AppInput({ className = "", ...props }: AppInputProps) {
  return <input className={`app-input${className ? ` ${className}` : ""}`} {...props} />;
}
