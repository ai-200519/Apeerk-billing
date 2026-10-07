"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { Col, DatePicker, Form, InputNumber, Row, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { formatMoney } from "@/lib/format";

type CustomerOption = {
    id: string;
    name: string;
    type: string;
};

type MaterialOption = {
    id: string;
    name: string;
    unit_price: number | string;
};

type SubscriptionFormValues = {
    customer_id: string;
    material_id: string;
    quantity: number;
    start_date: Dayjs | string;
    end_date: Dayjs | string;
};

export default function SubscriptionCreate() {
    const { formProps, saveButtonProps, form } = useForm<BaseRecord, HttpError, SubscriptionFormValues>({
        resource: "subscription",
        action: "create",
        redirect: "list",
        meta: { fields: ["id"] },
    });

    const { selectProps: customerSelect } = useSelect({
        resource: "customer",
        optionValue: (item: CustomerOption) => item.id,
        optionLabel: (item: CustomerOption) => `${item.name} (${item.type})`,
        meta: { fields: ["id", "name", "type"] },
    });

    const { selectProps: materialSelect } = useSelect({
        resource: "material",
        optionValue: (item: MaterialOption) => item.id,
        optionLabel: (item: MaterialOption) => `${item.name} - ${formatMoney(item.unit_price)}`,
        meta: { fields: ["id", "name", "unit_price"] },
    });

    return (
        <Create saveButtonProps={{ ...saveButtonProps, icon: <SaveOutlined /> }}>
            <Form<SubscriptionFormValues>
                {...formProps}
                form={form}
                className="create-form"
                layout="vertical"
                initialValues={{
                    quantity: 1,
                    start_date: dayjs(),
                    end_date: dayjs().add(1, "year").subtract(1, "day"),
                    material_id: "11111111-1111-1111-1111-111111111111",
                }}
                onValuesChange={(changed) => {
                    // keep a one-year term by default when the start date changes
                    if (changed.start_date) {
                        form.setFieldValue(
                            "end_date",
                            dayjs(changed.start_date).add(1, "year").subtract(1, "day")
                        );
                    }
                }}
                onFinish={(values: SubscriptionFormValues) =>
                    formProps.onFinish?.({
                        customer_id: values.customer_id,
                        material_id: values.material_id,
                        quantity: values.quantity,
                        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
                        end_date: dayjs(values.end_date).format("YYYY-MM-DD"),
                        // unit_price is not sent: the database copies it from the material
                    })
                }
            >
                <div className="form-section">
                    <div className="form-section-title">Subscription details</div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Customer" name="customer_id" rules={[{ required: true }]}>
                                <Select {...customerSelect} showSearch placeholder="Select a customer" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Product" name="material_id" rules={[{ required: true }]}>
                                <Select {...materialSelect} placeholder="Select a product" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Quantity (licences)" name="quantity" rules={[{ required: true }]}>
                                <InputNumber min={1} precision={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Start date" name="start_date" rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="End date"
                                name="end_date"
                                dependencies={["start_date"]}
                                rules={[
                                    { required: true },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const start = getFieldValue("start_date");
                                            return !value || !start || value.isAfter(start)
                                                ? Promise.resolve()
                                                : Promise.reject(new Error("End date must be after start date"));
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Create>
    );
}