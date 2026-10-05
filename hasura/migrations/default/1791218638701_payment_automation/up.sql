-- Recompute an invoice's status from its payments
CREATE FUNCTION invoice_refresh_status(p_invoice_id uuid) RETURNS void AS $$
DECLARE
  v_total  numeric;
  v_status text;
  v_paid   numeric;
BEGIN
  SELECT total_ttc, status INTO v_total, v_status FROM invoice WHERE id = p_invoice_id;
  IF NOT FOUND OR v_status IN ('DRAFT', 'CANCELLED') THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid FROM billing WHERE invoice_id = p_invoice_id;

  UPDATE invoice
     SET status = CASE WHEN v_paid >= v_total THEN 'PAID' ELSE 'PENDING' END
   WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Validate a payment before it is inserted
CREATE FUNCTION billing_validate() RETURNS trigger AS $$
DECLARE
  v_total  numeric;
  v_status text;
  v_paid   numeric;
BEGIN
  SELECT total_ttc, status INTO v_total, v_status
    FROM invoice WHERE id = NEW.invoice_id FOR UPDATE;

  IF v_status <> 'PENDING' THEN
    RAISE EXCEPTION 'Invoice is %, payments are only accepted on PENDING invoices', v_status;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid FROM billing WHERE invoice_id = NEW.invoice_id;

  IF v_paid + NEW.amount > v_total THEN
    RAISE EXCEPTION 'Payment exceeds the remaining balance (% remaining)', v_total - v_paid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_billing_validate
  BEFORE INSERT ON billing
  FOR EACH ROW EXECUTE FUNCTION billing_validate();

-- Refresh the invoice status after a payment is added or removed
CREATE FUNCTION billing_after_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM invoice_refresh_status(OLD.invoice_id);
  ELSE
    PERFORM invoice_refresh_status(NEW.invoice_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_billing_after_change
  AFTER INSERT OR DELETE ON billing
  FOR EACH ROW EXECUTE FUNCTION billing_after_change();

-- Payments are append-only
CREATE FUNCTION billing_block_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Payments cannot be modified; delete and re-enter the payment instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_billing_block_update
  BEFORE UPDATE ON billing
  FOR EACH ROW EXECUTE FUNCTION billing_block_update();