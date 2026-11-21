# Deploy EMBLEM with Vercel, Render, and MongoDB Atlas

The repository is configured for a split deployment: Vercel builds the React app and rewrites `/api/*` requests to Render, Render runs the Express API, and Atlas stores brands and accounts. The rewrite keeps browser requests and authentication cookies on the Vercel origin.

## 1. Create the Atlas database

Create a database user and an Atlas cluster, then copy its application connection string. Replace the password placeholder and use the database name `emblem_db`. Allow Render to reach the cluster using the Atlas network access list. Prefer a fixed Render egress IP when the selected plan provides one; otherwise restrict the database user and use Atlas's network access controls appropriate to the Render plan.

## 2. Deploy the API on Render

Create a Render Web Service from this repository and use the included `render.yaml` Blueprint, or configure it manually:

- Root directory: `backend`
- Runtime: Node
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/v1/ready`

Set these secret environment variables in Render:

- `MONGODB_URI`: the Atlas connection string
- `JWT_SECRET`: a unique random secret with at least 32 characters (`openssl rand -base64 48` can generate one)
- `GROQ_API_KEY`: an active Groq API key
- `NODE_ENV`: `production`

After the first successful deploy, copy the Render service origin, such as `https://emblem-api.onrender.com`.

## 3. Deploy the frontend on Vercel

Import the deployment repository into Vercel. Keep the project root at the repository root; `vercel.json` sets the Create React App build, `frontend/build` output directory, and API rewrite to the Render service. The browser uses the same-origin `/api/v1` default; do not set `REACT_APP_API_URL` to the Render URL for this deployment.

## Required environment

## Required environment

Set these values in your hosting provider's secret/environment settings:

- `MONGODB_URI`: a reachable MongoDB connection string.
- `JWT_SECRET`: a unique random secret with at least 32 characters. Generate one with `openssl rand -base64 48`.
- `GROQ_API_KEY`: an active Groq API key for brand generation.
- `NODE_ENV=production`
- `PORT`: provided by most container hosts; the image defaults to `8080`.

Optional settings:

- `CORS_ORIGINS`: comma-separated allowed browser origins when calling the API directly from a separate frontend. The Vercel proxy does not require it.
- `COOKIE_SAME_SITE`: defaults to `lax`. Keep the default when using the Vercel proxy.
- `GROQ_MODEL`: optionally pin a model that is active for the configured Groq key.
- `ALLOW_DEMO_LOGIN`: leave unset or `false` in production. The shared demo account is disabled by default in production.

Never commit `.env` files or put API keys in `REACT_APP_*` variables; frontend variables are embedded in public JavaScript bundles.

## Docker deployment

From the repository root:

```sh
docker build -t emblem .
docker run --name emblem --restart unless-stopped -p 8080:8080 \
  -e NODE_ENV=production \
  -e MONGODB_URI='your-mongodb-uri' \
  -e JWT_SECRET='your-random-secret-of-at-least-32-characters' \
  -e GROQ_API_KEY='your-groq-api-key' \
  emblem
```

Configure your host to route HTTPS traffic to container port `8080`. The process listens on `PORT` when the host supplies one. The backend waits for MongoDB before accepting traffic and exits on a failed production database connection.

## Health checks

- `GET /api/v1/health` reports that the process is running.
- `GET /api/v1/ready` returns `200` only while MongoDB is connected; use it as the container readiness check.

After deployment, create a normal account through the app. Do not enable shared demo login for a public deployment.

## Local production build

```sh
npm install
npm run build
NODE_ENV=production PORT=8080 MONGODB_URI='...' JWT_SECRET='...' GROQ_API_KEY='...' npm start
```

For deployments that bypass the Vercel proxy, build with `REACT_APP_API_URL=https://your-api-host/api/v1`, set `CORS_ORIGINS` on the backend to the exact frontend origin, and set `COOKIE_SAME_SITE=none` over HTTPS. The Vercel proxy is preferred for this app's cookie-based login.
