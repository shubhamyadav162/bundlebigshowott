-- 20250602_create_payment_transactions_and_credentials.sql

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  bill_id TEXT NOT NULL,
  external_reference TEXT,
  payment_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Create payment_gateway_credentials table
CREATE TABLE IF NOT EXISTS payment_gateway_credentials (
  provider TEXT PRIMARY KEY,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  environment TEXT NOT NULL
);
