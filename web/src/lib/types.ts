export type CustomerSummary = {
    name?: string;
    type?: string;
    billing_address?: string;
    vat_number?: string;
};

export type BillingRecord = {
    id: string;
    amount: number | string;
    payment_mode: string;
    payment_date: string;
};

export type InvoiceRecord = {
    id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    consumption_start?: string;
    consumption_end?: string;
    total_ht: number | string;
    total_ttc: number | string;
    status: string;
    subscription?: {
        quantity?: number;
        unit_price?: number | string;
        customer?: CustomerSummary;
        material?: { name?: string };
    };
    billings?: BillingRecord[];
};

export type BillingListRecord = {
    invoice?: {
        invoice_number?: string;
        subscription?: { customer?: CustomerSummary };
    };
    payment_mode: string;
    payment_date: string;
    amount: number | string;
};

export type SubscriptionListRecord = {
    customer?: CustomerSummary;
    material?: { name?: string };
};
