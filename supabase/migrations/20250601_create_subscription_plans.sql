-- 20250601_create_subscription_plans.sql
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('monthly','yearly'))
); 