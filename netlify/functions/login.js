exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email and password are required." }),
      };
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data.error.message || "Login failed" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        email: data.email,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
<script>
const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = "";
  loginBtn.textContent = "Logging in...";
  loginBtn.classList.add("loading");

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // <-- Replace the existing auth.signInWithEmailAndPassword code with this fetch -->
  try {
    const res = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log("Response received:", res);

    const data = await res.json();
    console.log("Data received:", data);

    if (!res.ok) {
      msg.textContent = data.error || "Login failed";
      return;
    }

    sessionStorage.setItem("idToken", data.idToken);
    window.location.href = '/admin/admin.html';
  } catch (err) {
    console.error("Fetch error:", err);
    msg.textContent = "Login failed: Server error.";
  } finally {
    loginBtn.textContent = "Login";
    loginBtn.classList.remove("loading");
  }
});
</script>
