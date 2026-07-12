# Deployment

Environment

Development

Staging

Production

Checklist

Lint

Tests

Build

Database migrations

Health checks

Monitoring

## Social share cards (og:image)

Batch links shared to social media (`/register/{token}`) render a rich preview
from server-rendered Open Graph tags plus a 1200x630 PNG served at
`/register/{token}/qr`. To keep those previews working in production:

- **Enable `gd` with FreeType** in the runtime (FrankenPHP) image. The branded
  card (`App\Support\OgImage`) needs it; without it the endpoint transparently
  falls back to a plain, gd-free padded QR — still a valid 1200x630 image, just
  unbranded. Verify with `php artisan og:doctor {token?}`.
- **`APP_URL` must be the public HTTPS host.** The og:image URL is absolute;
  scrapers reject non-secure or wrong-host images. `trustProxies` +
  `URL::forceScheme('https')` handle the scheme behind the proxy — `og:doctor`
  prints the exact URL a scraper would receive so you can confirm.
- **Re-scrape after changes.** A link shared before these tags existed stays
  cached by the platform as a plain link. Force a refresh in the
  [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (the
  `?v=updated_at` query only busts the image, not the page-level OG cache).