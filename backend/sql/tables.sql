-- Note: Run these commands separately in your postgreSQL server

-- Query to create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    mobile_number VARCHAR(15) NOT NULL UNIQUE,

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Query to create the loans table

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    friend_name VARCHAR(255) NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    due_date DATE NOT NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    receipt_image_url BYTEA
);


-- Qyuery to create repayments table

CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    loan_id UUID NOT NULL REFERENCES loans(id)
        ON DELETE CASCADE,

    amount NUMERIC(12, 2) NOT NULL,

    image_url BYTEA,

    notes TEXT,

    repayment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
