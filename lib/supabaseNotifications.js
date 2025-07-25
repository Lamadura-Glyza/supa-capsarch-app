import { supabase } from './supabase';

/**
 * Creates a notification in the notifications table.
 * @param {Object} notificationData - The notification details.
 * @param {string} notificationData.recipientId - The user ID to notify.
 * @param {string|null} notificationData.senderId - The user ID sending the notification (can be null for system/admin).
 * @param {string} notificationData.projectId - The related project ID.
 * @param {string} notificationData.type - The type of notification (e.g., 'rejection', 'like', etc.).
 * @param {string} notificationData.message - The notification message.
 * @returns {Promise<Object>} The created notification record.
 */
export const createNotification = async (notificationData) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        recipient_id: notificationData.recipientId,
        sender_id: notificationData.senderId,
        project_id: notificationData.projectId,
        type: notificationData.type,
        message: notificationData.message,
        read: false,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Notification creation error:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}; 