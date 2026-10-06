"use client";

import { Show, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title, Text } = Typography;

export default function CustomerShow() {
    const { query } = useShow({
        resource: "customer",
        meta: {
            fields: ["id", "name", "type", "billing_address", "vat_number", "created_at"],
        },
    });
    const customer = query?.data?.data;

    return (
        <Show
            isLoading={query?.isLoading}
            title={customer?.name || "Customer"}
        >
            <Title level={5}>Name</Title>
            <Text>{customer?.name}</Text>
            <Title level={5}>Type</Title>
            <Text>{customer?.type}</Text>
            <Title level={5}>Billing address</Title>
            <Text>{customer?.billing_address}</Text>
            <Title level={5}>VAT number</Title>
            <Text>{customer?.vat_number ?? "-"}</Text>
            <Title level={5}>Created</Title>
            <DateField value={customer?.created_at} format="DD/MM/YYYY" />
        </Show>
    );
}