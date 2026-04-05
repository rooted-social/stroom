import { type ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  titleEn?: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, titleEn, description, action }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        {titleEn ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{titleEn}</p> : null}
        {description ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
