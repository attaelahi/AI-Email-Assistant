# AI Email Management Assistant

An intelligent assistant that helps manage your email workflow by monitoring, categorizing, responding to, and organizing emails.

## Features

- **Email Monitoring**: Automatically checks for new emails and processes them
- **Priority Categorization**: Sorts emails into Urgent, Important, Regular, and Low Priority categories
- **Response Drafting**: Creates appropriate responses for common email types
- **Email Organization**: Manages folders and filing based on predefined rules
- **Follow-up Management**: Flags emails requiring follow-up with suggested deadlines
- **Daily Summaries**: Provides overview of email activity, action items, and deadlines
- **Alert System**: Notifies about urgent, VIP, time-sensitive, or security-related emails

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your email credentials
4. Start the application:
   ```
   npm start
   ```

## Demo Mode

By default, the application runs in demo mode, which doesn't require actual email credentials. This mode populates the system with sample emails, action items, and deadlines for demonstration purposes.

To disable demo mode and connect to a real email account:
1. Set `DEMO_MODE=false` in your `.env` file
2. Provide valid email credentials in the `.env` file

## Configuration

Edit the `.env` file to configure:

- Email account credentials
- SMTP settings for sending emails
- VIP contacts
- Application settings
- Demo mode toggle

## Usage

Once running, the assistant will:

1. Connect to your email account (or load demo data)
2. Monitor for new messages
3. Process emails according to configured rules
4. Generate daily summaries
5. Alert you about important messages

Access the web interface at `http://localhost:3000` to view summaries and manage settings.

## API Endpoints

- `GET /`: Application status
- `GET /summary`: Get the latest email summary

## Security

This application requires access to your email account when not in demo mode. For security:

- Store credentials securely in the `.env` file (not in version control)
- Use app-specific passwords when available
- Consider using OAuth2 authentication for production use

## License

MIT