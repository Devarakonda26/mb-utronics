# MB Utronics Website

A single-page, static website (HTML5, CSS3, vanilla JavaScript). No build step and no frameworks.

## Project structure

```
mb-utronics/
├── index.html            All sections, SEO metadata, JSON-LD, SVG icon sprite
├── css/style.css         Design system (CSS variables) and all styles
├── js/script.js          Nav, scroll-spy, reveal, counters, topic prefill, form
├── assets/images/
│   └── mblogo.jpeg       Brand logo (included)
├── robots.txt
├── sitemap.xml
└── README.md
```

## Run locally

Open `index.html` directly, or serve the folder:

```bash
cd mb-utronics
python3 -m http.server 8000
# visit http://localhost:8000
```

## Logo

The logo is used in the navbar, footer, favicon, and social-sharing image, always from
`assets/images/mblogo.jpeg` (already included). To replace it later,
overwrite the file (keep the name), or change the path everywhere it appears in `index.html`
(search for `mblogo.jpeg`; it appears in the nav, footer, favicon, apple-touch-icon, `og:image`, `twitter:image`).
A square logo works best; it is displayed at 44×44.

## Contact form (must be configured)

The site is static, so it cannot send email by itself. The form posts JSON to an endpoint you provide.
**Until an endpoint is set, the form shows an error and does not claim the message was sent.**

1. Create a form on a form service, for example [Formspree](https://formspree.io) (or Web3Forms, Getform, or your own backend).
   Set the destination to `mbutronics3@gmail.com`.
2. Copy the endpoint URL (Formspree looks like `https://formspree.io/f/xxxxxxxx`).
3. In `index.html`, set it on the form:

   ```html
   <form id="contact-form" ... data-endpoint="https://formspree.io/f/xxxxxxxx">
   ```

The request is `POST` with `Content-Type: application/json` and fields `name`, `email`, `message`, and
`topic` (set when a visitor arrives via a service/project "Learn More" or "Discuss a Project" link).
Any endpoint that accepts this and returns a 2xx status will work. Formspree endpoints are public by design;
**never put secret API keys or credentials in the frontend.** If you use a custom backend, keep secrets there.

A hidden honeypot field (`_gotcha`) is included for basic spam filtering. For stronger protection, enable
the spam/CAPTCHA options in your form service's dashboard.

## SEO metadata / domain (not needed to launch)

No domain is required to run or host the site. Until you have one, the canonical link and `og:url` are left out,
and `robots.txt` has no Sitemap line. Title, description, theme colour, favicon and Open Graph/Twitter text are already set in `<head>`.

When you get a domain, do this once:

- `index.html`: add `<link rel="canonical" href="https://YOUR-DOMAIN/">` and `<meta property="og:url" content="https://YOUR-DOMAIN/">`
- `index.html`: change `og:image` and `twitter:image` to `https://YOUR-DOMAIN/assets/images/mblogo.jpeg` (social previews need an absolute URL)
- `robots.txt`: uncomment the Sitemap line and set the domain
- `sitemap.xml`: replace `YOUR-DOMAIN`

The Organization JSON-LD uses only the company name, email and phone numbers. Add `url`, `logo`, `address` etc. only once they are real.

## Deploy

Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages, or a standard web server.
Upload the folder contents so `index.html` is at the site root. Free hosts like Netlify, Cloudflare Pages or GitHub Pages give you a free web address, so no domain purchase is needed. Then set the form endpoint.

## Notes

- Technology icons are consistent generic technical icons (not official brand logos), to avoid licensing issues and extra network requests.
- The page loads one external resource: Google Fonts (Manrope and JetBrains Mono). If you prefer zero external requests, remove the font `<link>`s; the CSS falls back to system fonts.
- Respects `prefers-reduced-motion`.
- No fake testimonials, clients, statistics, addresses or social links are included. Add real ones only when available.
