export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const accept = request.headers.get("Accept") || "";

  // Intercept requests from AI Agents asking for Markdown on page routes
  if (accept.includes("text/markdown") && !url.pathname.match(/\.(js|css|png|jpg|svg|json|xml|ico)$/)) {
    const markdown = `# Word Counter Tool

A powerful, real-time Word Counter Tool designed for writers, students, and professionals. Get instant analysis of your text, including word count, character count, sentences, paragraphs, and a manipulation-proof Words Per Minute (WPM) meter. Save your work locally, manage your revision history with undo/redo, and access your data anytime, even offline.

## Core Features
- **Real-Time Statistics**: Instantly track words, characters, sentences, and paragraphs as you type.
- **Intelligent WPM Meter**: A smart typing speed calculator that intelligently ignores pasted text.
- **Local-First Storage**: Store your text entries securely in your browser using IndexedDB (100% offline support).
- **Robust History Management**: Browser-style Undo and Redo functionality continuously cached.

*Note: This application is a rich Single Page Application (SPA). To use the interactive Word Counter functionality natively, please render this URL in a standard web browser.*`;

    // Return the Custom Markdown Response directly from the Edge
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "x-markdown-tokens": "true",
        "Access-Control-Allow-Origin": "*",
        "Link": `</.well-known/api-catalog>; rel="api-catalog", </.well-known/agent-skills/index.json>; rel="agent-skills", </docs/api>; rel="service-doc"`
      }
    });
  }

  // Otherwise, pass through to Cloudflare Pages static assets (index.html, JS, CSS)
  return next();
}
