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

  // Load nearby posts
  loadNearbyBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const radius = 0.1;

        const minLat = lat - radius;
        const maxLat = lat + radius;

        try {
          const snap = await db
            .collection("posts")
            .where("location.latitude", ">=", minLat)
            .where("location.latitude", "<=", maxLat)
            .orderBy("location.latitude")
            .get();

          newsList.innerHTML = "";
          snap.forEach((doc) => {
            const data = doc.data();
            const dLng = data.location.longitude;

            if (dLng >= lng - radius && dLng <= lng + radius) {
              const li = document.createElement("li");
              li.textContent = data.title + " - " + data.content;
              newsList.appendChild(li);
            }
          });

          if (!newsList.children.length) {
            newsList.innerHTML = "<li>No nearby news.</li>";
          }
        } catch (e) {
          console.error(e);
          alert("Error loading nearby news: " + e.message);
        }
      },
      (err) => {
        console.error(err);
        alert("Location error: " + err.message);
      }
    );
  });
});
