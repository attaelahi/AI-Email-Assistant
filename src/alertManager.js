import { logger } from './utils/logger.js';

// Alert types
const ALERT_TYPES = {
  URGENT: 'URGENT',
  VIP: 'VIP',
  TIME_SENSITIVE: 'TIME_SENSITIVE',
  SECURITY: 'SECURITY'
};

// VIP contacts from environment
const getVipContacts = () => {
  const vipString = process.env.VIP_CONTACTS || '';
  return vipString.split(',').map(email => email.trim().toLowerCase());
};

// Security threat indicators
const securityKeywords = [
  'password', 'security breach', 'unauthorized', 'suspicious',
  'hack', 'compromised', 'phishing', 'fraud', 'scam',
  'urgent security', 'account access', 'verify your account'
];

/**
 * Check if an email requires an alert
 * @param {Object} email - The email to check
 * @param {String} category - The email category
 * @returns {Boolean} - Whether an alert is needed
 */
export async function checkForAlerts(email, category) {
  try {
    // Check for urgent emails
    if (category === 'Urgent') {
      await triggerAlert(email, ALERT_TYPES.URGENT);
      return true;
    }
    
    // Check for VIP contacts
    const vipContacts = getVipContacts();
    const fromAddress = email.from.toLowerCase();
    const isVipSender = vipContacts.some(vip => fromAddress.includes(vip));
    
    if (isVipSender) {
      await triggerAlert(email, ALERT_TYPES.VIP);
      return true;
    }
    
    // Check for time-sensitive matters
    if (isTimeSensitive(email)) {
      await triggerAlert(email, ALERT_TYPES.TIME_SENSITIVE);
      return true;
    }
    
    // Check for security threats
    if (isPotentialSecurityThreat(email)) {
      await triggerAlert(email, ALERT_TYPES.SECURITY);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking for alerts:', error);
    return false;
  }
}

/**
 * Trigger an alert for an email
 * @param {Object} email - The email that triggered the alert
 * @param {String} alertType - The type of alert
 * @returns {Boolean} - Success status
 */
async function triggerAlert(email, alertType) {
  try {
    // In a real implementation, this would send a notification
    // via SMS, push notification, or another channel
    
    const alertMessage = generateAlertMessage(email, alertType);
    
    logger.info(`ALERT [${alertType}]: ${alertMessage}`);
    
    // Simulate successful alert
    return true;
  } catch (error) {
    logger.error(`Error triggering ${alertType} alert:`, error);
    return false;
  }
}

/**
 * Generate an alert message
 * @param {Object} email - The email
 * @param {String} alertType - The type of alert
 * @returns {String} - The alert message
 */
function generateAlertMessage(email, alertType) {
  const { subject, from } = email;
  
  switch (alertType) {
    case ALERT_TYPES.URGENT:
      return `URGENT email from ${from}: "${subject}"`;
    
    case ALERT_TYPES.VIP:
      return `VIP contact ${from} sent: "${subject}"`;
    
    case ALERT_TYPES.TIME_SENSITIVE:
      return `Time-sensitive email from ${from}: "${subject}"`;
    
    case ALERT_TYPES.SECURITY:
      return `SECURITY ALERT: Potential threat in email from ${from}: "${subject}"`;
    
    default:
      return `Alert for email from ${from}: "${subject}"`;
  }
}

/**
 * Check if an email is time-sensitive
 * @param {Object} email - The email to check
 * @returns {Boolean} - Whether the email is time-sensitive
 */
function isTimeSensitive(email) {
  const content = `${email.subject} ${email.body}`.toLowerCase();
  
  // Keywords that suggest time sensitivity
  const timeSensitiveKeywords = [
    'deadline', 'due today', 'due tomorrow', 'by end of day',
    'urgent', 'asap', 'immediately', 'time-sensitive',
    'expires', 'closing soon', 'last chance', 'final notice'
  ];
  
  return timeSensitiveKeywords.some(keyword => content.includes(keyword));
}

/**
 * Check if an email is a potential security threat
 * @param {Object} email - The email to check
 * @returns {Boolean} - Whether the email is a potential threat
 */
function isPotentialSecurityThreat(email) {
  const content = `${email.subject} ${email.body}`.toLowerCase();
  
  // Check for security keywords
  const hasSuspiciousContent = securityKeywords.some(keyword => 
    content.includes(keyword)
  );
  
  // Check for suspicious links
  const hasSuspiciousLinks = (
    (email.body && email.body.includes('click here')) ||
    (email.body && email.body.match(/https?:\/\/[^\s]+/g)?.length > 3)
  );
  
  // Check for suspicious sender
  const hasSuspiciousSender = (
    !email.from.includes('@') ||
    email.from.includes('no-reply') ||
    email.from.includes('noreply') ||
    email.from.includes('notification')
  );
  
  return hasSuspiciousContent && (hasSuspiciousLinks || hasSuspiciousSender);
}