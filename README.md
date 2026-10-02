# Attendance Tracker

Mobile-first university attendance tracker for managing Semester 5 subjects, teachers, schedules, attendance, assignments, and makeup classes.

## Documentation

The project proposal, requirements, system design, data model, use cases, testing plan, roadmap, and user manual are available in the [documentation index](docs/README.md).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste `supabase-schema.sql`, and run it.
3. Copy the project URL and publishable key into `supabase-config.js`.
4. In **Authentication → URL Configuration**, add the URL where the site will be deployed.
5. Open `index.html` locally through the existing local server and create an account.

The browser uses only Supabase's publishable key. Never put a `service_role` key in this repository. Row Level Security is enabled by the schema so each account can only access its own teachers, tasks, and attendance.

## Deployment

This is a static site and can be deployed directly from GitHub with Netlify or Vercel. Use the repository root as the publish directory and leave the build command empty. After deployment, add the public site URL to Supabase's authentication URL configuration, then optionally connect a custom domain through the hosting provider.
