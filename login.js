// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


// ==========================================
// LOGIN FORM SUBMIT
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Clear previous message
    loginMessage.innerHTML = "";

    // Basic validation
    if (!email || !password) {

        loginMessage.innerHTML = `
            <p style="color: red;">
                Please enter email and password.
            </p>
        `;

        return;
    }


    // Disable button while logging in
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        // ==========================================
        // LOGIN FAILED
        // ==========================================

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Invalid email or password."
            );
        }


        // ==========================================
        // CLEAR OLD LOGIN DATA
        // ==========================================

        localStorage.removeItem("token");
        localStorage.removeItem("user");


        // ==========================================
        // SAVE NEW LOGIN DATA
        // ==========================================

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        // ==========================================
        // SUCCESS MESSAGE
        // ==========================================

        loginMessage.innerHTML = `
            <p style="color: green;">
                Login successful! Redirecting...
            </p>
        `;


        // ==========================================
        // GO TO DASHBOARD
        // ==========================================

        setTimeout(function () {

            window.location.href = "index.html";

        }, 500);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        loginMessage.innerHTML = `
            <p style="color: red;">
                ${error.message}
            </p>
        `;


        // Enable button again
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }

});
