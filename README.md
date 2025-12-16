# Towa-PH

Static marketing/support site for Towa Semiconductor Equipment Philippines — molding & singulation focus, Netlify-ready with Netlify Forms.

## Overview

This is a responsive single-page website for Towa Semiconductor Equipment Philippines, featuring:

- **Hero Section**: Eye-catching landing with call-to-action buttons
- **Products**: Molding and Singulation equipment showcase
- **Services**: Equipment installation, maintenance, support, and training
- **Parts & Upgrades**: Genuine parts and equipment upgrades
- **Portals**: Customer portal, service portal, and download center
- **Knowledge Base**: Documentation, FAQs, tutorials, and best practices
- **Contact**: Contact form with Netlify Forms integration

## Design

### Color Palette
- **Primary**: `#024397` (Deep Blue)
- **Secondary**: `#3a7ff7` (Bright Blue)
- **Text**: `#0a1b33` (Dark Blue-Gray)
- **Backgrounds**: White (`#ffffff`) and Light Gray (`#f8f9fa`)

### Features
- Fully responsive design (mobile, tablet, desktop)
- Card-based layout for content sections
- Pill-shaped buttons with hover effects
- Smooth scroll navigation
- Professional typography and spacing

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. The site will automatically deploy from the root directory
3. Netlify Forms will automatically work with the contact form

Configuration is already set in `netlify.toml`.

### Local Development

To run the site locally:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # All styles and responsive design
├── netlify.toml        # Netlify configuration
├── assets/
│   └── logo.svg        # Company logo
└── README.md           # This file
```

## Contact Form

The contact form (`priority-request`) is configured for Netlify Forms with:
- Spam protection via honeypot field
- Required fields: name, email, subject, message
- Optional fields: company, phone

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2024 Towa Semiconductor Equipment Philippines. All rights reserved.
