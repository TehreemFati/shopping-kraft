-- Staff permissions + audit logs + order tracking

CREATE TABLE staff_permissions (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_permissions_active ON staff_permissions(is_active);

CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_actor ON admin_audit_logs(actor_id);
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage staff_permissions" ON staff_permissions
  FOR ALL USING (is_admin());

CREATE POLICY "Staff read own permissions" ON staff_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage audit logs" ON admin_audit_logs
  FOR ALL USING (is_admin());

CREATE POLICY "Admins insert audit logs" ON admin_audit_logs
  FOR INSERT WITH CHECK (is_admin());
