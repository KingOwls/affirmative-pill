CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  presentation TEXT NOT NULL,
  indications TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  category_id UUID NOT NULL REFERENCES categories(id),
  laboratory_id UUID NOT NULL REFERENCES laboratories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medicines_name_trgm_idx ON medicines USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS medicines_active_trgm_idx ON medicines USING gin (active_ingredient gin_trgm_ops);
CREATE INDEX IF NOT EXISTS medicines_category_idx ON medicines(category_id);
CREATE INDEX IF NOT EXISTS medicines_lab_idx ON medicines(laboratory_id);
CREATE INDEX IF NOT EXISTS medicines_rx_idx ON medicines(requires_prescription);

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'DISPATCHED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING_APPROVAL',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  medicine_name_snapshot TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  prescription_number TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  issued_at DATE NOT NULL,
  validated BOOLEAN NOT NULL DEFAULT FALSE,
  validated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_events (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  aggregate_version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  projected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS order_events_pending_idx ON order_events(projected_at, id);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id, id);

CREATE TABLE IF NOT EXISTS order_projections (
  order_id UUID PRIMARY KEY,
  patient_name TEXT NOT NULL,
  status order_status NOT NULL,
  total_cents INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  prescription_required BOOLEAN NOT NULL DEFAULT FALSE,
  prescription_validated BOOLEAN NOT NULL DEFAULT FALSE,
  projected_version INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  projection_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_projections_status_idx ON order_projections(status);
