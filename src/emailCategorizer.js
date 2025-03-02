import natural from 'natural';
import { logger } from './utils/logger.js';

// TF-IDF for keyword analysis
const TfIdf = natural.TfIdf;

// Priority categories
const CATEGORIES = {
  URGENT: 'Urgent',
  IMPORTANT: 'Important',
  REGULAR: 'Regular',
  LOW: 'Low Priority'
};

// Keywords that indicate urgency
const urgentKeywords = [
  'urgent', 'immediately', 'asap', 'emergency', 'critical',
  'deadline', 'today', 'now', 'priority', 'important',
  'action required', 'time-sensitive', 'urgent matter'
];

// Keywords that indicate importance
const importantKeywords = [
  'important', 'significant', 'key', 'essential', 'vital',
  'required', 'necessary', 'attention', 'review', 'consider',
  'please respond', 'feedback needed', 'action item'
];

// Keywords that might indicate low priority
const lowPriorityKeywords = [
  'fyi', 'for your information', 'newsletter', 'update', 'bulletin',
  'announcement', 'no action required', 'no response needed', 'no rush',
  'when you have time', 'at your convenience', 'promotional'
];

// VIP contacts from environment
const getVipContacts = () => {
  const vipString = process.env.VIP_CONTACTS || '';
  return vipString.split(',').map(email => email.trim().toLowerCase());
};

/**
 * Categorize an email based on sender, subject, and content
 * @param {Object} email - The email object to categorize
 * @returns {String} - The priority category
 */
export async function categorizeEmail(email) {
  try {
    const { from, subject, body } = email;
    
    // Check if sender is a VIP
    const vipContacts = getVipContacts();
    const fromAddress = from.toLowerCase();
    const isVipSender = vipContacts.some(vip => fromAddress.includes(vip));
    
    if (isVipSender) {
      logger.info(`Email from VIP contact: ${from}`);
      return CATEGORIES.URGENT;
    }
    
    // Combine subject and body for analysis
    const content = `${subject} ${body}`.toLowerCase();
    
    // Check for urgent keywords in subject
    const subjectLower = subject.toLowerCase();
    const hasUrgentSubject = urgentKeywords.some(keyword => 
      subjectLower.includes(keyword)
    );
    
    if (hasUrgentSubject) {
      return CATEGORIES.URGENT;
    }
    
    // Use TF-IDF to analyze the content
    const tfidf = new TfIdf();
    tfidf.addDocument(content);
    
    // Calculate scores for each category
    let urgentScore = 0;
    let importantScore = 0;
    let lowPriorityScore = 0;
    
    // Check for urgent keywords
    urgentKeywords.forEach(keyword => {
      urgentScore += getKeywordScore(tfidf, keyword, content);
    });
    
    // Check for important keywords
    importantKeywords.forEach(keyword => {
      importantScore += getKeywordScore(tfidf, keyword, content);
    });
    
    // Check for low priority keywords
    lowPriorityKeywords.forEach(keyword => {
      lowPriorityScore += getKeywordScore(tfidf, keyword, content);
    });
    
    // Determine category based on scores
    if (urgentScore > 1.5) {
      return CATEGORIES.URGENT;
    } else if (importantScore > 1.2) {
      return CATEGORIES.IMPORTANT;
    } else if (lowPriorityScore > 0.8) {
      return CATEGORIES.LOW;
    } else {
      return CATEGORIES.REGULAR;
    }
  } catch (error) {
    logger.error('Error categorizing email:', error);
    // Default to Regular if there's an error
    return CATEGORIES.REGULAR;
  }
}

/**
 * Calculate a score for a keyword in the content
 * @param {TfIdf} tfidf - The TF-IDF object
 * @param {String} keyword - The keyword to check
 * @param {String} content - The content to analyze
 * @returns {Number} - The score for the keyword
 */
function getKeywordScore(tfidf, keyword, content) {
  // Base score if the keyword exists
  const baseScore = content.includes(keyword) ? 1 : 0;
  
  // Add TF-IDF measure
  let tfidfScore = 0;
  tfidf.tfidfs(keyword, function(i, measure) {
    tfidfScore = measure;
  });
  
  // Adjust score based on position (keywords in the beginning are more important)
  const position = content.indexOf(keyword);
  const positionFactor = position > -1 ? Math.max(0, 1 - (position / content.length)) : 0;
  
  return baseScore + (tfidfScore * 0.5) + (positionFactor * 0.5);
}