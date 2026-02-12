# PostHub Image Assets

This directory contains image assets for the PostHub landing page.

## Required Images

### Background Image
- **Path**: `/SiteAssets/app/images/home-background.jpg`
- **Recommended size**: 1920x1080px or larger
- **Format**: JPG, PNG, or WebP
- **Description**: Full-screen background for landing page

### Logo Image
- **Path**: `/SiteAssets/app/images/pigeon-logo.png`
- **Recommended size**: 256x256px or larger
- **Format**: PNG with transparency (SVG preferred)
- **Description**: PostHub/Pigeon logo

## Updating Image Paths

To change image URLs, edit constants in `SiteAssets/app/routes/route.js`:

```javascript
const BACKGROUND_IMAGE_URL = '/SiteAssets/app/images/home-background.jpg'
const LOGO_IMAGE_URL = '/SiteAssets/app/images/pigeon-logo.png'
```

## Image Optimization

- Use WebP format for better compression (30-50% smaller than JPG)
- Optimize quality to 80-85% for balance between size and quality
- Target file sizes: Background < 500KB, Logo < 50KB
- For logo, SVG format is preferred for infinite scalability

## Temporary Fallback

While images are pending, the SPARC Image component will handle missing images gracefully. Optionally, add a CSS gradient fallback:

```css
.landing-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #81c784 0%, #4caf50 50%, #2e7d32 100%);
  opacity: 0.9;
  z-index: -1;
}
```
