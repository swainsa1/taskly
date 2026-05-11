-- User account approval status
-- pending  = registered, awaiting admin approval
-- approved = can log in and use the app
-- rejected = denied by admin
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'approved', 'rejected'));

-- Existing users (e.g. seeded admin) stay approved
UPDATE users SET status = 'approved';
