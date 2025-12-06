# Worker + D1 Database + R2 Storage

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template)

![Worker + D1 Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cb7cb0a9-6102-4822-633c-b76b7bb25900/public)

<!-- dash-content-start -->

This Cloudflare Worker combines D1 (serverless SQL database) and R2 (object storage) to demonstrate:

## Features

### D1 Database Demo
D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). The root path (`/`) displays a simple query result:

```SQL
SELECT * FROM comments LIMIT 3;
```

The D1 database is initialized with a `comments` table and this data:

```SQL
INSERT INTO comments (author, content)
VALUES
    ('Kristian', 'Congrats!'),
    ('Serena', 'Great job!'),
    ('Max', 'Keep up the good work!')
;
```

### R2 Asset Serving
R2 is Cloudflare's object storage service ([docs](https://developers.cloudflare.com/r2/)). This worker serves static assets (particularly Unity WebGL builds) from the R2 bucket with:

- **Brotli compression support** for `.br` files
- **Proper content types** for JavaScript, WASM, and data files
- **Long-term caching** with `Cache-Control` headers
- **CORS support** for cross-origin requests

#### Usage

Upload your Unity WebGL build files to the R2 bucket, then access them via:

```
https://your-worker.workers.dev/assets/Build/your-file.js.br
```

**Supported file types:**
- `.js.br` / `.framework.js.br` → `application/javascript` with Brotli encoding
- `.wasm.br` → `application/wasm` with Brotli encoding
- `.data.br` → `application/octet-stream` with Brotli encoding
- `.html` → `text/html`
- `.json` → `application/json`

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](#setup-steps) before deploying.

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=cloudflare/templates/d1-template
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create D1 Database
Create a [D1 database](https://developers.cloudflare.com/d1/get-started/):
```bash
npx wrangler d1 create d1-digilab-worker
```
Update the `database_id` field in `wrangler.json` with the new database ID.

### 3. Initialize Database
Run the db migration to initialize the database:
```bash
npx wrangler d1 migrations apply DB --remote
```

### 4. Create R2 Bucket
Create an [R2 bucket](https://developers.cloudflare.com/r2/get-started/):
```bash
npx wrangler r2 bucket create digilab-bucket
```

### 5. Upload Assets to R2 (Optional)
Upload your Unity WebGL build files:
```bash
npx wrangler r2 object put digilab-bucket/Build/your-file.js.br --file=./path/to/your-file.js.br
```

Or use the Cloudflare dashboard to upload files via the web interface.

### 6. Deploy
```bash
npx wrangler deploy
```

## Development

Run locally with:
```bash
npm run dev
```

This will:
1. Apply D1 migrations locally
2. Start the Wrangler dev server
3. Access at `http://localhost:8787`

## API Routes

- `GET /` - D1 database demo (displays comments)
- `GET /assets/*` - Serves files from R2 bucket with proper content types and compression
