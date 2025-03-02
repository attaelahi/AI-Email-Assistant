import { logger } from './utils/logger.js';
import { format } from 'date-fns';

// Folder structure
const FOLDERS = {
  URGENT: 'Urgent',
  IMPORTANT: 'Important',
  REGULAR: 'Regular',
  LOW_PRIORITY: 'Low Priority',
  ARCHIVED: 'Archived',
  FOLLOW_UP: 'Follow Up'
};

// Email organization rules
const RULES = [
  {
    name: 'Urgent emails',
    condition: email => email.category === 'Urgent',
    action: email => moveToFolder(email, FOLDERS.URGENT)
  },
  {
    name: 'Important emails',
    condition: email => email.category === 'Important',
    action: email => moveToFolder(email, FOLDERS.IMPORTANT)
  },
  {
    name: 'Regular emails',
    condition: email => email.category === 'Regular',
    action: email => moveToFolder(email, FOLDERS.REGULAR)
  },
  {
    name: 'Low priority emails',
    condition: email => email.category === 'Low Priority',
    action: email => moveToFolder(email, FOLDERS.LOW_PRIORITY)
  },
  {
    name: 'Follow-up needed',
    condition: email => needsFollowUp(email),
    action: email => flagForFollowUp(email)
  },
  {
    name: 'Old emails',
    condition: email => isOldEmail(email),
    action: email => archiveEmail(email)
  }
];

/**
 * Organize an email based on category and rules
 * @param {Object} email - The email to organize
 * @param {String} category - The email category
 * @returns {Object} - The organized email
 */
export async function organizeEmail(email, category) {
  try {
    // Add category to email object
    const emailWithCategory = { ...email, category };
    
    // Apply organization rules
    for (const rule of RULES) {
      if (rule.condition(emailWithCategory)) {
        await rule.action(emailWithCategory);
      }
    }
    
    logger.info(`Email organized: ${email.subject}`);
    return emailWithCategory;
  } catch (error) {
    logger.error('Error organizing email:', error);
    return email;
  }
}

/**
 * Move an email to a specific folder
 * @param {Object} email - The email to move
 * @param {String} folder - The destination folder
 * @returns {Boolean} - Success status
 */
async function moveToFolder(email, folder) {
  try {
    // In a real implementation, this would use IMAP to move the email
    logger.info(`Moving email "${email.subject}" to folder: ${folder}`);
    
    // Simulate successful move
    return true;
  } catch (error) {
    logger.error(`Error moving email to folder ${folder}:`, error);
    return false;
  }
}

/**
 * Check if an email needs follow-up
 * @param {Object} email - The email to check
 * @returns {Boolean} - Whether follow-up is needed
 */
function needsFollowUp(email) {
  const content = `${email.subject} ${email.body}`.toLowerCase();
  
  // Keywords that suggest follow-up is needed
  const followUpKeywords = [
    'follow up', 'get back to me', 'let me know',
    'waiting for your response', 'need your input',
    'please respond', 'your thoughts', 'feedback',
    'by tomorrow', 'by next week', 'deadline'
  ];
  
  return followUpKeywords.some(keyword => content.includes(keyword));
}

/**
 * Flag an email for follow-up
 * @param {Object} email - The email to flag
 * @returns {Object} - The flagged email with deadline
 */
async function flagForFollowUp(email) {
  try {
    // Determine appropriate follow-up deadline
    const deadline = determineFollowUpDeadline(email);
    
    // In a real implementation, this would flag the email in the email system
    logger.info(`Flagging email "${email.subject}" for follow-up by ${format(deadline, 'yyyy-MM-dd')}`);
    
    // Move to follow-up folder
    await moveToFolder(email, FOLDERS.FOLLOW_UP);
    
    return {
      ...email,
      followUp: true,
      followUpDeadline: deadline
    };
  } catch (error) {
    logger.error('Error flagging email for follow-up:', error);
    return email;
  }
}

/**
 * Determine an appropriate follow-up deadline
 * @param {Object} email - The email
 * @returns {Date} - The suggested deadline
 */
function determineFollowUpDeadline(email) {
  const content = `${email.subject} ${email.body}`.toLowerCase();
  const today = new Date();
  
  // Check for specific timeframes mentioned
  if (content.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  if (content.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  if (content.includes('end of week') || content.includes('this week')) {
    const endOfWeek = new Date(today);
    // Set to Friday (5 = Friday)
    endOfWeek.setDate(endOfWeek.getDate() + (5 - endOfWeek.getDay()));
    return endOfWeek;
  }
  
  // Default: 3 business days
  const defaultDeadline = new Date(today);
  defaultDeadline.setDate(defaultDeadline.getDate() + 3);
  return defaultDeadline;
}

/**
 * Check if an email is old and can be archived
 * @param {Object} email - The email to check
 * @returns {Boolean} - Whether the email is old
 */
function isOldEmail(email) {
  const emailDate = new Date(email.date);
  const today = new Date();
  
  // Calculate difference in days
  const diffTime = Math.abs(today - emailDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Consider emails older than 30 days as old
  return diffDays > 30;
}

/**
 * Archive an old email
 * @param {Object} email - The email to archive
 * @returns {Boolean} - Success status
 */
async function archiveEmail(email) {
  try {
    // In a real implementation, this would archive the email
    logger.info(`Archiving old email: ${email.subject}`);
    
    // Move to archived folder
    return await moveToFolder(email, FOLDERS.ARCHIVED);
  } catch (error) {
    logger.error('Error archiving email:', error);
    return false;
  }
}