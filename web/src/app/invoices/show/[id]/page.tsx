"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShow } from "@refinedev/core";
import { Button, Spin, Result } from "antd";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";

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

    const invoice: any = query?.data?.data;

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
                <Link href="/invoices"><Button>← Back</Button></Link>
                <Button type="primary" onClick={() => window.print()}>
                    Export PDF
                </Button>
                {invoice?.status === "PENDING" && (
                    <Link href={`/billings/create?invoice_id=${invoice.id}`}>
                        <Button>Record payment</Button>
                    </Link>
                )}
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