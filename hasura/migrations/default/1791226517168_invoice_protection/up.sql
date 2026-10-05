-- Invoices: amounts and identity are immutable; status changes are controlled
CREATE FUNCTION invoice_protect() RETURNS trigger AS $$
BEGIN
  IF NEW.total_ht <> OLD.total_ht
     OR NEW.total_ttc <> OLD.total_ttc
     OR NEW.subscription_id <> OLD.subscription_id
     OR NEW.invoice_number <> OLD.invoice_number THEN
    RAISE EXCEPTION 'Invoice amounts, number and subscription cannot be modified';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'A cancelled invoice cannot be reopened';
    END IF;

    IF NEW.status = 'CANCELLED' THEN
      IF OLD.status <> 'PENDING' THEN
        RAISE EXCEPTION 'Only a PENDING invoice can be cancelled';
      END IF;
      IF EXISTS (SELECT 1 FROM billing WHERE invoice_id = OLD.id) THEN
        RAISE EXCEPTION 'An invoice with payments cannot be cancelled';
      END IF;
    ELSIF pg_trigger_depth() = 1 THEN
      -- PAID/PENDING are set by the payment triggers (depth > 1), never by hand
      RAISE EXCEPTION 'Invoice status PAID/PENDING is managed automatically by payments';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_protect
  BEFORE UPDATE ON invoice
  FOR EACH ROW EXECUTE FUNCTION invoice_protect();

-- Subscriptions are append-only: the invoice was generated from them
CREATE FUNCTION subscription_block_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Subscriptions cannot be modified; cancel the invoice and create a new subscription';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscription_block_update
  BEFORE UPDATE ON subscription
  FOR EACH ROW EXECUTE FUNCTION subscription_block_update();