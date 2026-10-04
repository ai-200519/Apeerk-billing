INSERT INTO material (id, name, unit_price) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Abonnement annuel Apeerk', 1200.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customer (name, type, billing_address, vat_number)
SELECT v.name, v.type, v.billing_address, v.vat_number
FROM (VALUES
  ('Atlas Logistics SARL', 'B2B', '12 Avenue Hassan II, 20000 Casablanca', 'MA-12345678'),
  ('Sara Benali',          'B2C', '8 Rue des Orangers, 30000 Fès',        NULL)
) AS v(name, type, billing_address, vat_number)
WHERE NOT EXISTS (SELECT 1 FROM customer c WHERE c.name = v.name);