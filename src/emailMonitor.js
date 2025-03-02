import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { categorizeEmail } from './emailCategorizer.js';
import { draftResponse } from './responseDrafter.js';
import { organizeEmail } from './emailOrganizer.js';
import { checkForAlerts } from './alertManager.js';
import { logger } from './utils/logger.js';
import { storeEmail } from './dataStore.js';

// Email monitoring setup
export function setupEmailMonitor() {
  try {
    const imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    function openInbox(cb) {
      imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', () => {
      openInbox((err, box) => {
        if (err) {
          logger.error('Error opening inbox:', err);
          return;
        }
        
        logger.info('Connected to email inbox');
        
        // Listen for new emails
        imap.on('mail', (numNewMsgs) => {
          logger.info(`${numNewMsgs} new message(s) received`);
          fetchNewEmails();
        });
        
        // Initial fetch of unread emails
        fetchNewEmails();
      });
    });

    imap.once('error', (err) => {
      logger.error('IMAP connection error:', err);
    });

    imap.once('end', () => {
      logger.info('IMAP connection ended');
    });

    function fetchNewEmails() {
      openInbox((err, box) => {
        if (err) {
          logger.error('Error opening inbox for fetching:', err);
          return;
        }
        
        // Search for unread emails
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            logger.error('Error searching for unread emails:', err);
            return;
          }
          
          if (!results || !results.length) {
            logger.info('No new emails to process');
            return;
          }
          
          logger.info(`Found ${results.length} unread email(s)`);
          
          const fetch = imap.fetch(results, { bodies: '', markSeen: true });
          
          fetch.on('message', (msg, seqno) => {
            logger.info(`Processing message #${seqno}`);
            
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  logger.error(`Error parsing message #${seqno}:`, err);
                  return;
                }
                
                try {
                  // Process the email
                  const email = {
                    id: parsed.messageId,
                    subject: parsed.subject,
                    from: parsed.from.text,
                    to: parsed.to.text,
                    date: parsed.date,
                    body: parsed.text || parsed.html,
                    attachments: parsed.attachments
                  };
                  
                  // Store the email
                  await storeEmail(email);
                  
                  // Categorize the email
                  const category = await categorizeEmail(email);
                  logger.info(`Email categorized as: ${category}`);
                  
                  // Draft a response if needed
                  const responseNeeded = ['Urgent', 'Important'].includes(category);
                  if (responseNeeded) {
                    const draftedResponse = await draftResponse(email);
                    logger.info('Response drafted for email');
                  }
                  
                  // Organize the email
                  await organizeEmail(email, category);
                  
                  // Check if alerts are needed
                  const alertNeeded = await checkForAlerts(email, category);
                  if (alertNeeded) {
                    logger.info('Alert triggered for email');
                    // In a real application, this would send a notification
                  }
                } catch (error) {
                  logger.error(`Error processing email #${seqno}:`, error);
                }
              });
            });
          });
          
          fetch.once('error', (err) => {
            logger.error('Error fetching emails:', err);
          });
          
          fetch.once('end', () => {
            logger.info('Done fetching emails');
          });
        });
      });
    }

    // Connect to the email server
    logger.info('Attempting to connect to email server...');
    imap.connect();
    
    // Return control object
    return {
      stop: () => {
        logger.info('Stopping email monitor');
        imap.end();
      },
      fetchNow: () => {
        logger.info('Manually triggering email fetch');
        fetchNewEmails();
      }
    };
  } catch (error) {
    logger.error('Error setting up email monitor:', error);
    // Return a dummy control object
    return {
      stop: () => logger.info('Stopping dummy email monitor'),
      fetchNow: () => logger.info('Dummy fetch triggered')
    };
  }
}