const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 3001;
const app = express();

// Serve the repo root so student-dashboard.html is available
app.use(express.static(path.resolve(__dirname, '..')));

const server = app.listen(PORT, async () => {
  console.log(`Serving workspace at http://localhost:${PORT}`);

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Forward browser console messages and page errors to Node console for debugging
    page.on('console', msg => {
      try { console.log('PAGE LOG:', msg.text()); } catch (e) { }
    });
    page.on('pageerror', err => {
      try { console.error('PAGE ERROR:', err.message); } catch (e) { }
    });

    // Inject login into localStorage before page scripts run.
    // If environment variables are provided, use them; otherwise fall back to a safe mock.
    let providedUser = process.env.SWIMPRO_USER;
    const providedToken = process.env.SWIMPRO_TOKEN;

    // If a token is provided but not an explicit user, try to decode the JWT in Node
    // and synthesize a minimal user object to avoid client-side redirects.
    if (providedToken && !providedUser) {
      try {
        const parts = providedToken.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
          const uid = payload.sub || payload.user_id || payload.id || 'unknown';
          const email = payload.email || (payload.user_metadata && payload.user_metadata.email) || '';
          const name = (payload.user_metadata && payload.user_metadata.name) || (email && email.split('@')[0]) || 'User';
          const inferred = { id: uid, email, name, userType: 'student' };
          providedUser = JSON.stringify(inferred);
        }
      } catch (e) {
        // ignore decode failures
      }
    }
    if (providedUser || providedToken) {
      console.log('Using provided SWIMPRO_USER / SWIMPRO_TOKEN for render');
    } else {
      console.log('No SWIMPRO_USER/SWIMPRO_TOKEN provided — using mock user for render');
    }

    await page.evaluateOnNewDocument((envUser, envToken) => {
      try {
        if (envUser) {
          // envUser expected to be a JSON string
          try {
            const parsed = JSON.parse(envUser);
            localStorage.setItem('swimproUser', JSON.stringify(parsed));
          } catch (e) {
            localStorage.setItem('swimproUser', envUser);
          }
        }
        if (envToken) {
          // set session-id cookie name used by server; when injecting a raw token for headless
          // testing we set a temporary session id and also set the store via an XHR to the
          // local server. But in this headless script we will set a short-lived cookie named
          // 'swimpro_sid' with a synthetic id and also set localStorage fallback.
          document.cookie = 'swimpro_sid=' + encodeURIComponent('sid-injected') + '; path=/;';
          // store raw token in localStorage for pages that still look for it (headless only)
          localStorage.setItem('swimproToken', envToken);
          // Note: server-side session store is not populated here; server endpoints will
          // accept Authorization header fallback when present in client code for tests.
        }

        // If a token was provided but not a user, attempt to decode the JWT payload
        // and populate a minimal `swimproUser` so client-side redirects won't fire.
        if (envToken && !envUser) {
          try {
            const parts = envToken.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              const uid = payload.sub || payload.user_id || payload.id;
              const email = payload.email || (payload.user_metadata && payload.user_metadata.email) || '';
              const name = (payload.user_metadata && payload.user_metadata.name) || (email && email.split('@')[0]) || 'User';
              const inferred = {
                id: uid || 'unknown',
                email,
                name,
                userType: 'student'
              };
                  localStorage.setItem('swimproUser', JSON.stringify(inferred));
                  if (envToken) {
                    document.cookie = 'swimpro_sid=' + encodeURIComponent('sid-injected') + '; path=/;';
                    localStorage.setItem('swimproToken', envToken);
                  }
            }
          } catch (e) {
            // ignore decode failures
          }
        }

        // fallback mock if nothing provided
        if (!envUser && !envToken) {
          const mockUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'testuser@example.com',
            name: 'Test User',
            userType: 'student',
            membership: 'Premium Monthly',
            subscription: 'monthly'
          };
          localStorage.setItem('swimproUser', JSON.stringify(mockUser));
          document.cookie = 'swimpro_sid=' + encodeURIComponent('sid-injected') + '; path=/;';
        }
      } catch (e) {
        // ignore
      }
    }, providedUser, providedToken);

    const url = `http://localhost:${PORT}/student-dashboard.html`;
    console.log('Loading', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Dump a short slice of the rendered HTML to help debug client-side blocking
    try {
      const html = await page.content();
      console.log('PAGE HTML SLICE:', html.slice(0, 2000));
    } catch (e) {
      console.error('Could not read page content:', e.message);
    }

    // Wait for key dashboard element to load
    await page.waitForSelector('#welcomeName', { timeout: 20000 });

    const out = path.resolve(process.cwd(), 'render-dashboard.png');
    await page.screenshot({ path: out, fullPage: true });
    console.log('Screenshot saved to', out);
  } catch (err) {
    console.error('Render error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close(() => console.log('Server closed'));
  }
});
