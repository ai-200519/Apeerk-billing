"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Row, Col, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";

export default function CustomerCreate() {
    const { formProps, saveButtonProps } = useForm({
        resource: "customer",
        action: "create",
        meta: { fields: ["id"] },
    });

    return (
        <Create saveButtonProps={{ ...saveButtonProps, icon: <SaveOutlined /> }}>
            <Form
                {...formProps}
                className="create-form"
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
                <div className="form-section">
                    <div className="form-section-title">Customer details</div>
                    <Row gutter={16}>
                        <Col xs={24} md={16}>
                            <Form.Item
                                label="Name / Company name"
                                name="name"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Enter a customer or company name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { value: "B2C", label: "B2C (individual)" },
                                        { value: "B2B", label: "B2B (business)" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Billing address"
                        name="billing_address"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={3} placeholder="Enter the billing address" />
                    </Form.Item>

                    <Form.Item
                        label="VAT number"
                        name="vat_number"
                        dependencies={["type"]}
                        extra="Required for B2B customers."
                        rules={[
                            ({ getFieldValue }) => ({
                                required: getFieldValue("type") === "B2B",
                                whitespace: true,
                                message: "VAT number is required for B2B customers",
                            }),
                        ]}
                    >
                        <Input placeholder="Enter the VAT number" />
                    </Form.Item>
                </div>
            </Form>
        </Create>
    );
}