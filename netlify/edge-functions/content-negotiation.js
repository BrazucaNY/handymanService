export default async (request, context) => {
  const url = new URL(request.url);

  // 301 redirect /index.html to / to eliminate canonical duplicate
  if (url.pathname === "/index.html") {
    return Response.redirect(new URL("/", request.url), 301);
  }

  const accept = request.headers.get("accept") || "";

  // Exclude static assets and serverless functions (/.netlify/*)
  if (
    url.pathname.startsWith("/.netlify") ||
    /\.(png|jpg|jpeg|webp|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    return context.next();
  }

  // Handle Accept: text/markdown negotiation (acceptmarkdown.com)
  if (accept.includes("text/markdown")) {
    const res = await context.next();

    // 01 Agent-friendly 404s: Return 404 status with Markdown guidance for missing pages
    if (res.status === 404) {
      const markdown404 = `# 404 - Page Not Found

The requested page does not exist on Here Handyman (Westchester County, NY handyman services).

## Available Resources for AI Agents:
- **Sitemap**: [sitemap.xml](https://www.herehandyman.com/sitemap.xml)
- **LLMS Index**: [llms.txt](https://www.herehandyman.com/llms.txt)
- **Full LLMS Index**: [llms-full.txt](https://www.herehandyman.com/llms-full.txt)
- **Homepage**: [Here Handyman](https://www.herehandyman.com/)
- **Services**: [Our Services](https://www.herehandyman.com/services)
- **Book Appointment**: [Book Online](https://www.herehandyman.com/book)

## Contact:
Call or text: (516) 350-0801 | Email: info@herehandyman.com
`;
      return new Response(markdown404, {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Vary": "Accept, Accept-Encoding",
          "Cache-Control": "public, max-age=0, must-revalidate",
          "X-Robots-Tag": "noindex, nofollow, noarchive"
        }
      });
    }

    // Serve llms.txt as markdown content for valid pages when Accept: text/markdown requested
    try {
      const llmsRes = await fetch(new URL("/llms.txt", request.url));
      const llmsText = await llmsRes.text();
      return new Response(llmsText, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Vary": "Accept, Accept-Encoding",
          "Cache-Control": "public, max-age=3600, must-revalidate"
        }
      });
    } catch (_err) {
      // Fall through to default response on fetch error
    }
  }

  // Normal HTML/browser response
  const response = await context.next();

  // Safe header modification: clone headers to prevent immutable headers TypeError
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Vary", "Accept, Accept-Encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};
