import { logger } from './utils/logger.js';
import { getEmailStats, getActionItems, getUpcomingDeadlines } from './dataStore.js';
import { format } from 'date-fns';

/**
 * Generate a daily email summary
 * @returns {Object} - The email summary
 */
export async function generateDailySummary() {
  try {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    
    // Get email statistics
    const stats = await getEmailStats(formattedDate);
    
    // Get action items
    const actionItems = await getActionItems();
    
    // Get upcoming deadlines
    const deadlines = await getUpcomingDeadlines();
    
    // Generate summary
    const summary = {
      date: formattedDate,
      stats: {
        total: stats.total,
        categories: {
          urgent: stats.urgent,
          important: stats.important,
          regular: stats.regular,
          lowPriority: stats.lowPriority
        }
      },
      actionItems: actionItems.map(item => ({
        subject: item.subject,
        from: item.from,
        deadline: item.deadline ? format(new Date(item.deadline), 'yyyy-MM-dd') : null
      })),
      upcomingDeadlines: deadlines.map(deadline => ({
        subject: deadline.subject,
        date: format(new Date(deadline.date), 'yyyy-MM-dd'),
        description: deadline.description
      }))
    };
    
    logger.info('Daily summary generated', { date: formattedDate });
    
    return summary;
  } catch (error) {
    logger.error('Error generating daily summary:', error);
    throw error;
  }
}

/**
 * Format the summary as a readable text
 * @param {Object} summary - The summary object
 * @returns {String} - Formatted summary text
 */
export function formatSummaryText(summary) {
  const { date, stats, actionItems, upcomingDeadlines } = summary;
  
  let text = `📧 Email Summary for ${date} 📧\n\n`;
  
  // Email statistics
  text += `📊 Email Statistics:\n`;
  text += `   Total new messages: ${stats.total}\n`;
  text += `   Urgent: ${stats.categories.urgent}\n`;
  text += `   Important: ${stats.categories.important}\n`;
  text += `   Regular: ${stats.categories.regular}\n`;
  text += `   Low Priority: ${stats.categories.lowPriority}\n\n`;
  
  // Action items
  text += `📝 Action Items (${actionItems.length}):\n`;
  if (actionItems.length === 0) {
    text += `   No action items for today.\n`;
  } else {
    actionItems.forEach((item, index) => {
      text += `   ${index + 1}. "${item.subject}" from ${item.from}`;
      if (item.deadline) {
        text += ` (Due: ${item.deadline})`;
      }
      text += `\n`;
    });
  }
  text += `\n`;
  
  // Upcoming deadlines
  text += `⏰ Upcoming Deadlines (${upcomingDeadlines.length}):\n`;
  if (upcomingDeadlines.length === 0) {
    text += `   No upcoming deadlines.\n`;
  } else {
    upcomingDeadlines.forEach((deadline, index) => {
      text += `   ${index + 1}. ${deadline.date}: ${deadline.subject}`;
      if (deadline.description) {
        text += ` - ${deadline.description}`;
      }
      text += `\n`;
    });
  }
  
  return text;
}