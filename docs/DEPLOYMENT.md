# Deployment Checks

## Cloudflare

`wrangler.jsonc` declares two Worker custom domains:

- `ken-haas.com`
- `www.ken-haas.com`

Workers Builds should deploy every merge to `main`.

## Post-deploy

```sh
dig +short ken-haas.com A
dig +short www.ken-haas.com A
dig +short www.ken-haas.com CNAME
curl -I https://ken-haas.com/
curl -I https://www.ken-haas.com/
```

Expected:

- `https://ken-haas.com/` returns `200`.
- `https://www.ken-haas.com/` returns `301` with `location: https://ken-haas.com/`.
