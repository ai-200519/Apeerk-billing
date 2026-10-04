"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function CustomerCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: "customer",
        action: "create",
        meta: { fields: ["id"] },
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form
                {...formProps}
                layout="vertical"
                initialValues={{ type: "B2C" }}
                onFinish={(values: any) =>
                    formProps.onFinish?.({
                        ...values,
                        // empty string -> null, so B2C customers store a real NULL
                        vat_number: values.vat_number?.trim() || null,
                    })
                }
            >
                <Form.Item
                    label="Name / Company name"
                    name="name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                    <Select
                        options={[
                            { value: "B2C", label: "B2C (individual)" },
                            { value: "B2B", label: "B2B (business)" },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Billing address"
                    name="billing_address"
                    rules={[{ required: true }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    label="VAT number"
                    name="vat_number"
                    dependencies={["type"]}
                    rules={[
                        ({ getFieldValue }) => ({
                            required: getFieldValue("type") === "B2B",
                            whitespace: true,
                            message: "VAT number is required for B2B customers",
                        }),
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Create>
    );
}