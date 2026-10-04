"use client";

import React from "react";
import { Refine } from "@refinedev/core";
import {
    ThemedLayout,
    ErrorComponent,
    useNotificationProvider,
} from "@refinedev/antd";
import routerProvider from "@refinedev/nextjs-router";
import { App as AntdApp } from "antd";
import "@refinedev/antd/dist/reset.css";

import { hasuraDataProvider } from "@/providers/data-provider";

export const RefineContext = ({ children }: { children: React.ReactNode }) => (
    <AntdApp>
        <Refine
            dataProvider={hasuraDataProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
                {
                    name: "customer",
                    list: "/customers",
                    create: "/customers/create",
                    show: "/customers/show/:id",
                    meta: { label: "Customers" },
                },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
        >
            <ThemedLayout>{children}</ThemedLayout>
        </Refine>
    </AntdApp>
);

export { ErrorComponent };