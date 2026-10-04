-- 1) Snapshot the material price if the client did not provide one
CREATE FUNCTION subscription_set_price() RETURNS trigger AS $$
BEGIN
  IF NEW.unit_price IS NULL THEN
    SELECT unit_price INTO NEW.unit_price FROM material WHERE id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscription_set_price
  BEFORE INSERT ON subscription
  FOR EACH ROW EXECUTE FUNCTION subscription_set_price();

-- 2) Generate the invoice right after the subscription is created
CREATE FUNCTION subscription_create_invoice() RETURNS trigger AS $$
DECLARE
  v_type     text;
  v_ht       numeric(12,2);
  v_vat_rate CONSTANT numeric := 0.20;
BEGIN
  SELECT type INTO v_type FROM customer WHERE id = NEW.customer_id;
  v_ht := round(NEW.quantity * NEW.unit_price, 2);

  INSERT INTO invoice (
    subscription_id, issue_date, due_date,
    consumption_start, consumption_end,
    total_ht, total_ttc, status
  ) VALUES (
    NEW.id,
    current_date,
    CASE WHEN v_type = 'B2B' THEN current_date + 30 ELSE current_date END,
    NEW.start_date, NEW.end_date,
    v_ht, round(v_ht * (1 + v_vat_rate), 2),
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscription_create_invoice
  AFTER INSERT ON subscription
  FOR EACH ROW EXECUTE FUNCTION subscription_create_invoice();