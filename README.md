# AL HAJ / TORNADO store

React (Vite) storefront and admin dashboard on Supabase, hosted on Vercel.

## Set up
1. Create a Supabase project. In **SQL Editor**, run in order: `supabase/01_schema.sql`, `02_admin.sql`, `03_seed.sql`.
   On a fresh clone, copy `02_admin.example.sql` to `02_admin.sql` and set a password first.
2. In **Authentication > Sign In / Providers**, turn off "Allow new users to sign up".
3. Fill in `.env`, then `npm install` and `npm run dev`.

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon / publishable key, never the service role or secret key |
| `VITE_WHATSAPP_NUMBER` | e.g. `+96170123456` |

## Deploy
Push to GitHub, import in Vercel, add the same three environment variables, deploy.
Changing a variable needs a redeploy. The dashboard is at `/admin`.

## Going live with the owner
- Run `supabase/04_remove_sample_products.sql` once real products are in.
- Store name and slogan: `src/lib/config.ts`. Colours: top of `src/styles.css`. Logo: `public/logo-ah.png`. Hero photo: `public/showroom.jpg`.
