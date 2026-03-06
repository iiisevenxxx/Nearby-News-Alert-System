// Nearby News & Alert System basic JS

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userInfo");
  const newsList = document.getElementById("newsList");

  userInfo.textContent = "App loaded. (Firebase setup pending)";
  newsList.insertAdjacentHTML(
    "beforeend",
    "<li>Example news item - yaha real data aayega.</li>"
  );
});
