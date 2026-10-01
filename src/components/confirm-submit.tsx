"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  message: string;
  className?: string;
  children: ReactNode;
};

export function ConfirmSubmit({ message, className, children }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "..." : children}
    </button>
  );
}
