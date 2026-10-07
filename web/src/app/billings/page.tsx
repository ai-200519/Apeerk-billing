"use client";

import { List, useTable, DateField } from "@refinedev/antd";
import { Table } from "antd";
import { formatMoney } from "@/lib/format";
import type { BillingListRecord } from "@/lib/types";

export default function BillingList() {
    const { tableProps } = useTable({
        resource: "billing",
        sorters: { initial: [{ field: "payment_date", order: "desc" }] },
        meta: {
            fields: [
                "id", "payment_mode", "payment_date", "amount",
                { invoice: ["invoice_number", { subscription: [{ customer: ["name"] }] }] },
            ],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column title="Invoice" render={(_, r: BillingListRecord) => r.invoice?.invoice_number} />
                <Table.Column title="Customer" render={(_, r: BillingListRecord) => r.invoice?.subscription?.customer?.name} />
                <Table.Column dataIndex="payment_mode" title="Mode" />
                <Table.Column
                    dataIndex="payment_date"
                    title="Date"
                    render={(v) => <DateField value={v} format="DD/MM/YYYY" />}
                />
                <Table.Column dataIndex="amount" title="Amount" render={(v) => formatMoney(v)} />
            </Table>
        </List>
    );
}