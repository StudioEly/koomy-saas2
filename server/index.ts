import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Host-based routing middleware for Koomy subdomains
// Rewrites URLs internally based on hostname without redirecting
app.use((req, res, next) => {
  const host = req.hostname;
  const path = req.path;
  
  // Don't rewrite API routes - they should work as-is
  if (path.startsWith('/api')) {
    return next();
  }
  
  // Don't rewrite if already on the correct path prefix
  if (host === 'app.koomy.app') {
    if (!path.startsWith('/app')) {
      if (path === '/') {
        req.url = '/app/login';
      } else {
        req.url = '/app' + req.url;
      }
    }
  } else if (host === 'app-pro.koomy.app') {
    if (!path.startsWith('/app/admin')) {
      if (path === '/') {
        req.url = '/app/admin/login';
      } else {
        req.url = '/app/admin' + req.url;
      }
    }
  } else if (host === 'backoffice.koomy.app') {
    if (!path.startsWith('/admin')) {
      if (path === '/') {
        req.url = '/admin/login';
      } else {
        req.url = '/admin' + req.url;
      }
    }
  } else if (host === 'lorpesikoomyadmin.koomy.app') {
    if (!path.startsWith('/platform')) {
      if (path === '/') {
        req.url = '/platform/login';
      } else {
        req.url = '/platform' + req.url;
      }
    }
  }
  
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
