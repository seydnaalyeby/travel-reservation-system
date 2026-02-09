# Travel Reservation System

## Overview
The Travel Reservation System is a full-stack booking platform designed to facilitate travel reservations across various domains, including flights, hotels, and car rentals. It offers a user-friendly interface and robust features for both end-users and administrators.

## Features
- **User Registration and Login**: Users can create accounts and log in to manage their reservations.
- **Search Functionality**: Users can search for flights, hotels, and cars based on their preferences.
- **Booking Management**: Users can view, modify, and cancel their bookings.
- **Admin Dashboard**: Administrators have access to manage users, view bookings, and manage available travel options.
- **Payment Integration**: Secure payment processing for all reservations.
- **Responsive Design**: The platform is fully responsive, ensuring usability on all devices.

## Technologies Used
- **Frontend**: React.js, Bootstrap, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT and Bcrypt
- **APIs**: Third-party APIs for flight and hotel data

## Project Structure
```
travel-reservation-system/
│
├── client/                   # Frontend code
│   ├── public/               # Public assets
│   └── src/                  # React components
│
├── server/                   # Backend code
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   └── controllers/          # Business logic
│
├── config/                   # Configuration files
│└── package.json              # Dependencies
``` 

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/seydnaalyeby/travel-reservation-system.git
   cd travel-reservation-system
   ```
2. Navigate to the `client` directory and install dependencies:
   ```bash
   cd client
   npm install
   ```
3. Navigate to the `server` directory and install dependencies:
   ```bash
   cd ../server
   npm install
   ```
4. Set up environment variables in a `.env` file in the `server` directory:
   ```bash
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```
5. Start the server:
   ```bash
   cd server
   npm start
   ```
6. Start the client:
   ```bash
   cd ../client
   npm start
   ```

## Screenshots
![Homepage](path-to-homepage-screenshot.png)
![Booking Interface](path-to-booking-interface-screenshot.png)

## Contact Information
For questions or inquiries, please contact:
- **Name**: Seydna Al-Ayeby
- **Email**: seydna.alayeby@example.com
- **GitHub**: [seydnaalyeby](https://github.com/seydnaalyeby)

---