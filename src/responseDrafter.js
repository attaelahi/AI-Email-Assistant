import natural from 'natural';
import { logger } from './utils/logger.js';
import { getEmailHistory } from './dataStore.js';

// Tokenizer for text analysis
const tokenizer = new natural.WordTokenizer();

// Response templates
const TEMPLATES = {
  URGENT: [
    "I've received your urgent message and will address it immediately. I'll get back to you with a full response as soon as possible.",
    "Thank you for your urgent email. I'm looking into this matter right now and will respond shortly.",
    "I acknowledge receipt of your time-sensitive email. I'm prioritizing this and will respond very soon."
  ],
  IMPORTANT: [
    "Thank you for your important email. I'll review this thoroughly and get back to you within [timeframe].",
    "I appreciate you bringing this important matter to my attention. I'll respond with my thoughts by [timeframe].",
    "Thank you for your email. This is important to me, and I'll make sure to address all your points in my response by [timeframe]."
  ],
  MEETING_REQUEST: [
    "Thank you for the meeting invitation. I've checked my calendar and can confirm my availability for [meeting_time].",
    "I appreciate the meeting request. I'm available at the suggested time and have added it to my calendar.",
    "Thank you for organizing this meeting. I've reviewed my schedule and can attend as requested."
  ],
  INFORMATION_REQUEST: [
    "Thank you for your inquiry. I'm gathering the information you requested and will provide a complete response by [timeframe].",
    "I've received your request for information. I'll compile everything you need and send it over by [timeframe].",
    "Thank you for reaching out. I'm working on collecting the details you requested and will share them with you soon."
  ],
  FOLLOW_UP: [
    "Thank you for following up. I apologize for the delay in my response. Here's an update on the situation: [placeholder]",
    "I appreciate your follow-up. I'm still working on this matter and expect to have a resolution by [timeframe].",
    "Thank you for checking in. I haven't forgotten about this and am currently in the process of [placeholder]."
  ],
  GENERAL: [
    "Thank you for your email. I'll review your message and respond appropriately by [timeframe].",
    "I appreciate you reaching out. I'll consider your message and get back to you soon.",
    "Thank you for your email. I'll look into this and respond within [timeframe]."
  ]
};

/**
 * Draft an appropriate response based on email content and context
 * @param {Object} email - The email object to respond to
 * @returns {Object} - The drafted response
 */
export async function draftResponse(email) {
  try {
    const { from, subject, body, id } = email;
    
    // Get email history for context
    const emailHistory = await getEmailHistory(from);
    
    // Determine email type
    const emailType = determineEmailType(subject, body);
    
    // Select appropriate template
    let template = selectTemplate(emailType, emailHistory.length);
    
    // Personalize the response
    const response = personalizeResponse(template, email, emailHistory);
    
    logger.info(`Response drafted for email type: ${emailType}`);
    
    return {
      to: from,
      subject: generateResponseSubject(subject),
      body: response,
      originalEmailId: id
    };
  } catch (error) {
    logger.error('Error drafting response:', error);
    // Return a generic response if there's an error
    return {
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: "Thank you for your email. I'll review your message and get back to you soon.",
      originalEmailId: email.id
    };
  }
}

/**
 * Determine the type of email based on content analysis
 * @param {String} subject - The email subject
 * @param {String} body - The email body
 * @returns {String} - The email type
 */
function determineEmailType(subject, body) {
  const content = `${subject} ${body}`.toLowerCase();
  
  // Check for meeting requests
  if (content.includes('meeting') || 
      content.includes('calendar') || 
      content.includes('schedule') || 
      content.includes('availability')) {
    return 'MEETING_REQUEST';
  }
  
  // Check for information requests
  if (content.includes('information') || 
      content.includes('details') || 
      content.includes('question') || 
      content.includes('inquiry') ||
      content.includes('how to') ||
      content.includes('could you provide')) {
    return 'INFORMATION_REQUEST';
  }
  
  // Check for follow-ups
  if (content.includes('follow up') || 
      content.includes('following up') || 
      content.includes('checking in') || 
      content.includes('any updates') ||
      content.includes('status update')) {
    return 'FOLLOW_UP';
  }
  
  // Check for urgent matters
  if (content.includes('urgent') || 
      content.includes('asap') || 
      content.includes('immediately') ||
      content.includes('emergency')) {
    return 'URGENT';
  }
  
  // Check for important matters
  if (content.includes('important') || 
      content.includes('priority') || 
      content.includes('critical') ||
      content.includes('significant')) {
    return 'IMPORTANT';
  }
  
  // Default to general
  return 'GENERAL';
}

/**
 * Select an appropriate template based on email type and history
 * @param {String} emailType - The type of email
 * @param {Number} historyCount - The number of previous emails
 * @returns {String} - The selected template
 */
function selectTemplate(emailType, historyCount) {
  // Get templates for the email type
  const templates = TEMPLATES[emailType] || TEMPLATES.GENERAL;
  
  // Select template based on history (more formal for new contacts)
  const index = Math.min(historyCount, templates.length - 1);
  
  return templates[index];
}

/**
 * Personalize the response template
 * @param {String} template - The response template
 * @param {Object} email - The original email
 * @param {Array} history - The email history
 * @returns {String} - The personalized response
 */
function personalizeResponse(template, email, history) {
  let response = template;
  
  // Extract sender's name
  const fromParts = email.from.split('<');
  const senderName = fromParts[0].trim().split(' ')[0] || 'there';
  
  // Add greeting
  response = `Hello ${senderName},\n\n${response}`;
  
  // Replace placeholders
  response = response.replace('[timeframe]', determineTimeframe(email));
  response = response.replace('[meeting_time]', extractMeetingTime(email.body) || 'the proposed time');
  response = response.replace('[placeholder]', 'addressing your request');
  
  // Add signature
  response += '\n\nBest regards,\n[Your Name]';
  
  return response;
}

/**
 * Generate a response subject
 * @param {String} originalSubject - The original email subject
 * @returns {String} - The response subject
 */
function generateResponseSubject(originalSubject) {
  // Check if the subject already has Re: prefix
  if (originalSubject.toLowerCase().startsWith('re:')) {
    return originalSubject;
  }
  
  return `Re: ${originalSubject}`;
}

/**
 * Determine an appropriate timeframe for response
 * @param {Object} email - The email object
 * @returns {String} - The suggested timeframe
 */
function determineTimeframe(email) {
  // Check for urgency indicators
  const content = `${email.subject} ${email.body}`.toLowerCase();
  
  if (content.includes('urgent') || 
      content.includes('asap') || 
      content.includes('immediately') ||
      content.includes('today')) {
    return 'the end of today';
  }
  
  if (content.includes('tomorrow') ||
      content.includes('next day')) {
    return 'tomorrow';
  }
  
  // Default timeframe
  return '24-48 hours';
}

/**
 * Extract meeting time from email body
 * @param {String} body - The email body
 * @returns {String|null} - The extracted meeting time or null
 */
function extractMeetingTime(body) {
  // Simple regex to find dates and times
  // This is a basic implementation - a real system would use more sophisticated NLP
  const dateTimeRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{4},? (?:at )?\d{1,2}(?::\d{2})? ?(?:am|pm|AM|PM)\b/g;
  const matches = body.match(dateTimeRegex);
  
  if (matches && matches.length > 0) {
    return matches[0];
  }
  
  return null;
}