-- Seed instructions for first admin user
-- After creating a user in Supabase Auth dashboard, run:
-- UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';

-- Optional: promote by email (run after user registers)
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@shoppingkraft.com');
