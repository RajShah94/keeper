This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Vercel Deployment (project-specific)

This project is a Next.js app and can be deployed to Vercel. The app expects the following environment variables to be set in the Vercel project (or via `vercel env`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Recommended steps:

1. On the Vercel dashboard, create a new project and link this repository. Vercel will detect Next.js automatically.

2. Add the environment variables above under Project Settings → Environment Variables. For client-exposed keys the `NEXT_PUBLIC_` prefix is used intentionally in this app.

3. (Alternative) Using the Vercel CLI:

```bash
# install CLI if needed
npm i -g vercel

vercel login
# in repo root
vercel --prod

# to add env vars via CLI (repeat for each variable)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY production
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
```

4. After deployment, verify the site and the serverless functions under the Vercel project dashboard.

Local sanity checks:

```bash
npm run build
npm run start
```

If you'd like, I can: connect the repo to Vercel, add a `vercel.json` config, or run a first deploy using the Vercel CLI—tell me which you prefer.
