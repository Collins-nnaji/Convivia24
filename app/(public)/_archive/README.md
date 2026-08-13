# Archived routes

Everything in this folder is the previous **Convivia24 Resort, Spa & Lounge** site.

`_archive` is a Next.js [private folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) —
the leading underscore keeps these files out of the router, so none of them are
reachable as URLs. The code is untouched and still type-checked by `next build`.

| Folder            | Old route         |
| ----------------- | ----------------- |
| `stays/`          | `/stays`          |
| `convivium/`      | `/convivium`      |
| `my24/`           | `/my24`           |
| `companion/`      | `/companion`      |
| `inquire/`        | `/inquire`        |
| `invite/[token]/` | `/invite/[token]` |

## Bringing one back

Move the folder up one level (`git mv _archive/stays ./stays`) and add the link
back to `components/Navigation.tsx` / `components/Footer.tsx`.

The supporting API routes (`app/api/calendar`, `app/api/companion`,
`app/api/ai`, `app/api/people`, `app/api/reflection`), their `lib/` modules and
the `components/calendar`, `components/companion`, `components/onboarding`
directories were all left in place, so a revived page works immediately.
