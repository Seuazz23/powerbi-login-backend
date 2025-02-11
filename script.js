document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("registerBtn");
    const forgotBtn = document.getElementById("forgotBtn");
    const closeRegister = document.getElementById("closeRegister");
    const closeForgot = document.getElementById("closeForgot");

    const registerPopup = document.getElementById("registerPopup");
    const forgotPopup = document.getElementById("forgotPopup");

    // Open Register Popup
    registerBtn.addEventListener("click", () => {
        registerPopup.style.display = "block";
    });

    // Close Register Popup
    closeRegister.addEventListener("click", () => {
        registerPopup.style.display = "none";
    });

    // Open Forgot Password Popup
    forgotBtn.addEventListener("click", () => {
        forgotPopup.style.display = "block";
    });

    // Close Forgot Password Popup
    closeForgot.addEventListener("click", () => {
        forgotPopup.style.display = "none";
    });

    // Handle Register Form Submission
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Registered successfully! Redirecting to login...");
        registerPopup.style.display = "none";
    });

    // Handle Forgot Password Form Submission
    document.getElementById("forgotForm").addEventListener("submit", function (event) {
        event.preventDefault();
        alert("OTP sent to your email!");
        forgotPopup.style.display = "none";
    });
});
