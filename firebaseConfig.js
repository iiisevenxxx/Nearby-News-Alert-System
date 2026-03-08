// firebaseConfig.js
window.firebaseConfig = {
  apiKey: "AIzaSyD_YDGU9IWHDpxFl4S4U_IkEQ-5TrPjB_U",
  authDomain: "isevenx-nearby-news.firebaseapp.com",
  projectId: "isevenx-nearby-news",
  storageBucket: "isevenx-nearby-news.appspot.com",
  messagingSenderId: "1046821424203",
  appId: "1:1046821424203:web:823a6210f19d5102c40e7b",
  measurementId: "G-X8DY61GYWD"
};

// yaha initialize karo (v8 style)
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}
