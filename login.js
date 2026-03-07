document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const emailInput = $("emailInput");
  const passwordInput = $("passwordInput");
  const signupBtn = $("signupBtn");
  const loginBtn = $("loginBtn");
  const skipAuthBtn = $("skipAuthBtn");

  if (!window.firebase || !window.firebase.initializeApp) {
    console.error("Firebase SDK not loaded.");
    return;
  }

  try {
    firebase.initializeApp(window.firebaseConfig);
  } catch (e) {
    // already initialized ho to ignore
  }

  function getValue(el) {
    return el ? el.value.trim() : "";
  }

  function showAlert(msg) {
    alert(msg);
  }

  function goToApp() {
    window.location.href = "app.html";
  }

  // Agar already logged in hai to direct app pe bhejo
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      goToApp();
    }
  });

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const email = getValue(emailInput);
      const password = getValue(passwordInput);
      if (!email || !password) {
        showAlert("Please fill email & password.");
        return;
      }
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          goToApp();
        })
        .catch((e) => {
          console.error(e);
          showAlert("Signup error: " + e.message);
        });
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = getValue(emailInput);
      const password = getValue(passwordInput);
      if (!email || !password) {
        showAlert("Please fill email & password.");
        return;
      }
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          goToApp();
        })
        .catch((e) => {
          console.error(e);
          showAlert("Login error: " + e.message);
        });
    });
  }

  if (skipAuthBtn) {
    skipAuthBtn.addEventListener("click", () => {
      goToApp(); // Do it later: bina login ke app.html pe
    });
  }
});
