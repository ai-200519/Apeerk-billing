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
                {
                    name: "subscription",
                    list: "/subscriptions",
                    create: "/subscriptions/create",
                    meta: { label: "Subscriptions" },
                },
                {
                    name: "invoice",
                    list: "/invoices",
                    show: "/invoices/show/:id", // page comes on Day 5
                    meta: { label: "Invoices" },
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
            <ThemedLayout>{children}</ThemedLayout>
        </Refine>
    </AntdApp>
);

export { ErrorComponent };