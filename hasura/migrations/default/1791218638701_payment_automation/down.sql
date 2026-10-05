DROP TRIGGER trg_billing_block_update ON billing;
DROP TRIGGER trg_billing_after_change ON billing;
DROP TRIGGER trg_billing_validate ON billing;
DROP FUNCTION billing_block_update();
DROP FUNCTION billing_after_change();
DROP FUNCTION billing_validate();
DROP FUNCTION invoice_refresh_status(uuid);