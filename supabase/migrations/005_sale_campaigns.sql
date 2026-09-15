-- Sale campaigns (Flash / Seasonal / Clearance / Custom)

CREATE TYPE sale_campaign_type AS ENUM ('flash', 'seasonal', 'clearance', 'custom');

CREATE TABLE sale_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sale_type sale_campaign_type NOT NULL DEFAULT 'custom',
  description TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_sale_campaigns_slug ON sale_campaigns(slug);
CREATE INDEX idx_sale_campaigns_active ON sale_campaigns(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_sale_campaigns_window ON sale_campaigns(starts_at, ends_at);

CREATE TABLE sale_campaign_products (
  campaign_id UUID NOT NULL REFERENCES sale_campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  campaign_sale_price NUMERIC(12, 2),
  PRIMARY KEY (campaign_id, product_id)
);

CREATE INDEX idx_sale_campaign_products_product ON sale_campaign_products(product_id);

ALTER TABLE sale_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_campaign_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active sale campaigns" ON sale_campaigns
  FOR SELECT USING (
    is_admin()
    OR (
      is_active = true
      AND deleted_at IS NULL
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at >= NOW())
    )
  );

CREATE POLICY "Admins manage sale campaigns" ON sale_campaigns
  FOR ALL USING (is_admin());

CREATE POLICY "Public read sale campaign products" ON sale_campaign_products
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM sale_campaigns sc
      WHERE sc.id = campaign_id
        AND sc.is_active = true
        AND sc.deleted_at IS NULL
        AND (sc.starts_at IS NULL OR sc.starts_at <= NOW())
        AND (sc.ends_at IS NULL OR sc.ends_at >= NOW())
    )
  );

CREATE POLICY "Admins manage sale campaign products" ON sale_campaign_products
  FOR ALL USING (is_admin());
