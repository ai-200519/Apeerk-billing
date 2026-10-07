"use client";

import { List, useTable, DateField } from "@refinedev/antd";
import { Button, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import { DollarOutlined, EyeOutlined, StopOutlined } from "@ant-design/icons";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { useUpdate } from "@refinedev/core";
import type { InvoiceRecord } from "@/lib/types";

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

    const { mutate: updateInvoice } = useUpdate();
    const cancelInvoice = (id: string) =>
        updateInvoice({
            resource: "invoice",
            id,
            values: { status: "CANCELLED" },
            meta: { fields: ["id", "status"] },
            successNotification: { message: "Invoice cancelled", type: "success" },
        });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="invoice_number" title="Invoice" />
                <Table.Column
                    title="Customer"
                    render={(_, r: InvoiceRecord) => r.subscription?.customer?.name}
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
                    render={(_, r: InvoiceRecord) =>
                        formatMoney((r.billings ?? []).reduce((s, b) => s + Number(b.amount), 0))
                    }
                />
                <Table.Column
                    title="Actions"
                    render={(_, r: InvoiceRecord) => (
                        <Space size="small">
                            <Tooltip title="View invoice">
                                <Link href={`/invoices/show/${r.id}`}>
                                    <Button
                                        aria-label={`View invoice ${r.invoice_number}`}
                                        icon={<EyeOutlined />}
                                        size="small"
                                    />
                                </Link>
                            </Tooltip>
                            {r.status === "PENDING" && (
                                <Tooltip title="Record payment">
                                    <Link href={`/billings/create?invoice_id=${r.id}`}>
                                        <Button
                                            aria-label={`Record payment for ${r.invoice_number}`}
                                            icon={<DollarOutlined />}
                                            size="small"
                                            type="primary"
                                        />
                                    </Link>
                                </Tooltip>
                            )}
                            {r.status === "PENDING" && (r.billings ?? []).length === 0 && (
                                <Popconfirm
                                    title="Cancel this invoice?"
                                    description="This cannot be undone."
                                    okText="Cancel invoice"
                                    okButtonProps={{ danger: true }}
                                    cancelText="Keep"
                                    onConfirm={() => cancelInvoice(r.id)}
                                >
                                    <Tooltip title="Cancel invoice">
                                        <Button
                                            aria-label={`Cancel invoice ${r.invoice_number}`}
                                            danger
                                            icon={<StopOutlined />}
                                            size="small"
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            )}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}