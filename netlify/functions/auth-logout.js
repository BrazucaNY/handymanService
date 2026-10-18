// Netlify Serverless Function: POST /.netlify/functions/auth-logout
// Server-Side Logout with Cookie Invalidation

exports.handler = async function () {
  const expiredAuth = "hh_auth=; Path=/; SameSite=Lax; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const expiredJwt = "hh_jwt=; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    multiValueHeaders: {
      "Set-Cookie": [expiredAuth, expiredJwt]
    },
    body: JSON.stringify({ ok: true })
  };
};
