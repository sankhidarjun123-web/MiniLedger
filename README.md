# MiniLedger

MiniLedger is a personal loan and repayment tracking application built with React Native, Node.js, Express.js, and PostgreSQL.

It allows users to maintain a record of money lent to friends, track repayments, monitor outstanding balances, and manage loan receipts and repayment proofs.

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation
- Axios
- Expo SecureStore

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JSON Web Token (JWT)
- Multer

## Project Structure

```text
MiniLedger/
│
├── MoneyTracker/             # React Native frontend
│   ├── App.tsx
│   ├── package.json
│   ├── .env
│   └── ...
│
├── backend/                  # Node.js backend
│   ├── src/
│   ├── sql.table.sql         # Database table creation queries
│   ├── package.json
│   └── .env
│
└── README.md
```

## Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- PostgreSQL database (local PostgreSQL or [Neon](https://neon.tech/))
- [Expo Go](https://expo.dev/go) on your Android/iOS device, or an emulator/simulator
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <REPOSITORY_NAME>
```

### 2. Database Setup

MiniLedger uses PostgreSQL as its database.

You can use a local PostgreSQL instance or a Neon PostgreSQL database.

1. Create a PostgreSQL database.
2. Open the PostgreSQL SQL Editor (Neon users can use the Neon SQL Editor).
3. Navigate to `backend/sql.table.sql` in the cloned repository.
4. Copy the SQL queries from that file.
5. Execute the queries in your database to create the required tables.

Make sure all the database tables are created successfully before starting the backend.

### 3. Backend Environment Variables

Navigate to the `backend` folder and create a `.env` file:

```env
CONNECTION_STRING=your_postgresql_connection_string
JWT_SECRET=your_generated_jwt_secret
```

**Database Connection String**

Replace `your_postgresql_connection_string` with your PostgreSQL connection string.

**JWT Secret**

Generate a secure JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated value and use it as your `JWT_SECRET`.

Keep your `.env` file private. Never commit database credentials or JWT secrets to GitHub.

### 4. Install and Run the Backend

Open a terminal in the project root and execute:

```bash
cd backend
npm install
npm run build
npm start
```

The backend will start using the configured server settings.

Keep this terminal running while using the application.

### 5. Frontend Environment Variables

Navigate to the `MoneyTracker` folder and create a `.env` file:

```env
EXPO_PUBLIC_SERVER_URL=http://YOUR_LOCAL_IP:5000/api
```

Replace `YOUR_LOCAL_IP` with the IP address of the computer running the backend.

For example:

```env
EXPO_PUBLIC_SERVER_URL=http://192.168.1.8:5000/api
```

**Important:**
- For a physical Android/iOS device, use your computer's local IPv4 address.
- For an Android emulator, use `http://10.0.2.2:5000/api` if the backend runs on your computer.
- For an iOS simulator, you can generally use `http://localhost:5000/api`.
- Make sure your device and computer are connected to the same Wi-Fi network when using a local backend.

### 6. Install and Run the React Native Application

Open another terminal in the project root:

```bash
cd MoneyTracker
npm install
npx expo start
```

After Expo starts:

- Press `a` to open the app on an Android emulator.
- Press `i` to open the app on an iOS simulator (macOS required).
- Scan the QR code using Expo Go to run the application on a compatible physical device.

If you encounter caching issues, restart Expo using:

```bash
npx expo start --clear
```

## Running the Complete Project

You need two terminals to run MiniLedger.

**Terminal 1 – Backend**

```bash
cd backend
npm install
npm run build
npm start
```

**Terminal 2 – Frontend**

```bash
cd MoneyTracker
npm install
npx expo start
```

Make sure the PostgreSQL database is configured and both environment files are correctly set up before running the application.

## Authentication

MiniLedger uses JWT-based authentication.

- Users authenticate through the application's OTP-based login flow.
- The backend verifies authentication requests.
- A JWT is generated after successful verification.
- The frontend securely stores the authentication token using Expo SecureStore.
- Authenticated API requests include the JWT in the Authorization header.

## Database

MiniLedger uses PostgreSQL to store:

- User information
- Loan records
- Repayment records
- Loan receipt images
- Repayment images

Images are stored in PostgreSQL using binary data (`BYTEA`).

## Notes

- The backend and frontend have separate `package.json` files and dependencies.
- Both `.env` files must be configured independently.
- Run the database SQL queries before launching the application.
- Do not commit `.env` files or expose your database credentials and JWT secret.
