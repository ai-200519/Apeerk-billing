"use client";

import { List, useTable, DateField, ShowButton } from "@refinedev/antd";
import { Table, Tag } from "antd";

export default function CustomerList() {
    const { tableProps } = useTable({
        sorters: { initial: [{ field: "created_at", order: "desc" }] },
        meta: {
            fields: ["id", "name", "type", "billing_address", "vat_number", "created_at"],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column
                    dataIndex="type"
                    title="Type"
                    render={(v: string) => (
                        <Tag color={v === "B2B" ? "blue" : "green"}>{v}</Tag>
                    )}
                />
                <Table.Column dataIndex="billing_address" title="Billing address" />
                <Table.Column dataIndex="vat_number" title="VAT number" />
                <Table.Column
                    dataIndex="created_at"
                    title="Created"
                    render={(v: string) => <DateField value={v} format="DD/MM/YYYY" />}
                />
                <Table.Column
                    title="Actions"
                    render={(_, record: { id: string }) => (
                        <ShowButton hideText size="small" recordItemId={record.id} />
                    )}
                />
            </Table>
        </List>
    );
}