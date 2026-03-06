document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const titleInput = document.getElementById("titleInput");
  const contentInput = document.getElementById("contentInput");
  const postBtn = document.getElementById("postBtn");
  const loadNearbyBtn = document.getElementById("loadNearbyBtn");
  const newsList = document.getElementById("newsList");

  let currentUser = null;
  let db;

  if (window.firebase && window.firebase.initializeApp) {
    firebase.initializeApp(window.firebaseConfig);
    db = firebase.firestore();
  } else {
    userInfo.textContent = "Firebase SDK not loaded.";
    return;
  }

  // Distance helper (km)
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  // Auth state
  firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
      userInfo.textContent = "Logged in as " + (user.email || "unknown");
      signupBtn.style.display = "none";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    } else {
      userInfo.textContent = "Not logged in.";
      signupBtn.style.display = "inline-block";
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  });

  // Signup
  signupBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
      alert("Please fill email & password.");
      return;
    }
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((e) => {
        console.error(e);
        alert("Signup error: " + e.message);
      });
  });

  // Login
  loginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
      alert("Please fill email & password.");
      return;
    }
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e) => {
        console.error(e);
        alert("Login error: " + e.message);
      });
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    firebase
      .auth()
      .signOut()
      .catch((e) => {
        console.error(e);
        alert("Logout error: " + e.message);
      });
  });

  // Create post with location
  postBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Please login first.");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
      alert("Please fill title & details.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          await db.collection("posts").add({
            title,
            content,
            userId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            location: new firebase.firestore.GeoPoint(lat, lng)
          });
          alert("Post created.");
          titleInput.value = "";
          contentInput.value = "";
        } catch (e) {
          console.error(e);
          alert("Error creating post: " + e.message);
        }
      },
      (err) => {
        console.error(err);
        alert("Location error: " + err.message);
      }
    );
  });

  // Load posts + distance from current user (km + meters)
  loadNearbyBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        try {
          const snap = await db
            .collection("posts")
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();

          newsList.innerHTML = "";
          snap.forEach((doc) => {
            const data = doc.data();
            const loc = data.location;
            let distanceText = "";

            if (
              loc &&
              typeof loc.latitude === "number" &&
              typeof loc.longitude === "number"
            ) {
              const distKm = haversineDistance(
                userLat,
                userLng,
                loc.latitude,
                loc.longitude
              );
              const roundedKm = Math.round(distKm * 10) / 10;
              const distM = Math.round(distKm * 1000);
              distanceText = ` (${roundedKm} km, ${distM} m away)`;
            }

            const li = document.createElement("li");
            li.textContent =
              (data.title || "No title") +
              " - " +
              (data.content || "") +
              distanceText;
            newsList.appendChild(li);
          });

          if (!newsList.children.length) {
            newsList.innerHTML = "<li>No nearby news.</li>";
          }
        } catch (e) {
          console.error(e);
          alert("Error loading news: " + e.message);
        }
      },
      (err) => {
        console.error(err);
        alert("Location error: " + err.message);
      }
    );
  });
});
