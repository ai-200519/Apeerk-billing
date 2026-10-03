-- Enum tables (Hasura-native way to do enums)
CREATE TABLE customer_type    (value text PRIMARY KEY, comment text);
CREATE TABLE invoice_status   (value text PRIMARY KEY, comment text);
CREATE TABLE payment_mode     (value text PRIMARY KEY, comment text);

INSERT INTO customer_type  VALUES ('B2B','Business'), ('B2C','Individual');
INSERT INTO invoice_status VALUES ('DRAFT','Draft'), ('PENDING','Awaiting payment'),
                                  ('PAID','Fully paid'), ('CANCELLED','Cancelled');
INSERT INTO payment_mode   VALUES ('VIREMENT','Bank transfer'), ('CARTE','Card'), ('ESPECES','Cash');

-- customer
CREATE TABLE customer (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  type            text NOT NULL REFERENCES customer_type(value),
  billing_address text NOT NULL,
  vat_number      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT b2b_requires_vat CHECK (type <> 'B2B' OR vat_number IS NOT NULL)
);

-- material
CREATE TABLE material (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0)
);

-- subscription
CREATE TABLE subscription (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer(id),
  material_id uuid NOT NULL REFERENCES material(id),
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (end_date > start_date)
);

-- invoice numbering: INV-2026-0001
CREATE SEQUENCE invoice_number_seq;

CREATE FUNCTION generate_invoice_number() RETURNS text AS $$
  SELECT 'INV-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('invoice_number_seq')::text, 4, '0');
$$ LANGUAGE sql VOLATILE;

-- invoice
CREATE TABLE invoice (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   uuid NOT NULL REFERENCES subscription(id),
  invoice_number    text NOT NULL UNIQUE DEFAULT generate_invoice_number(),
  issue_date        date NOT NULL DEFAULT current_date,
  due_date          date NOT NULL,
  consumption_start date NOT NULL,
  consumption_end   date NOT NULL,
  total_ht          numeric(12,2) NOT NULL,
  total_ttc         numeric(12,2) NOT NULL,
  status            text NOT NULL DEFAULT 'PENDING' REFERENCES invoice_status(value)
);

-- billing (payments)
CREATE TABLE billing (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid NOT NULL REFERENCES invoice(id),
  payment_mode text NOT NULL REFERENCES payment_mode(value),
  payment_date date NOT NULL DEFAULT current_date,
  amount       numeric(12,2) NOT NULL CHECK (amount > 0)
);

-- indexes on foreign keys
CREATE INDEX ON subscription(customer_id);
CREATE INDEX ON invoice(subscription_id);
CREATE INDEX ON billing(invoice_id);