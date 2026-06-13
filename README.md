# GPS Bull — Website

Static marketing website for **GPS Bull** (Triple7Bull Innovations Pvt. Ltd.), a Delhi-based GPS tracking and IoT telematics manufacturer.

Built as plain HTML + CSS + JavaScript — no build step, no framework, no dependencies. Open `index.html` or serve the folder with any static host.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Services | `services.html` |
| Industries | `industries.html` |
| Products (overview + comparison) | `products.html` |
| Contact | `contact.html` |
| AIS-140 VLT Device | `products/ais-140.html` |
| GPS Tracker | `products/gps-tracker.html` |
| OBD-CAN Tracker | `products/obd-can-tracker.html` |
| Taxi-Auto Fare Meter | `products/fare-meter.html` |
| Speed Governor | `products/speed-governor.html` |

## Structure

```
.
├── index.html, about.html, services.html, …   # top-level pages
├── products/                                   # product detail pages
├── css/styles.css                              # full design system + responsive + animations
├── js/main.js                                  # nav, scroll reveals, count-up stats, FAQ, form
└── README.md
```

## Design system

- **Palette:** tracking blue `#2563EB` + signal orange `#F97316` on a navy/light base
- **Type:** Lexend (headings), Source Sans 3 (body), JetBrains Mono (data accents) — via Google Fonts
- **Motion:** scroll reveals, animated GPS/telemetry SVGs, count-up stats — all respect `prefers-reduced-motion`
- All product/telemetry illustrations are inline SVG (no image assets to manage)

## Local preview

Any static server works, e.g.:

```bash
npx http-server -p 8090 -c-1 .
```

Then open <http://localhost:8090>.

## To do before launch

- The contact form (`js/main.js`) is a **demo stub** — wire it to a backend or a service like Formspree.
- Header and footer markup is duplicated across pages; update all files when changing nav or footer.
