-- Add foreign key for notifications.sender_id -> user_profiles.user_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'notifications'
      AND constraint_name = 'fk_notifications_sender'
  ) THEN
    ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_sender
    FOREIGN KEY (sender_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
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
  AND tc.table_name = 'notifications'; 