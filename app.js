// Nearby News & Alert System - Optimized app.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------- DOM CACHE ----------
  const $ = (id) => document.getElementById(id);

  const emailInput = $("emailInput");
  const passwordInput = $("passwordInput");
  const signupBtn = $("signupBtn");
  const loginBtn = $("loginBtn");
  const logoutBtn = $("logoutBtn");
  const userInfo = $("userInfo");
  const titleInput = $("titleInput");
  const contentInput = $("contentInput");
  const imageInput = $("imageInput");
  const postBtn = $("postBtn");
  const loadNearbyBtn = $("loadNearbyBtn");
  const newsList = $("newsList");

  let currentUser = null;
  let db = null;

  // ---------- FIREBASE INIT ----------
  function initFirebase() {
    if (!window.firebase || !window.firebase.initializeApp) {
      if (userInfo) {
        userInfo.textContent = "Firebase SDK not loaded.";
      }
      console.error("Firebase SDK not loaded.");
      return false;
    }

    try {
      firebase.initializeApp(window.firebaseConfig);
      db = firebase.firestore();
      return true;
    } catch (e) {
      console.error("Firebase init error:", e);
      if (userInfo) {
        userInfo.textContent = "Firebase init failed.";
      }
      return false;
    }
  }

  if (!initFirebase()) return;

  // ---------- HELPERS ----------
  // Haversine distance in km
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistance(userLat, userLng, loc) {
    if (
      !loc ||
      typeof loc.latitude !== "number" ||
      typeof loc.longitude !== "number"
    ) {
      return "";
    }

    const distKm = haversineDistance(
      userLat,
      userLng,
      loc.latitude,
      loc.longitude
    );
    const roundedKm = Math.round(distKm * 10) / 10;
    const distM = Math.round(distKm * 1000);

    return ` (${roundedKm} km, ${distM} m away)`;
  }

  function setAuthUI(user) {
    currentUser = user;

    if (!userInfo || !signupBtn || !loginBtn || !logoutBtn) return;

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
  }

  function getInputValue(inputEl) {
    return inputEl ? inputEl.value.trim() : "";
  }

  function clearPostForm() {
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (imageInput) imageInput.value = "";
  }

  function showAlert(message) {
    // future me custom UI ke liye centralized
    alert(message);
  }

  // ---------- IMGBB UPLOAD ----------
  // IMPORTANT: Yahan apni real ImgBB key daalo
  const IMGBB_API_KEY = "626612f93c87680ce07cd7ab1406725c";

  async function uploadToImgBB(file) {
    if (!file) return null;

    if (!IMGBB_API_KEY || IMGBB_API_KEY === "626612f93c87680ce07cd7ab1406725c") {
      console.warn("ImgBB API key not set.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    const url = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(
      IMGBB_API_KEY
    )}`;

    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("ImgBB upload failed: " + res.status);
    }

    const data = await res.json();

    if (data && data.data && data.data.url) {
      return data.data.url;
    }
    throw new Error("ImgBB response invalid");
  }

  // ---------- AUTH LISTENERS ----------
  firebase.auth().onAuthStateChanged(setAuthUI);

  function handleSignup() {
    const email = getInputValue(emailInput);
    const password = getInputValue(passwordInput);

    if (!email || !password) {
      showAlert("Please fill email & password.");
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((e) => {
        console.error("Signup error:", e);
        showAlert("Signup error: " + e.message);
      });
  }

  function handleLogin() {
    const email = getInputValue(emailInput);
    const password = getInputValue(passwordInput);

    if (!email || !password) {
      showAlert("Please fill email & password.");
      return;
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((e) => {
        console.error("Login error:", e);
        showAlert("Login error: " + e.message);
      });
  }

  function handleLogout() {
    firebase
      .auth()
      .signOut()
      .catch((e) => {
        console.error("Logout error:", e);
        showAlert("Logout error: " + e.message);
      });
  }

  // ---------- POST CREATION ----------
  function handleCreatePost() {
    if (!currentUser) {
      showAlert("Please login first.");
      return;
    }
    if (!navigator.geolocation) {
      showAlert("Geolocation not supported.");
      return;
    }

    const title = getInputValue(titleInput);
    const content = getInputValue(contentInput);
    const file = imageInput?.files?.[0] || null;

    if (!title || !content) {
      showAlert("Please fill title & details.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          let imageUrl = null;

          if (file) {
            imageUrl = await uploadToImgBB(file);
          }

          await db.collection("posts").add({
            title,
            content,
            userId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            location: new firebase.firestore.GeoPoint(lat, lng),
            imageUrl: imageUrl || null
          });

          showAlert("Post created.");
          clearPostForm();
        } catch (e) {
          console.error("Error creating post:", e);
          showAlert("Error creating post: " + e.message);
        }
      },
      (err) => {
        console.error("Location error (create post):", err);
        showAlert("Location error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  // ---------- LOAD NEARBY POSTS ----------
  function renderPostItem(data, distanceText) {
    const li = document.createElement("li");

    const title = data.title || "No title";
    const content = data.content || "";

    li.textContent = `${title} - ${content}${distanceText}`;

    if (data.imageUrl) {
      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.alt = title || "news image";
      img.className = "news-image";
      li.appendChild(document.createElement("br"));
      li.appendChild(img);
    }

    return li;
  }

  function handleLoadNearby() {
    if (!navigator.geolocation) {
      showAlert("Geolocation not supported.");
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
            .limit(50)
            .get();

          if (!newsList) return;

          newsList.innerHTML = "";

          if (snap.empty) {
            newsList.innerHTML = "<li>No nearby news.</li>";
            return;
          }

          snap.forEach((doc) => {
            const data = doc.data();
            const distanceText = formatDistance(userLat, userLng, data.location);
            const li = renderPostItem(data, distanceText);
            newsList.appendChild(li);
          });
        } catch (e) {
          console.error("Error loading news:", e);
          showAlert("Error loading news: " + e.message);
        }
      },
      (err) => {
        console.error("Location error (load nearby):", err);
        showAlert("Location error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  // ---------- EVENT BINDINGS ----------
  if (signupBtn) signupBtn.addEventListener("click", handleSignup);
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (postBtn) postBtn.addEventListener("click", handleCreatePost);
  if (loadNearbyBtn) loadNearbyBtn.addEventListener("click", handleLoadNearby);
});
