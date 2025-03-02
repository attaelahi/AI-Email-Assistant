import { logger } from './utils/logger.js';

// In-memory data store (in a real application, this would be a database)
const emailStore = {
  emails: [],
  actionItems: [],
  deadlines: []
};

/**
 * Store an email in the data store
 * @param {Object} email - The email to store
 * @returns {Boolean} - Success status
 */
export async function storeEmail(email) {
  try {
    emailStore.emails.push({
      ...email,
      processed: new Date()
    });
    
    logger.info(`Email stored: ${email.subject}`);
    return true;
  } catch (error) {
    logger.error('Error storing email:', error);
    return false;
  }
}

/**
 * Get all emails
 * @returns {Array} - All emails
 */
export async function getEmails() {
  try {
    // Sort by date (newest first)
    return emailStore.emails.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    logger.error('Error getting emails:', error);
    return [];
  }
}

/**
 * Get email history for a specific sender
 * @param {String} sender - The email sender
 * @returns {Array} - The email history
 */
export async function getEmailHistory(sender) {
  try {
    // Filter emails by sender
    const history = emailStore.emails.filter(email => 
      email.from.toLowerCase().includes(sender.toLowerCase())
    );
    
    // Sort by date (newest first)
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    logger.error('Error getting email history:', error);
    return [];
  }
}

/**
 * Get email statistics for a specific date
 * @param {String} date - The date to get statistics for (YYYY-MM-DD)
 * @returns {Object} - The email statistics
 */
export async function getEmailStats(date) {
  try {
    // Filter emails by date
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const emails = emailStore.emails.filter(email => {
      const emailDate = new Date(email.processed);
      return emailDate >= startOfDay && emailDate <= endOfDay;
    });
    
    // Count emails by category
    const stats = {
      total: emails.length,
      urgent: emails.filter(email => email.category === 'Urgent').length,
      important: emails.filter(email => email.category === 'Important').length,
      regular: emails.filter(email => email.category === 'Regular').length,
      lowPriority: emails.filter(email => email.category === 'Low Priority').length
    };
    
    return stats;
  } catch (error) {
    logger.error('Error getting email statistics:', error);
    return {
      total: 0,
      urgent: 0,
      important: 0,
      regular: 0,
      lowPriority: 0
    };
  }
}

/**
 * Store an action item
 * @param {Object} actionItem - The action item to store
 * @returns {Boolean} - Success status
 */
export async function storeActionItem(actionItem) {
  try {
    emailStore.actionItems.push({
      ...actionItem,
      created: new Date()
    });
    
    logger.info(`Action item stored: ${actionItem.subject}`);
    return true;
  } catch (error) {
    logger.error('Error storing action item:', error);
    return false;
  }
}

/**
 * Get all action items
 * @returns {Array} - The action items
 */
export async function getActionItems() {
  try {
    // Sort by deadline (soonest first)
    return emailStore.actionItems.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } catch (error) {
    logger.error('Error getting action items:', error);
    return [];
  }
}

/**
 * Store a deadline
 * @param {Object} deadline - The deadline to store
 * @returns {Boolean} - Success status
 */
export async function storeDeadline(deadline) {
  try {
    emailStore.deadlines.push({
      ...deadline,
      created: new Date()
    });
    
    logger.info(`Deadline stored: ${deadline.subject}`);
    return true;
  } catch (error) {
    logger.error('Error storing deadline:', error);
    return false;
  }
}

/**
 * Get upcoming deadlines
 * @param {Number} days - Number of days to look ahead (default: 7)
 * @returns {Array} - The upcoming deadlines
 */
export async function getUpcomingDeadlines(days = 7) {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    // Filter deadlines by date range
    const deadlines = emailStore.deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.date);
      return deadlineDate >= today && deadlineDate <= futureDate;
    });
    
    // Sort by date (soonest first)
    return deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    logger.error('Error getting upcoming deadlines:', error);
    return [];
  }
}