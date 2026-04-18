import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import process from "process";
import TurndownService from "turndown";

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Middleware for Link headers
  app.use((req, res, next) => {
    if (req.path === "/" || req.path === "/index.html") {
      res.setHeader("Link", `</.well-known/api-catalog>; rel="api-catalog", </.well-known/agent-skills/index.json>; rel="agent-skills", </docs/api>; rel="service-doc"`);
    }
    next();
  });

  // Markdown for Agents Interceptor
  // Handle root specifically for Markdown to avoid Vite SPA interception
  app.get(["/", "/index.html"], (req, res, next) => {
    const isMarkdownRequested = req.headers.accept?.includes("text/markdown");
    if (isMarkdownRequested) {
      const distPath = path.join(process.cwd(), process.env.NODE_ENV === "production" ? "dist" : "public");
      let htmlPath = path.join(process.cwd(), "dist", "index.html");
      
      if (process.env.NODE_ENV !== "production") {
          htmlPath = path.join(process.cwd(), "index.html");
      }

      fs.readFile(htmlPath, "utf8", (err, html) => {
         if (err) return next();
         const turndownService = new TurndownService();
         const markdown = turndownService.turndown(html);
         
         res.setHeader("Content-Type", "text/markdown");
         res.setHeader("x-markdown-tokens", "true");
         res.send(markdown);
      });
      return;
    }
    next();
  });

  // /.well-known endpoints
  app.get("/.well-known/api-catalog", (req, res) => {
    res.setHeader("Content-Type", "application/linkset+json");
    res.json({
      linkset: [
        {
          anchor: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/api",
          "service-desc": [{ href: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/openapi.json", type: "application/openapi+json" }],
          "service-doc": [{ href: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/docs", type: "text/html" }],
          status: [{ href: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/api/health", type: "application/json" }]
        }
      ]
    });
  });

  app.get("/.well-known/agent-skills/index.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({
      $schema: "https://agentskills.io/schema/skills.json",
      skills: [
        {
          name: "word-counter",
          type: "web-ui",
          description: "A tool to count words and characters",
          url: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app",
          sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      ]
    });
  });

  app.get(["/.well-known/openid-configuration", "/.well-known/oauth-authorization-server"], (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({
      issuer: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app",
      authorization_endpoint: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/authorize",
      token_endpoint: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/token",
      jwks_uri: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/.well-known/jwks.json",
      grant_types_supported: ["authorization_code", "client_credentials"]
    });
  });

  app.get("/.well-known/oauth-protected-resource", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({
      resource: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/api",
      authorization_servers: ["https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app"],
      scopes_supported: ["read", "write"]
    });
  });

  app.get("/.well-known/mcp/server-card.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({
      serverInfo: {
        name: "word-counter-app",
        version: "1.0.0"
      },
      transport: {
        type: "http",
        endpoint: "https://ais-dev-oxxjbuc3piubqrhfabq4cd-648855403697.asia-southeast1.run.app/mcp"
      },
      capabilities: {
        tools: true
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: express app.get('*', ...) is Express 4. Express 5 requires App.get('*all') or similar, 
    // but app.use(express.static) is fine.
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(["*", "*all"], (req, res) => {
      // In production, the HTML is a physical file.
      // Our middleware above won't catch it seamlessly if we just sendFile unless we use a slight trick,
      // but res.sendFile doesn't trigger res.send.
      // So instead, we read the file and res.send it.
      fs.readFile(path.join(distPath, "index.html"), "utf8", (err, html) => {
         if (err) return res.status(500).send(err.message);
         res.send(html);
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
