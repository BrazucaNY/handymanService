const fetch = require("node-fetch"); // Netlify includes this by default

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and password are required." }),
      };
    }

    // Use Firebase Auth REST API
    const apiKey = process.env.FIREBASE_API_KEY; // Keep private
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (data.error) {
      // Forward Firebase error code
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.error.message, code: data.error.code }),
      };
    }

    // Success — return token info (you can also create a session cookie)
    return {
      statusCode: 200,
      body: JSON.stringify({ idToken: data.idToken, refreshToken: data.refreshToken, email: data.email }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
