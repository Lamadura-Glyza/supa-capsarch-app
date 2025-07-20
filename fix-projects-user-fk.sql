-- Add foreign key for projects.user_id -> user_profiles.user_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'projects'
      AND constraint_name = 'fk_projects_user'
  ) THEN
    ALTER TABLE projects
    ADD CONSTRAINT fk_projects_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Verification
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'projects'; 