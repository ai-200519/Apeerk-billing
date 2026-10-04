import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { RefineContext } from "./_refine_context";

export const metadata: Metadata = {
  title: "Apeerk Billing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Suspense>
          <AntdRegistry>
            <RefineContext>{children}</RefineContext>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}