# walkwithjohir — Photography Website

A dark editorial photography portfolio site. Fully responsive across mobile, tablet, and desktop.

---

## File Structure

```
walkwithjohir/
├── index.html        ← Main website page
├── style.css         ← All styling + responsive layout
├── main.js           ← Interactivity (lightbox, nav, animations)
├── photos.js         ← YOUR PHOTO DATA (edit this file)
├── photos/           ← Create this folder and add your images
│   ├── tails/
│   ├── quiet/
│   ├── naughty/
│   └── mental/
└── README.md
```

---

## How to Add Your Photos

### Step 1 — Create the photos folder structure

Inside the `walkwithjohir/` folder, create:

```
photos/tails/
photos/quiet/
photos/naughty/
photos/mental/
```

### Step 2 — Add your image files

Copy your photos into the matching project folder.
- Recommended format: **WebP** (smaller files, faster load)
- JPEG is also fine
- Recommended max width: **2400px**
- Name them anything you like: `001.jpg`, `dhaka-crow.webp`, etc.

### Step 3 — Edit photos.js

Open `photos.js` and fill in the arrays. Example:

```js
tails: {
  title: "Tails of the Concrete Jungle",
  photos: [
    { src: "photos/tails/001.jpg",   caption: "Dhaka, 2023 — A crow at the fish market." },
    { src: "photos/tails/002.webp",  caption: "" },
    { src: "photos/tails/003.jpg",   caption: "Chittagong port, sunrise." },
  ]
},
```

- `src` = relative path to the image file
- `caption` = text shown below the photo in the lightbox (leave `""` for no caption)
- **First photo** in each array becomes the project cover image automatically

---

## Customising Text

All text content is in `index.html`. You can edit:

- **About bio** — look for `<div class="about-bio">`
- **About details** (location, origin, etc.) — look for `<div class="about-details">`
- **Contact links** — look for `<div class="contact-links">`
- **Project descriptions** — look for `<p class="project-desc">`
- **Your portrait photo** — replace the placeholder with:  
  `<img src="photos/portrait.jpg" alt="Johirul Islam" class="loaded" />`

---

## Adding Your Portrait Photo

In `index.html`, find `<div class="about-portrait-frame">` and add inside it:

```html
<img src="photos/portrait.jpg" alt="Johirul Islam" class="loaded" />
```

---

## Deploying to walkwithjohir.com

Since you currently use **Google Sites**, you have two options:

### Option A — GitHub Pages (Free, recommended)
1. Create a free GitHub account at github.com
2. Create a new repository named `walkwithjohir`
3. Upload all files (index.html, style.css, main.js, photos.js, photos/ folder)
4. Go to Settings → Pages → Source: main branch
5. Point your domain: In Google Domains (or wherever walkwithjohir.com is registered), create a CNAME record pointing to `yourusername.github.io`

### Option B — Netlify (Free, very easy)
1. Go to netlify.com and sign up free
2. Drag and drop the entire `walkwithjohir/` folder onto the Netlify dashboard
3. In your domain registrar, update the nameservers or add a CNAME to Netlify's address

### Option C — Keep Google Sites + link
Keep Google Sites as-is and just link to this as a separate subdomain like `portfolio.walkwithjohir.com`

---

## Adding a New Project

1. In `index.html`, copy one of the `<article class="project-card">` blocks
2. Change `data-project="newkey"` to your new project key
3. Update the title, description, and metadata
4. In `photos.js`, add a new entry:
   ```js
   newkey: {
     title: "New Project Title",
     photos: [
       { src: "photos/newkey/001.jpg", caption: "" }
     ]
   }
   ```

---

## Features

- ✅ Fully responsive: mobile, tablet, desktop
- ✅ Touch swipe support in the lightbox
- ✅ Keyboard navigation (← → Escape)
- ✅ Lazy loading for all images
- ✅ Smooth scroll-reveal animations
- ✅ Custom cursor (desktop only)
- ✅ Mobile hamburger menu
- ✅ Thumbnail strip in lightbox
- ✅ Grain texture and editorial typography
- ✅ No dependencies — pure HTML/CSS/JS
- ✅ Fast — no frameworks, no build tools needed
