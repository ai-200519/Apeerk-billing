# Apeerk Billing

Simplified subscription and invoicing app for Apeerk. A sales manager can manage the full customer lifecycle: create a customer, subscribe them to the annual plan, get an invoice generated automatically, record payments, and print the invoice as a PDF.

[![Invoice in Anthropic format](docs/screenshots/invoice.png)](docs/screenshots/invoice.png)
[![List invoices on Dashbord](docs/screenshots/invoices-list.png)](docs/screenshots/invoices-list.png)

## Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 |
| API | Hasura GraphQL Engine v2.48 |
| Frontend | Next.js (App Router), React 19 |
| Admin framework | Refine + `@refinedev/hasura` data provider |
| UI | Ant Design 5 (`@refinedev/antd`) |
| Runtime / package manager | Bun |

Authentication is out of scope for this exercise, as stated in the brief.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Hasura CLI](https://hasura.io/docs/2.0/hasura-cli/install-hasura-cli/) v2 (only needed to apply the seed data)
- [Bun](https://bun.sh/)

## Quick start

```bash
# 1. Environment for Docker (Windows PowerShell: Copy-Item .env.example .env)
cp .env.example .env

# 2. Start PostgreSQL + Hasura (schema and metadata are applied automatically)
docker compose up -d
# wait ~40 seconds: Hasura applies migrations before it starts listening

# 3. Demo data (1 product, 2 customers, 1 subscription with its invoice)
cd hasura
hasura seed apply --database-name default
cd ..

# 4. Web app
cd web
cp .env.example .env.local
bun install
bun dev
```

Then open:

- App: <http://localhost:3000>
- Hasura health check: <http://localhost:8080/healthz> (should print `OK`)
- Hasura console (optional): run `hasura console` from `hasura/`, then open <http://localhost:9695>. Use this one rather than `localhost:8080/console`, because it writes your changes to `metadata/` and `migrations/`.

To start from a clean database: `docker compose down -v`, then repeat steps 2 and 3.

## Lifecycle

```
customer -> subscription -> invoice (PENDING) -> billing(s) -> invoice (PAID)
```

1. **Customer.** B2B customers must have a VAT number, enforced in the form and by a database `CHECK` constraint. B2C customers don't need one.
2. **Subscription.** Links a customer to the product, with a period and a quantity. The unit price is copied from the product at that moment (price snapshot), so later price changes don't alter existing contracts.
3. **Invoice.** Generated automatically by a database trigger when the subscription is created:
   - `total_ht = quantity x unit_price`, `total_ttc = total_ht x 1.20`
   - number from a sequence (`INV-2026-0001`)
   - due date: issue date + 30 days for B2B, same day for B2C
   - status `PENDING`
4. **Payment.** Recorded against a pending invoice. When payments cover the total, the invoice becomes `PAID` automatically. Partial payments are supported.

**B2B vs B2C.** The only difference is timing. A B2B invoice stays `PENDING` until the transfer is received. For B2C or cash, record the payment right after creating the subscription, using the **Record payment** button on the new invoice, and it moves to `PAID` immediately.

## Invoice and PDF

Open **Invoices > View** on any invoice. The layout follows the Anthropic sample from the brief: minimal header, metadata grid, bill-to block, line table, right-aligned totals with payment history, bank details footer.

Click **Print / Save as PDF**. In the browser print dialog, choose **Save as PDF** as the destination, paper size **A4**, and enable **Background graphics** so the status badge keeps its colour. A print stylesheet hides the app layout so only the invoice is output.

## Project structure

```
apeerk-billing/
├── docker-compose.yml        PostgreSQL + Hasura
├── .env.example
├── hasura/
│   ├── config.yaml
│   ├── migrations/default/   schema, triggers (applied automatically at startup)
│   ├── metadata/             tracked tables, relationships, enums
│   └── seeds/default/        demo data
└── web/                      Next.js + Refine app
    └── src/
        ├── app/              customers, subscriptions, invoices, billings pages
        ├── components/invoice/   invoice template and print CSS
        ├── providers/        Hasura data provider
        └── lib/              constants (VAT rate, issuer details), formatting
```

## Business rules enforced in the database

The rules live in PostgreSQL triggers, so no form or API call can bypass them.

| Rule | Mechanism |
|---|---|
| B2B customers require a VAT number | `CHECK` constraint |
| Subscription price is snapshotted from the product | `BEFORE INSERT` trigger |
| Invoice is generated from the subscription | `AFTER INSERT` trigger |
| Payments only on `PENDING` invoices, never above the remaining balance | `BEFORE INSERT` trigger with row lock |
| Invoice becomes `PAID` when fully covered, back to `PENDING` if a payment is deleted | `AFTER INSERT/DELETE` trigger |
| Payments and subscriptions cannot be edited | `BEFORE UPDATE` triggers |
| Invoice amounts and number are immutable; a pending, unpaid invoice can be cancelled, and cancellation is final | `BEFORE UPDATE` trigger |

Lookup values (`customer_type`, `invoice_status`, `payment_mode`) are Hasura enum tables, so they appear as real GraphQL enums.

## Assumptions and design decisions

- **VAT rate: 20%.** The brief doesn't specify one. The Anthropic sample shows 20% for Morocco. The rate is defined in the invoice trigger and mirrored by `VAT_RATE` in `web/src/lib/constants.ts`.
- **Currency: MAD.** Not specified in the brief. Change `CURRENCY` in `web/src/lib/constants.ts`.
- **Issuer and bank details are placeholders** (`ISSUER`, `BANK` in `constants.ts`) and must be replaced with Apeerk's real legal details. The logo is a simple placeholder SVG in `web/public/`.
- **Invoice numbers** come from a PostgreSQL sequence: unique and race-free, but the counter doesn't reset each year and never reuses a number.
- **No authentication.** As per the brief. The web app calls Hasura with the admin secret from the browser (`NEXT_PUBLIC_` variable). This is deliberate for a local demo and **must not be used in production**, where roles, permissions and a server-side proxy would be required.
- **Browser print for PDF** instead of a server-side generator: no extra dependency, selectable text, and it uses the print stylesheet. The footer shows a static "Page 1 / 1", since an invoice with one line always fits on a single page.
- **Dates** use the database server's timezone (UTC), so near midnight an issue date can differ by one day from a Moroccan clock.

## Troubleshooting

- **Hasura isn't reachable right after `docker compose up`.** The `cli-migrations` image applies migrations first, then starts the server. Wait about 40 seconds and check `docker compose ps` and `http://localhost:8080/healthz`.
- **`hasura seed apply` fails with a duplicate key error.** Data already exists. The seed is written to be re-runnable, but if you edited it, reset with `docker compose down -v`.
- **Dependency versions are pinned on purpose.** `@refinedev/hasura` requires `graphql-request@^5` and `graphql@^15`. Newer versions cause a duplicate-type error.
- **`@ant-design/v5-patch-for-react-19`** is installed because Ant Design 5 officially supports React up to 18, while Next.js ships React 19.
- **A `Menu children is deprecated` warning appears in dev mode.** It comes from `@refinedev/antd` and is harmless.

## What I'd improve with more time

- Real authentication, Hasura roles and permissions instead of the admin secret.
- A one-step "create subscription and pay now" flow for B2C.
- Server-side PDF generation and multi-page invoices.
- Multiple invoice lines and per-customer VAT rules.
- Automated tests for the trigger logic.
- A Dockerfile for the web app, so the whole stack starts with one command.