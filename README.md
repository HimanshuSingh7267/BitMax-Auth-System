# BitMax Auth System 🔐

A secure authentication system built with the MERN stack, providing user registration, email OTP verification, password-based login, OTP-based login, and password recovery.

## 🚀 Features

* **User Registration** — Register with name, email, and Indian mobile number.
* **Email OTP Verification** — Verify email address using a six-digit OTP.
* **Secure Password Management** — Hash passwords before storing them.
* **Password-Based Login** — Authenticate users using email and password.
* **OTP-Based Login** — Request an OTP through email or phone.
* **OTP Expiration** — OTPs expire after five minutes.
* **OTP Attempt Limiting** — Limit invalid OTP verification attempts.
* **OTP Resend Cooldown** — Apply a cooldown between OTP requests.
* **Forgot and Reset Password** — Reset passwords using OTP verification.
* **JWT Authentication** — Generate access and refresh tokens.
* **Refresh Token Management** — Validate and rotate refresh tokens.
* **Login Security** — Track failed login attempts and temporarily lock accounts.
* **Logout** — Invalidate the stored refresh token.
* **Security Middleware** — Use Helmet, CORS, and rate limiting.

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5 and CSS3
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* Nodemailer
* Validator
* Helmet
* express-rate-limit

## 📁 Project Structure

```text
Auth-system/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── database/
│   │   │   └── models/
│   │   │       └── User.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.service.js
│   │   │   └── otp/
│   │   │       └── otp.service.js
│   │   ├── utils/
│   │   │   ├── email.js
│   │   │   ├── otp.js
│   │   │   ├── password.js
│   │   │   ├── sms.js
│   │   │   └── jwt.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

*Note: Adjust the folder tree to match the actual files in your repository.*

## ⚙️ Getting Started

### Prerequisites

Install the following:

* Node.js and npm
* MongoDB or a MongoDB Atlas database
* Git
* A Gmail account with an App Password, if using Gmail for OTP delivery

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Auth-system
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder.

Example configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Use the exact environment variable names expected by your source code. Add any additional variables required by your project.

**Important:** Never commit `.env` or expose database credentials, email passwords, or JWT secrets publicly.

### 3. Start the Backend

```bash
npm run dev
```

If your project does not have a development script, check `backend/package.json` and use the configured start command.

### 4. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite in your terminal, usually:

```text
http://localhost:5173
```

### 5. Configure Frontend API URL

Configure the frontend to use the backend API URL. For example, if your backend runs locally on port 5000:

```env
VITE_API_URL=http://localhost:5000
```

Use the variable name expected by your frontend code. Ensure the backend allows requests from the frontend origin.

## 🔌 API Endpoints

The following endpoints represent the authentication features implemented or planned in this project. Confirm the route names against `backend/src/modules/auth/auth.routes.js`.

| Method | Endpoint                     | Purpose                                   |
| ------ | ---------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`         | Register a user and send registration OTP |
| POST   | `/api/auth/verify-otp`       | Verify registration OTP                   |
| POST   | `/api/auth/set-password`     | Set the user's password                   |
| POST   | `/api/auth/login-password`   | Log in using email and password           |
| POST   | `/api/auth/login-otp`        | Request an OTP for login                  |
| POST   | `/api/auth/verify-login-otp` | Verify login OTP                          |
| POST   | `/api/auth/resend-otp`       | Resend OTP                                |
| POST   | `/api/auth/forgot-password`  | Request password-reset OTP                |
| POST   | `/api/auth/reset-password`   | Reset password using OTP                  |
| POST   | `/api/auth/refresh-token`    | Refresh authentication tokens             |
| POST   | `/api/auth/logout`           | Log out and invalidate the refresh token  |

## 🔐 OTP Workflow

1. The user submits the registration form.
2. The backend validates the submitted details.
3. A six-digit OTP is generated.
4. The OTP is hashed before being stored in MongoDB.
5. The OTP is sent through the configured delivery service.
6. The user submits the OTP for verification.
7. The backend validates the OTP, purpose, expiry, and attempt limit.
8. The account is marked as verified after successful verification.
9. The user can set a password and log in.

**OTP validity:** 5 minutes
**Maximum verification attempts:** 5
**Resend cooldown:** 60 seconds

## 🛡️ Security

* Password hashing before database storage.
* Hashed OTP storage instead of storing plain-text OTPs.
* JWT-based authentication.
* OTP expiry and verification attempt limits.
* Temporary account lockout after repeated failed password attempts.
* Environment variables for sensitive configuration.
* HTTP security headers and API rate limiting.

Security settings should be reviewed and tested before production deployment.

## 🌐 Deployment

The frontend and backend can be deployed separately.

* **Frontend:** Vercel or another static hosting provider.
* **Backend:** A Node.js-compatible hosting provider.
* **Database:** MongoDB Atlas or another accessible MongoDB instance.

For deployment, configure production environment variables, the frontend API base URL, CORS origins, and email-provider settings.

## 🧪 Testing

Test the following workflows before release:

* Registration with valid and invalid inputs.
* Duplicate email and phone validation.
* Successful and expired OTP verification.
* Invalid OTP and maximum-attempt handling.
* Password creation and login.
* OTP-based login.
* Password reset.
* Refresh token and logout behavior.
* Email delivery failures and OTP resend cooldown.

## 🔮 Future Improvements

* Automated unit and integration tests.
* API documentation using Swagger.
* Improved email delivery monitoring.
* Phone OTP integration with an SMS provider.
* Stronger refresh-token session management.
* CI/CD pipeline and production monitoring.

## 👨‍💻 Author

**Himanshu Singh**

GitHub: [Your GitHub Profile](https://github.com/)

## 📄 License

Add a license file if you intend to distribute this project under an open-source license.



Live URL   =   https://bit-max-auth-system-g37r.vercel.app/
 
