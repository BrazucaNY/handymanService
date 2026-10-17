export default async (request, context) => {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get("cookie") || "";

  // Parse cookies and verify active authentication flag
  const cookies = cookieHeader.split(";").map(c => c.trim());
  const isAuthenticated = cookies.some(c => c === "hh_auth=1" || c.startsWith("hh_auth=1;"));

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }

  return context.next();
};
