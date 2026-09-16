# Shopping Kraft

Full-stack dynamic ecommerce platform built with Next.js, TypeScript, Supabase, and Vercel.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel

## Features

- Dynamic storefront (categories, products, search, cart, checkout)
- Admin panel (products, categories, orders, inventory, coupons, settings)
- Customer accounts (orders, addresses, profile)
- COD and bank transfer payments (Pakistan)
- Automatic category visibility when products exist

## Getting Started

### 1. Clone and install

```bash
git clone git@github.com:TehreemFati/shopping-kraft.git
cd shopping-kraft
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

3. Create your first admin user:
   - Register via `/register` or Supabase Auth dashboard
   - Promote to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
```

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin
- Login: http://localhost:3000/login

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local.example`)
4. Deploy

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, Supabase integration, and file purposes.

## Project Structure

```
src/
├── app/
│   ├── (storefront)/     # Public shop pages
│   ├── (auth)/           # Login & register
│   └── admin/            # Admin panel
├── components/
│   ├── ui/               # shadcn components
│   ├── storefront/
│   └── admin/
├── lib/
│   ├── actions/          # Server Actions
│   ├── queries/          # Data fetching
│   └── supabase/         # Supabase clients
└── types/
supabase/migrations/      # Database schema
```

## Admin Panel

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Product CRUD |
| `/admin/categories` | Category CRUD |
| `/admin/orders` | Order management |
| `/admin/inventory` | Stock management |
| `/admin/coupons` | Discount codes |
| `/admin/settings` | Store settings |

## License

MIT
