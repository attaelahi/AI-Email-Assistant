import express from 'express';
import dotenv from 'dotenv';
import { CronJob } from 'cron';
import { setupEmailMonitor } from './src/emailMonitor.js';
import { generateDailySummary, formatSummaryText } from './src/summaryGenerator.js';
import { logger } from './src/utils/logger.js';
import { addDemoEmails } from './src/demoData.js';
import { getActionItems, getUpcomingDeadlines, getEmails } from './src/dataStore.js';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEMO_MODE = process.env.DEMO_MODE || 'true';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
  try {
    const emails = await getEmails();
    const actionItems = await getActionItems();
    const deadlines = await getUpcomingDeadlines();
    const summary = await generateDailySummary();
    
    res.render('dashboard', {
      title: 'AI Email Assistant',
      emails,
      actionItems,
      deadlines,
      summary,
      demoMode: DEMO_MODE === 'true'
    });
  } catch (error) {
    logger.error('Error rendering dashboard:', error);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/emails', async (req, res) => {
  try {
    const emails = await getEmails();
    res.render('emails', {
      title: 'Emails | AI Email Assistant',
      emails,
      demoMode: DEMO_MODE === 'true'
    });
  } catch (error) {
    logger.error('Error rendering emails page:', error);
    res.status(500).send('Error loading emails');
  }
});

app.get('/action-items', async (req, res) => {
  try {
    const actionItems = await getActionItems();
    res.render('action-items', {
      title: 'Action Items | AI Email Assistant',
      actionItems,
      demoMode: DEMO_MODE === 'true'
    });
  } catch (error) {
    logger.error('Error rendering action items page:', error);
    res.status(500).send('Error loading action items');
  }
});

app.get('/deadlines', async (req, res) => {
  try {
    const deadlines = await getUpcomingDeadlines();
    res.render('deadlines', {
      title: 'Deadlines | AI Email Assistant',
      deadlines,
      demoMode: DEMO_MODE === 'true'
    });
  } catch (error) {
    logger.error('Error rendering deadlines page:', error);
    res.status(500).send('Error loading deadlines');
  }
});

app.get('/summary', async (req, res) => {
  try {
    const summary = await generateDailySummary();
    const formattedSummary = formatSummaryText(summary);
    
    // Check if the request wants JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json(summary);
    } else {
      res.render('summary', {
        title: 'Daily Summary | AI Email Assistant',
        summary,
        formattedSummary,
        demoMode: DEMO_MODE === 'true'
      });
    }
  } catch (error) {
    logger.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// API endpoints
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getEmails();
    res.json(emails);
  } catch (error) {
    logger.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

app.get('/api/action-items', async (req, res) => {
  try {
    const actionItems = await getActionItems();
    res.json(actionItems);
  } catch (error) {
    logger.error('Error fetching action items:', error);
    res.status(500).json({ error: 'Failed to fetch action items' });
  }
});

app.get('/api/deadlines', async (req, res) => {
  try {
    const deadlines = await getUpcomingDeadlines();
    res.json(deadlines);
  } catch (error) {
    logger.error('Error fetching deadlines:', error);
    res.status(500).json({ error: 'Failed to fetch deadlines' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const summary = await generateDailySummary();
    res.json(summary);
  } catch (error) {
    logger.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Initialize email monitoring or demo data
let emailMonitor;
if (DEMO_MODE === 'true') {
  logger.info('Starting in DEMO MODE - no actual email connection will be made');
  // Add demo data instead of connecting to email
  addDemoEmails();
} else {
  emailMonitor = setupEmailMonitor();
}

// Schedule daily summary generation (every day at 8 AM)
const summaryJob = new CronJob('0 8 * * *', async () => {
  try {
    logger.info('Generating daily email summary...');
    const summary = await generateDailySummary();
    logger.info('Daily summary generated successfully', { summary });
  } catch (error) {
    logger.error('Error in daily summary job:', error);
  }
}, null, true);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(DEMO_MODE === 'true' ? 'Demo data loaded' : 'Email monitoring service started');
  logger.info('Daily summary job scheduled');
  logger.info(`Visit http://localhost:${PORT} to view the dashboard`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (emailMonitor) emailMonitor.stop();
  summaryJob.stop();
  process.exit(0);
});

export default app;