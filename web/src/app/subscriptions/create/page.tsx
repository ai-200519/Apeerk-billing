"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, InputNumber, DatePicker } from "antd";
import dayjs from "dayjs";
import { formatMoney } from "@/lib/format";

export default function SubscriptionCreate() {
    const { formProps, saveButtonProps, form } = useForm({
        resource: "subscription",
        action: "create",
        redirect: "list",
        meta: { fields: ["id"] },
    });

    const { selectProps: customerSelect } = useSelect({
        resource: "customer",
        optionValue: (item: any) => item.id,
        optionLabel: (item: any) => `${item.name} (${item.type})`,
        meta: { fields: ["id", "name", "type"] },
    });

    const { selectProps: materialSelect } = useSelect({
        resource: "material",
        optionValue: (item: any) => item.id,
        optionLabel: (item: any) => `${item.name} - ${formatMoney(item.unit_price)}`,
        meta: { fields: ["id", "name", "unit_price"] },
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form
                {...formProps}
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
                onFinish={(values: any) =>
                    formProps.onFinish?.({
                        customer_id: values.customer_id,
                        material_id: values.material_id,
                        quantity: values.quantity,
                        start_date: values.start_date.format("YYYY-MM-DD"),
                        end_date: values.end_date.format("YYYY-MM-DD"),
                        // unit_price is not sent: the database copies it from the material
                    })
                }
            >
                <Form.Item label="Customer" name="customer_id" rules={[{ required: true }]}>
                    <Select {...customerSelect} showSearch placeholder="Select a customer" />
                </Form.Item>

                <Form.Item label="Product" name="material_id" rules={[{ required: true }]}>
                    <Select {...materialSelect} />
                </Form.Item>

                <Form.Item label="Quantity (licences)" name="quantity" rules={[{ required: true }]}>
                    <InputNumber min={1} precision={0} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Start date" name="start_date" rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>

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
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Create>
    );
}