import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PagePlaceholder({ title, description, children }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
          <CardDescription>
            This screen is a placeholder while we wire up navigation. Content lands here next.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{children}</CardContent>
      </Card>
    </div>
  );
}