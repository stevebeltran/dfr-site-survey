# DFR Site Survey App – Deployable Version

This is a complete, deployable React app you can host on Vercel.

---

## 1. Project Setup

### Install Node.js (if not installed)
https://nodejs.org

---

## 2. Create Project Folder

```bash
mkdir dfr-site-survey
cd dfr-site-survey
npm create vite@latest
```

Choose:
- React
- JavaScript

Then:

```bash
cd your-project-name
npm install
```

---

## 3. Install Dependencies

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
```

---

## 4. Configure Tailwind

Edit `tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. Replace App Code

Replace everything in:

```
src/App.jsx
```

with the app code I generated earlier in this canvas.

---

## 6. Run Locally

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 7. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dfr-site-survey.git
git push -u origin main
```

---

## 8. Deploy to Vercel

1. Go to https://vercel.com
2. Click **New Project**
3. Import your GitHub repo
4. Click Deploy

Done. You now have a live URL.

---

## 9. Add to Phone

On iPhone:
- Open URL in Safari
- Tap Share → Add to Home Screen

Now it behaves like an app.

---

## 10. (Next Step) Add Data Storage

When ready:

### Install Supabase

```bash
npm install @supabase/supabase-js
```

Create a file:

```
src/supabase.js
```

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_URL'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Then you can:
- save surveys
- upload photos
- load previous reports

---

## Architecture Overview

- React frontend (mobile UI)
- Vercel hosting
- Optional Supabase backend
- PDF via browser print

---

## Why This Works for You

- Works on phone in the field
- Structured data (no messy Word docs)
- Repeatable site sections
- Scales to BRINC-wide usage
- Easy to improve over time

---

## If You Want Next Upgrade

I can add:
- Photo upload from camera
- Auto PDF generator (clean branded report)
- Offline mode (critical for field work)
- Customer vs BRINC report toggle
- GPS autofill for locations

Just tell me 👍
