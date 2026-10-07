"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShow } from "@refinedev/core";
import { ArrowLeftOutlined, DownloadOutlined, DollarOutlined } from "@ant-design/icons";
import { Button, Result, Space, Spin, Tooltip } from "antd";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import type { InvoiceRecord } from "@/lib/types";

export default function InvoiceShow() {
    const { query } = useShow({
        resource: "invoice",
        meta: {
            fields: [
                "id", "invoice_number", "issue_date", "due_date",
                "consumption_start", "consumption_end",
                "total_ht", "total_ttc", "status",
                {
                    subscription: [
                        "quantity", "unit_price",
                        { customer: ["name", "type", "billing_address", "vat_number"] },
                        { material: ["name"] },
                    ],
                },
                { billings: ["id", "payment_mode", "payment_date", "amount"] },
            ],
        },
    });

    const invoice = query?.data?.data as InvoiceRecord | undefined;

    // the browser uses the page title as the default PDF filename
    useEffect(() => {
        if (invoice?.invoice_number) document.title = invoice.invoice_number;
        return () => {
            document.title = "Apeerk Billing";
        };
    }, [invoice?.invoice_number]);

    return (
        <div>
            <div className="no-print inv-toolbar">
                <Space size="small">
                    <Tooltip title="Back to invoices">
                        <Link href="/invoices">
                            <Button icon={<ArrowLeftOutlined />}>Back</Button>
                        </Link>
                    </Tooltip>
                    <Button icon={<DownloadOutlined />} type="primary" onClick={() => window.print()}>
                        Export PDF
                    </Button>
                {invoice?.status === "PENDING" && (
                    <Link href={`/billings/create?invoice_id=${invoice.id}`}>
                        <Button icon={<DollarOutlined />}>Record payment</Button>
                    </Link>
                )}
                </Space>
            </div>

            {query?.isLoading ? (
                <Spin />
            ) : invoice ? (
                <InvoiceTemplate invoice={invoice} />
            ) : (
                <Result status="404" title="Invoice not found" />
            )}
        </div>
    );
}