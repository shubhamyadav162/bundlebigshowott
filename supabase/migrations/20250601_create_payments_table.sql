-- 20250601_create_payments_table.sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','failed')),
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
); 