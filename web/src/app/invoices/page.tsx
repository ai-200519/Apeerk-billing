"use client";

import { List, useTable, DateField } from "@refinedev/antd";
import { Table, Tag } from "antd";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { Button } from "antd";

const STATUS_COLOR: Record<string, string> = {
    DRAFT: "default",
    PENDING: "orange",
    PAID: "green",
    CANCELLED: "red",
};

export default function InvoiceList() {
    const { tableProps } = useTable({
        resource: "invoice",
        sorters: { initial: [{ field: "issue_date", order: "desc" }] },
        meta: {
            fields: [
                "id", "invoice_number", "issue_date", "due_date",
                "total_ht", "total_ttc", "status",
                { subscription: [{ customer: ["name"] }] },
                { billings: ["amount"] },
            ],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="invoice_number" title="Invoice" />
                <Table.Column
                    title="Customer"
                    render={(_, r: any) => r.subscription?.customer?.name}
                />
                <Table.Column
                    dataIndex="issue_date"
                    title="Issued"
                    render={(v) => <DateField value={v} format="DD/MM/YYYY" />}
                />
                <Table.Column
                    dataIndex="due_date"
                    title="Due"
                    render={(v) => <DateField value={v} format="DD/MM/YYYY" />}
                />
                <Table.Column dataIndex="total_ht" title="Total HT" render={(v) => formatMoney(v)} />
                <Table.Column dataIndex="total_ttc" title="Total TTC" render={(v) => formatMoney(v)} />
                <Table.Column
                    dataIndex="status"
                    title="Status"
                    render={(v: string) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>}
                />
                <Table.Column
                    title="Paid"
                    render={(_, r: any) =>
                        formatMoney((r.billings ?? []).reduce((s: number, b: any) => s + Number(b.amount), 0))
                    }
                />
                <Table.Column
                    title="Actions"
                    render={(_, r: any) =>
                        r.status === "PENDING" ? (
                            <Link href={`/billings/create?invoice_id=${r.id}`}>
                                <Button size="small" type="primary">Record payment</Button>
                            </Link>
                        ) : null
                    }
                />
            </Table>
        </List>
    );
}