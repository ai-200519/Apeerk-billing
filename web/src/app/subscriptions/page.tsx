"use client";

import { List, useTable, DateField } from "@refinedev/antd";
import { Table } from "antd";
import { formatMoney } from "@/lib/format";

export default function SubscriptionList() {
    const { tableProps } = useTable({
        resource: "subscription",
        sorters: { initial: [{ field: "created_at", order: "desc" }] },
        meta: {
            fields: [
                "id", "start_date", "end_date", "quantity", "unit_price", "created_at",
                { customer: ["name", "type"] },
                { material: ["name"] },
            ],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column title="Customer" render={(_, r: any) => r.customer?.name} />
                <Table.Column title="Product" render={(_, r: any) => r.material?.name} />
                <Table.Column dataIndex="quantity" title="Qty" />
                <Table.Column
                    dataIndex="unit_price"
                    title="Unit price (HT)"
                    render={(v) => formatMoney(v)}
                />
                <Table.Column
                    dataIndex="start_date"
                    title="Start"
                    render={(v) => <DateField value={v} format="DD/MM/YYYY" />}
                />
                <Table.Column
                    dataIndex="end_date"
                    title="End"
                    render={(v) => <DateField value={v} format="DD/MM/YYYY" />}
                />
            </Table>
        </List>
    );
}