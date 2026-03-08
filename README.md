# Nearby News & Alert System

A simple web app to create and view **nearby news** based on your real-time location, built with HTML, CSS, JavaScript, Firebase and ImgBB.

## Features

- Email/password authentication (Firebase Auth)
- Create news posts with:
  - Title and description
  - Automatic location (via browser geolocation)
  - Optional image upload (compressed and stored via ImgBB)
- View latest nearby news on the home page
- See distance of each news item from your current location (km + meters)
- Mobile-friendly layout with side navigation

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- Firebase Authentication
- Firebase Firestore (for posts)
- ImgBB (for image hosting)
- Browser Geolocation API

## Project Structure

- `index.html` – Home page showing latest nearby news
- `app.html` – Main app (create post + nearby list)
- `login.html` – Separate login/signup page
- `account.html` – (optional) account-related view
- `app.js` – Core app logic (auth, create post, nearby listing)
- `firebaseConfig.js` – Firebase configuration and initialization
- `nav.js` – Responsive navbar / side menu logic
- `style.css` – Global styles

## How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/iiisevenxxx/Nearby-News-Alert-System.git
   cd Nearby-News-Alert-System

2. Create a Firebase project and enable:

3. Email/Password authentication

Firestore database

Fill your Firebase config in firebaseConfig.js:

// Example shape (replace with your keys)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);


4. Open index.html with a local server (recommended):

bash
# one of:
npx serve .
# or
python -m http.server 8000
5. Visit http://localhost:8000 (or shown URL) in your browser.

Notes
-For images, the app uses an ImgBB API key inside app.js.

-Geolocation must be allowed in the browser for distance and posting location to work.

-This project is currently a static, vanilla JS implementation (no React build step).
