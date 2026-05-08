# FinanceTrack [Live Demo](https://finance-track-phi.vercel.app/)

FinanceTrack is a full-stack personal financial portfolio management application that helps users monitor their financial activities in one place. The app allows users to securely connect bank accounts, track transactions, manage budgets, and analyze spending behavior through an intuitive dashboard. The data is sourced from the Plaid Sandbox API as well as self-seeded sample data.

---

## Features

### Authentication & Security
- User authentication system with jwt and Google OAuth 2.0
- Secure session handling and token exchange
- Environment-based secret management

### Multi-Account Support
- Connect multiple bank accounts using Plaid API integration
- Import sandbox financial data and view aggregated financial data
  
### Dashboard & Analytics
- Financial overview dashboard
- Spending analysis and budgeting insights and portfolio breakdown
- Interactive charts and summaries
  
### Portfolio Management
- Categorize income and expenses
- View transaction history by account and track account balances
- Create and track saving goals plan
- Track holdings investment
---

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database  
- MongoDB Atlas
- Mongoose

### APIs & Services
- Plaid API
- OAuth 2.0

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## Architecture

```text
Frontend (React + JavaScript)
        ↓
REST API (Express.js)
        ↓
Business Logic & Services
        ↓
MongoDB Atlas Database
        ↓
Plaid API Integration
```

Refer to [Plaid Integration Flow](./PlaidIntegrationFlow.mermaid) to understand the Plaid connection flow, token exchange process, and sandbox data retrieval.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/chill3215/FinanceTrack.git
cd FinanceTrack
```

### Backend Setup

```bash
cd Backend
npm install
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

## Environment setup

- Sign up for a Plaid API key [here](https://plaid.com/en-eu/).

- Create a Google OAuth 2.0 Web Client for your application [here](https://console.cloud.google.com/).

- Setup the database on MongoDb Atlas

- Create a `.env` file in the backend directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
PLAID_TEMP_PUBLIC_TOKEN=your_plaid_token
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_CALLBACK=callback_page_url
FRONTEND_URL=http://localhost:5173
```
Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```
⚠️ Notice:
Different frontend and backend URLs/ports can be used in your environment configuration. However, make sure to adjust the backend CORS settings to match the correct frontend origin to avoid cross-origin request issues.

---

## Future Improvements

- AI-powered expense analysis
- Automatic update mechanism for transactions and balances 
- Real-time notifications
- Export reports (PDF/Excel)

---

## License

This project is for educational and portfolio purposes.
