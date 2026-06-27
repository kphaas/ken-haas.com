# ken-haas.com

Personal brand and career website for Ken Haas.

## Structure

- `public/` - static site assets and pages.
- `public/data/resume.json` - public-safe resume data rendered by the site.
- `src/worker.js` - redirects `www.ken-haas.com` to `ken-haas.com` and serves assets.
- `wrangler.jsonc` - Cloudflare Worker static-assets config.
- `tests/test_site_contract.py` - lightweight site/content contract checks.

## Deploy

Cloudflare Workers Builds should deploy from `main`.

Manual preflight:

```sh
python3 -m unittest discover -s tests
npx wrangler deploy --dry-run
```

## Content Policy

Keep this repo public-safe:

- no phone number
- no home address
- no private deck content
- no raw TalentOps resume exports
- no contact-provider secret
