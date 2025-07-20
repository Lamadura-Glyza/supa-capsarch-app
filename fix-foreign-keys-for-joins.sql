-- Fix missing foreign key constraints for Supabase joins

-- 1. Add foreign key for project_comments.user_id -> user_profiles.user_id
ALTER TABLE project_comments
ADD CONSTRAINT fk_project_comments_user
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- 2. Add foreign key for notifications.sender_id -> user_profiles.user_id
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_sender
FOREIGN KEY (sender_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- 3. Add foreign key for notifications.recipient_id -> user_profiles.user_id
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_recipient
FOREIGN KEY (recipient_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Verification
SELECT 'Foreign keys for joins added' as info;
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('project_comments', 'notifications')
ORDER BY tc.table_name, kcu.column_name; 