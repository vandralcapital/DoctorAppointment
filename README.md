# Parchi - Doctor Appointment Booking System

A modern, full-stack doctor appointment booking system built with React, Node.js, Express, and MongoDB.

## Features

### For Patients
- 🔐 User registration and login
- 🔍 Browse and search doctors by specialization
- 📅 Book appointments with available time slots
- 🔢 Receive OTP for appointment verification
- 📋 View and manage appointments with treatment states
- 💊 View prescriptions and doctor notes
- ⭐ Rate appointments with 10-star system
- 👤 User profile management
- 🎨 Modern, responsive UI

### For Doctors
- 👨‍⚕️ Doctor registration and login
- 📊 Dashboard with appointment management
- 🔢 OTP verification for patient arrivals
- 🏥 Treatment state management (pending → verified → treated)
- 💊 Prescription management (text and file uploads)
- 📝 Doctor notes and patient records
- 👥 Patient list and profiles
- 💰 Payment and transaction tracking
- 📈 Analytics and reports
- ⚙️ Profile and settings management
- 📝 **Profile Draft → Preview → Publish workflow**
- 👀 **Professional profile management with rich content**
- 🌐 **Public profile visibility control**

### Technical Features
- 🔒 JWT-based authentication
- 🛡️ Password hashing with bcrypt
- 📧 Email verification system
- 🔐 Password reset via email
- 🚫 Account lockout protection
- ⏱️ Rate limiting on sensitive endpoints
- 🧹 Input validation and sanitization
- 📱 Responsive design with Tailwind CSS
- 🔄 Protected routes
- 💾 Persistent login state
- 🖼️ Avatar upload and management
- 🔔 Real-time notifications (Socket.io ready)
- 💳 Payment integration (Razorpay ready)
- 🔢 OTP-based appointment verification system
- 🏥 Treatment state workflow management
- ⭐ Patient review and rating system
- 💊 Prescription management system

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Multer** - File upload handling
- **Socket.io** - Real-time communication
- **Razorpay** - Payment processing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Tailwind CSS** - Styling
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Day.js** - Date manipulation

## Project Structure

```
Parchi/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── doctor.js
│   ├── uploads/
│   │   └── avatars/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── doctor-dashboard/
│   │   │   ├── Avatar.js
│   │   │   ├── Error404.js
│   │   │   ├── Error500.js
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/parchi
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
PORT=5050
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5050`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5050
REACT_APP_UPLOAD_URL=http://localhost:5050
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Doctor Profile Management System

The system implements a comprehensive **Draft → Preview → Publish** workflow for doctor profiles:

### Profile Workflow
1. **Draft Creation**: Doctors create and edit their professional profiles
2. **Preview Mode**: Doctors can preview how their profile will appear to patients
3. **Publication**: Doctors publish their profile to make it visible to patients
4. **Public View**: Patients can view published profiles and book appointments

### Profile Features
- **Rich Content**: Education, certifications, experience, achievements, publications
- **Professional Details**: Consultation fees, duration, languages, specialties
- **Social Links**: LinkedIn, Twitter, personal website
- **Contact Information**: Phone, location, map links
- **Avatar Management**: Professional photo upload and display
- **Publication Control**: Complete control over profile visibility

### Profile States
- **Draft**: Private editing mode, not visible to patients
- **Published**: Publicly visible to patients for booking
- **Unpublished**: Profile exists but not visible to patients

## OTP-Based Appointment System

The system implements a comprehensive OTP-based appointment verification workflow:

### Patient Booking Flow
1. **Appointment Booking**: Patient books appointment and receives a 6-digit OTP
2. **OTP Display**: OTP is prominently displayed after booking for easy access
3. **Arrival Verification**: Patient shows OTP to doctor upon arrival
4. **Treatment Process**: Doctor verifies OTP and manages treatment states
5. **Review System**: Patient can rate experience after treatment (1-10 stars)

### Doctor Workflow
1. **OTP Verification**: Doctor enters patient's OTP to verify arrival
2. **Treatment States**: 
   - `pending`: Appointment booked, patient not arrived
   - `verified`: OTP verified, patient arrived
   - `treated`: Treatment completed
   - `no-show`: Patient didn't arrive
3. **Prescription Management**: Upload files or write text prescriptions
4. **Patient Notes**: Add doctor notes for patient records

### Treatment State Management
- **Pending**: Default state when appointment is booked
- **Verified**: OTP verified, patient can be treated
- **Treated**: Treatment completed, patient can leave review
- **No-Show**: Patient didn't arrive (can be marked by doctor)

### Review System
- 10-star rating system (1-10 stars)
- Optional comment field (500 characters max)
- Only available for treated appointments
- One review per appointment

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `DELETE /api/auth/delete-account` - Delete account (protected)
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Doctor Management
- `POST /api/doctors/signup` - Register a new doctor
- `POST /api/doctors/login` - Login doctor
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/profile` - Update doctor profile (protected)
- `POST /api/doctors/profile/avatar` - Upload doctor avatar (protected)
- `GET /api/doctors/appointments` - Get doctor appointments (protected)
- `GET /api/doctors/patients` - Get doctor's patients (protected)

### Doctor Profile Management
- `GET /api/doctors/:id/draft` - Get doctor's draft profile (protected)
- `PUT /api/doctors/:id/draft` - Update doctor's draft profile (protected)
- `PUT /api/doctors/:id/publish` - Publish draft profile to public (protected)
- `GET /api/doctors/:id/public` - Get doctor's public profile (no auth required)
- `GET /api/doctors/:id/profile-status` - Get profile publication status (protected)

### Appointments
- `POST /api/doctors/:id/book` - Book appointment (returns OTP)
- `GET /api/appointments` - Get user appointments (protected)
- `PUT /api/appointments/:id` - Update appointment (protected)
- `DELETE /api/appointments/:id` - Cancel appointment (protected)
- `GET /api/auth/appointments/:id` - Get appointment details with OTP (protected)
- `POST /api/auth/appointments/:id/review` - Submit patient review (protected)
- `POST /api/doctors/appointments/:id/verify-otp` - Verify patient OTP (doctor protected)
- `PATCH /api/doctors/appointments/:id/treatment-state` - Update treatment state (doctor protected)
- `GET /api/doctors/appointments/:id` - Get appointment details (doctor protected)

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/parchi
JWT_SECRET=your_jwt_secret_key_here
PORT=5050
FRONTEND_URL=http://localhost:3000

# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment Gateway (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5050
REACT_APP_UPLOAD_URL=http://localhost:5050
```

## Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Create a new account or login with existing credentials
4. Browse doctors and book appointments
5. For doctors, register and manage appointments

## Security Features

### Authentication & Authorization
- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 30 days
- Protected routes require valid authentication
- Email verification required for login
- Account lockout after 5 failed login attempts (2-hour lockout)

### Input Validation & Sanitization
- Comprehensive input validation using express-validator
- Input sanitization to prevent XSS attacks
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- Email format validation and normalization
- File upload validation and sanitization

### Rate Limiting
- General rate limiting: 100 requests per 15 minutes
- Login attempts: 5 per 15 minutes
- Signup attempts: 3 per hour
- Password reset: 3 per hour
- Email verification: 5 per hour
- File uploads: 10 per 15 minutes

### Email Security
- Secure email templates with professional design
- Token-based email verification (24-hour expiry)
- Password reset via email (10-minute expiry)
- Account lockout notifications
- Rate-limited email sending

### Additional Security
- Helmet.js for security headers
- CORS enabled for secure cross-origin requests
- Request size limiting (10MB)
- Environment variable configuration
- Secure token generation using crypto

## Error Handling

- Custom 404 and 500 error pages
- Graceful fallback avatars for missing images
- Comprehensive error messages
- Network error handling
- Form validation with user feedback

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@parchi.com or create an issue in the repository. 