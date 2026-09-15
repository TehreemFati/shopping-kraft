-- Allow storefront (anon + authenticated customers) to read stock levels.
-- Without this, product pages always show Out of Stock and add-to-cart fails.

CREATE POLICY "Public read inventory"
  ON inventory
  FOR SELECT
  USING (
    (
      product_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM products p
        WHERE p.id = inventory.product_id
          AND p.is_active = true
          AND p.deleted_at IS NULL
      )
    )
    OR (
      variant_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM product_variants v
        JOIN products p ON p.id = v.product_id
        WHERE v.id = inventory.variant_id
          AND v.deleted_at IS NULL
          AND p.is_active = true
          AND p.deleted_at IS NULL
      )
    )
  );
