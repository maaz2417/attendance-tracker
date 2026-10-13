# BunkBalance

Mobile-first university attendance tracker for managing semester subjects, teachers, schedules, attendance, and assignments.

## Quickstart

1. Clone the repository:
   ```bash
   git clone https://github.com/maaz2417/attendance-tracker.git
   cd attendance-tracker
   ```
2. Set up your Supabase project:
   - Create a free project at [supabase.com](https://supabase.com).
   - In your Supabase Dashboard, open the **SQL Editor**, paste the contents of `supabase-schema.sql`, and run it.
   - In Supabase, go to **Project Settings → API** to find your Project URL and Publishable / Anon Key.
3. Configure credentials locally:
   - Copy `supabase-config.example.js` to `supabase-config.js`:
     ```bash
     cp supabase-config.example.js supabase-config.js
     ```
   - Edit `supabase-config.js` with your project URL and publishable key:
     ```javascript
     window.SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
     window.SUPABASE_PUBLISHABLE_KEY = 'YOUR-PUBLISHABLE-KEY';
     ```
   > **Note:** `supabase-config.js` is included in `.gitignore` so your personal database credentials are never committed or published to GitHub.
4. Open `index.html` in your browser or run a simple local web server:
   ```bash
   # Python 3
   python3 -m http.server 8000
   ```
   Visit `http://localhost:8000` to create an account and start tracking.

## Security & Architecture

- **Client-Side Security:** The browser uses only Supabase's public/publishable key (`anon`). Never expose a `service_role` key in client code.
- **Row-Level Security (RLS):** All database tables (`teachers`, `tasks`, `attendance`, `profiles`) have strict Postgres Row Level Security policies enabled. Users can only read, insert, and update their own records (`auth.uid() = user_id`).
- **Private Authentication:** Accounts are registered with email, password, and an optional display username. Authentication uses standard email/password authentication to safeguard user privacy and prevent email enumeration.

## Deployment

Because BunkBalance is a static web application, it can be hosted directly on GitHub Pages, Netlify, Vercel, or Cloudflare Pages:

1. Push your repository to GitHub.
2. In your hosting platform (e.g. Netlify / Vercel), set the root directory as the publish directory (no build step required).
3. If deploying publicly, ensure `supabase-config.js` is provided in your build or environment, and configure your site's domain in Supabase under **Authentication → URL Configuration**.

## Documentation

Full project planning and architecture documentation is available in the [`docs/`](docs/README.md) directory:
- [Software Requirements Specification](docs/software-requirements-specification.md)
- [System Design](docs/system-design.md)
- [Data Model](docs/data-model.md)
- [Testing Plan](docs/testing-plan.md)
- [User Manual](docs/user-manual.md)

## License

This project is licensed under the [MIT License](LICENSE).
