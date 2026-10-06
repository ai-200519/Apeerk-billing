"use client";

import "@ant-design/v5-patch-for-react-19";
import React from "react";
import { Refine } from "@refinedev/core";
import {
    ThemedLayout,
    ErrorComponent,
    useNotificationProvider,
    ThemedTitle,
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
                    meta: { label: "Clients/Customers" },
                },
                {
                    name: "subscription",
                    list: "/subscriptions",
                    create: "/subscriptions/create",
                    meta: { label: "Subscriptions" },
                },
                {
                    name: "invoice",
                    list: "/invoices",
                    show: "/invoices/show/:id",
                    meta: { label: "Invoices/Factures" },
                },
                {
                    name: "billing",
                    list: "/billings",
                    create: "/billings/create",
                    meta: { label: "Payments" },
                },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
        >
            <ThemedLayout Title={({ collapsed }) => (
                <ThemedTitle
                    collapsed={collapsed}
                    text={collapsed ? "" : "Apeerk billing"}
                />
            )}>{children}</ThemedLayout>
        </Refine>
    </AntdApp>
);

export { ErrorComponent };