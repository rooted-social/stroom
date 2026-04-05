"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
};

export function SubmitButton({
  label,
  pendingLabel = "처리중...",
  className,
  variant = "default",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      variant={variant}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
