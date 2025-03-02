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

## Contribution

Feel free to use

## Screenshots

<img width="959" alt="1" src="https://github.com/user-attachments/assets/32bd9bd4-1ebf-4a0c-9f77-30851db72734" />

<img width="959" alt="2" src="https://github.com/user-attachments/assets/a05149c5-f3f8-477e-b5ae-38551ceff43e" />

<img width="959" alt="3" src="https://github.com/user-attachments/assets/af4338b8-fe94-4f31-b779-46525f39fe58" />

<img width="959" alt="4" src="https://github.com/user-attachments/assets/52541d79-3e94-43f2-8521-08cf3c00af6e" />

<img width="959" alt="5" src="https://github.com/user-attachments/assets/3139d0e4-90e2-4ae5-9122-a4c9c47ef539" />

<img width="959" alt="6" src="https://github.com/user-attachments/assets/d6ada2e0-6c76-437e-8cf3-79f2d95de6fd" />
