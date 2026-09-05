export default async (request, context) => {
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);

  // Exclude static assets (images, css, js, fonts, favicon)
  if (/\.(png|jpg|jpeg|webp|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    return context.next();
  }

  // If client requests text/markdown via Accept header
  if (accept.includes("text/markdown")) {
    // If request path is a 404 or missing page
    const res = await context.next();
    if (res.status === 404) {
      const markdown404 = `# 404 - Page Not Found

That page does not exist on Here Handyman (Westchester County, NY handyman services).

For agents: full site index available at [sitemap.xml](/sitemap.xml), [llms.txt](/llms.txt), or [llms-full.txt](/llms-full.txt). Homepage: [herehandyman.com](https://www.herehandyman.com).

Call or text (516) 350-0801 or [book a job](https://www.herehandyman.com/book-appointment).
`;
      return new Response(markdown404, {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Vary": "Accept, Accept-Encoding",
          "Cache-Control": "public, max-age=0, must-revalidate"
        }
      });
    }

    // Serve llms.txt as markdown content for valid pages
    const markdownUrl = new URL("/llms.txt", request.url);
    const response = await context.rewrite(markdownUrl);
    response.headers.set("Content-Type", "text/markdown; charset=utf-8");
    response.headers.set("Vary", "Accept, Accept-Encoding");
    return response;
  }

  // Normal HTML/browser response
  const response = await context.next();
  response.headers.set("Vary", "Accept, Accept-Encoding");
  return response;
};
