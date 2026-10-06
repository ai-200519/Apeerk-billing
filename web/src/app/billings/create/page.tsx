"use client";

import { useEffect } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, InputNumber, DatePicker } from "antd";
import { Col, Row } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/format";

// remaining = total TTC minus payments already recorded (rounded to cents)
const remainingOf = (inv: any) =>
    Math.round(
        (Number(inv.total_ttc) -
            (inv.billings ?? []).reduce((s: number, b: any) => s + Number(b.amount), 0)) *
        100
    ) / 100;

export default function BillingCreate() {
    const searchParams = useSearchParams();
    const presetInvoice = searchParams.get("invoice_id") ?? undefined;

    const { formProps, saveButtonProps } = useForm({
        resource: "billing",
        action: "create",
        redirect: "list",
        meta: { fields: ["id"] },
    });
    const form = formProps.form!;

    const { selectProps, query } = useSelect({
        resource: "invoice",
        optionValue: (i: any) => i.id,
        optionLabel: (i: any) =>
            `${i.invoice_number} - ${i.subscription?.customer?.name} - remaining ${formatMoney(remainingOf(i))}`,
        filters: [{ field: "status", operator: "eq", value: "PENDING" }],
        meta: {
            fields: [
                "id", "invoice_number", "total_ttc", "status",
                { billings: ["amount"] },
                { subscription: [{ customer: ["name"] }] },
            ],
        },
    });

    const invoices = (query?.data?.data ?? []) as any[];
    const invoiceId = Form.useWatch("invoice_id", form);
    const selected = invoices.find((i) => i.id === invoiceId);
    const remaining = selected ? remainingOf(selected) : undefined;

    // pre-fill the amount with the remaining balance whenever the invoice changes
    useEffect(() => {
        if (remaining !== undefined) form.setFieldValue("amount", remaining);
    }, [selected?.id, remaining, form]);

    return (
        <Create saveButtonProps={{ ...saveButtonProps, icon: <SaveOutlined /> }}>
            <Form
                {...formProps}
                className="create-form"
                layout="vertical"
                initialValues={{
                    invoice_id: presetInvoice,
                    payment_mode: "VIREMENT",
                    payment_date: dayjs(),
                }}
                onFinish={(values: any) =>
                    formProps.onFinish?.({
                        invoice_id: values.invoice_id,
                        payment_mode: values.payment_mode,
                        payment_date: values.payment_date.format("YYYY-MM-DD"),
                        amount: values.amount,
                    })
                }
            >
                <div className="form-section">
                    <div className="form-section-title">Payment details</div>
                    <Form.Item label="Invoice (pending only)" name="invoice_id" rules={[{ required: true }]}>
                        <Select {...selectProps} showSearch placeholder="Select an invoice" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Payment mode" name="payment_mode" rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { value: "VIREMENT", label: "Bank transfer (virement)" },
                                        { value: "CARTE", label: "Card" },
                                        { value: "ESPECES", label: "Cash" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Payment date" name="payment_date" rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label={remaining !== undefined ? `Amount (remaining: ${formatMoney(remaining)})` : "Amount"}
                                name="amount"
                                rules={[
                                    { required: true },
                                    () => ({
                                        validator(_, value) {
                                            if (value === undefined || value === null) return Promise.resolve();
                                            if (value <= 0) return Promise.reject(new Error("Amount must be positive"));
                                            if (remaining !== undefined && value > remaining)
                                                return Promise.reject(new Error("Amount exceeds the remaining balance"));
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber min={0.01} precision={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Create>
    );
}