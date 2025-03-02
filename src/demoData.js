import { logger } from './utils/logger.js';
import { storeEmail } from './dataStore.js';
import { categorizeEmail } from './emailCategorizer.js';
import { draftResponse } from './responseDrafter.js';
import { organizeEmail } from './emailOrganizer.js';
import { checkForAlerts } from './alertManager.js';
import { storeActionItem, storeDeadline } from './dataStore.js';

// Sample demo emails
const demoEmails = [
  {
    id: 'demo-1',
    subject: 'URGENT: Project deadline moved up',
    from: 'boss@company.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 3600000), // 1 hour ago
    body: 'We need to deliver the project by tomorrow. Please update me on your progress ASAP.',
    category: 'Urgent'
  },
  {
    id: 'demo-2',
    subject: 'Meeting invitation: Quarterly review',
    from: 'manager@company.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 7200000), // 2 hours ago
    body: 'I would like to schedule a quarterly review meeting on March 15th at 2:00 PM. Please confirm your availability.',
    category: 'Important'
  },
  {
    id: 'demo-3',
    subject: 'Important client feedback',
    from: 'client@important.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 10800000), // 3 hours ago
    body: 'We reviewed the latest deliverables and have some important feedback to share. Could we schedule a call tomorrow?',
    category: 'Important'
  },
  {
    id: 'demo-4',
    subject: 'Weekly newsletter',
    from: 'news@industry.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 14400000), // 4 hours ago
    body: 'Here are this week\'s top industry news and updates. No action required.',
    category: 'Low Priority'
  },
  {
    id: 'demo-5',
    subject: 'Follow up on previous discussion',
    from: 'colleague@company.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 18000000), // 5 hours ago
    body: 'I wanted to follow up on our conversation from last week. Have you had a chance to look into those issues we discussed?',
    category: 'Regular'
  },
  {
    id: 'demo-6',
    subject: 'Your account security alert',
    from: 'security@service.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 21600000), // 6 hours ago
    body: 'We detected a suspicious login attempt to your account. Please verify your account security by clicking here.',
    category: 'Urgent'
  },
  {
    id: 'demo-7',
    subject: 'Question about the API documentation',
    from: 'developer@partner.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 25200000), // 7 hours ago
    body: 'I\'m trying to integrate with your API but I\'m having trouble understanding the authentication flow. Could you provide some clarification?',
    category: 'Regular'
  },
  {
    id: 'demo-8',
    subject: 'Team lunch next Friday',
    from: 'hr@company.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 28800000), // 8 hours ago
    body: 'We\'re organizing a team lunch next Friday at 12:30 PM. Please let me know if you can join us.',
    category: 'Regular'
  },
  {
    id: 'demo-9',
    subject: 'New product launch timeline',
    from: 'product@company.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 32400000), // 9 hours ago
    body: 'Here\'s the updated timeline for our new product launch. Please review and provide your feedback by tomorrow.',
    category: 'Important'
  },
  {
    id: 'demo-10',
    subject: 'Office supplies order confirmation',
    from: 'supplies@vendor.com',
    to: 'you@example.com',
    date: new Date(Date.now() - 36000000), // 10 hours ago
    body: 'This is a confirmation of your recent office supplies order. Your order will be delivered within 3-5 business days.',
    category: 'Low Priority'
  }
];

// Sample action items
const demoActionItems = [
  {
    subject: 'Prepare project status report',
    from: 'you@example.com',
    deadline: new Date(Date.now() + 86400000) // tomorrow
  },
  {
    subject: 'Review client proposal',
    from: 'you@example.com',
    deadline: new Date(Date.now() + 172800000) // day after tomorrow
  },
  {
    subject: 'Schedule team meeting',
    from: 'you@example.com',
    deadline: new Date(Date.now() + 259200000) // 3 days from now
  },
  {
    subject: 'Respond to API documentation question',
    from: 'you@example.com',
    deadline: new Date(Date.now() + 86400000) // tomorrow
  },
  {
    subject: 'Update project timeline',
    from: 'you@example.com',
    deadline: new Date(Date.now() + 345600000) // 4 days from now
  }
];

// Sample deadlines
const demoDeadlines = [
  {
    subject: 'Project Alpha delivery',
    date: new Date(Date.now() + 432000000), // 5 days from now
    description: 'Final deliverables due to client'
  },
  {
    subject: 'Quarterly report submission',
    date: new Date(Date.now() + 604800000), // 7 days from now
    description: 'Submit Q1 performance report'
  },
  {
    subject: 'Budget planning meeting',
    date: new Date(Date.now() + 1209600000), // 14 days from now
    description: 'Prepare next quarter budget proposal'
  },
  {
    subject: 'Team lunch',
    date: new Date(Date.now() + 518400000), // 6 days from now
    description: 'Team lunch at Italian restaurant'
  },
  {
    subject: 'Client presentation',
    date: new Date(Date.now() + 345600000), // 4 days from now
    description: 'Present new feature proposals to client'
  }
];

/**
 * Add demo emails to the system
 */
export async function addDemoEmails() {
  try {
    logger.info('Adding demo emails to the system');
    
    // Process each demo email
    for (const email of demoEmails) {
      // Store the email
      await storeEmail(email);
      
      // Categorize the email
      const category = email.category || await categorizeEmail(email);
      logger.info(`Demo email categorized as: ${category}`);
      
      // Draft a response if needed
      const responseNeeded = ['Urgent', 'Important'].includes(category);
      if (responseNeeded) {
        const draftedResponse = await draftResponse(email);
        logger.info('Response drafted for demo email');
      }
      
      // Organize the email
      await organizeEmail(email, category);
      
      // Check if alerts are needed
      const alertNeeded = await checkForAlerts(email, category);
      if (alertNeeded) {
        logger.info('Alert triggered for demo email');
      }
    }
    
    // Add demo action items
    for (const actionItem of demoActionItems) {
      await storeActionItem(actionItem);
    }
    
    // Add demo deadlines
    for (const deadline of demoDeadlines) {
      await storeDeadline(deadline);
    }
    
    logger.info('Demo data loaded successfully');
    return true;
  } catch (error) {
    logger.error('Error adding demo emails:', error);
    return false;
  }
}