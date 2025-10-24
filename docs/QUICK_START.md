# Quick Start: Self-Hosted Spline Setup

## 🚀 What Was Done

Your external Spline viewer was **destroying performance** (Lighthouse score: 42/100).

I've:
- ✅ Removed the external 12.6 MB Spline viewer
- ✅ Created optimized self-hosted Spline components
- ✅ Added Spline dependencies to package.json
- ✅ Set up lazy loading architecture
- ✅ Prepared your layout for the new component

## 📋 What You Need to Do

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `@splinetool/react-spline@^4.0.0`
- `@splinetool/runtime@^1.9.30`

### Step 2: Export Your Spline Scene

1. Go to your Spline project: https://prod.spline.design/t0wbk9SR1W-64x63/scene.splinecode
2. **File → Export → Code Export**
3. Choose **"React Component"** or **"Code Export (Runtime)"**
4. Download the files

### Step 3: Add Scene to Project

Create this structure:
```
w3stream/
  public/
    spline/              ← Create this folder
      scene.splinecode   ← Put your exported scene here
      (any other assets like textures, models)
```

### Step 4: Enable the Component

Edit `src/app/(main)/layout.tsx`:

**Uncomment these lines:**
```tsx
// Line 4: Uncomment this
import { SelfHostedSplineScene } from '@/components/SplineScene'

// Lines 11-14: Uncomment this
<SelfHostedSplineScene
  sceneUrl="/spline/scene.splinecode"
  className="absolute inset-0 pointer-events-none"
/>
```

### Step 5: Test

```bash
npm run dev
```

Visit http://localhost:4444

**Expected behavior:**
- Page loads FAST (critical content first)
- Spline scene loads after 3-5 seconds (non-blocking)
- Animations work perfectly
- No performance impact

---

## 📊 Expected Performance

| Before | After |
|--------|-------|
| Lighthouse: 42/100 | Lighthouse: 90+/100 |
| LCP: 12.6s | LCP: 2-3s |
| TBT: 990ms | TBT: ~200ms |
| Initial load: 13 MB | Initial load: 0 MB |

---

## 🛠️ Troubleshooting

### npm install fails?
Try:
```bash
npm cache clean --force
npm install
```

### Scene not appearing?
Check:
- [ ] Files are in `public/spline/` (not `src/`)
- [ ] Path is `/spline/scene.splinecode` (starts with `/`)
- [ ] Component is uncommented in layout
- [ ] Check browser console for errors

### Scene too large?
Optimize in Spline:
- Reduce texture sizes (1024 → 512)
- Simplify geometry
- Remove unused assets
- Target: <2 MB

### Still seeing old viewer?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check that old `<script>` tag is removed

---

## 📁 Files Created

1. **`src/app/components/SplineScene.tsx`** - Optimized component
2. **`SPLINE_SETUP_GUIDE.md`** - Detailed setup guide
3. **`PERFORMANCE_FIXES_SUMMARY.md`** - Complete analysis
4. **`QUICK_START.md`** - This file

---

## 🎯 Next Steps After Spline

Once Spline is working, optimize:
1. **Videos** (34 MB w3SLogo.webm needs compression!)
2. **JavaScript bundle** (remove unused code)
3. **Add preconnect hints**
4. **Final Lighthouse audit**

Target: **100/100 Lighthouse score** ✨

---

## ✅ Verification Checklist

After setup:
- [ ] `npm install` completed successfully
- [ ] Spline scene exported and in `public/spline/`
- [ ] Component uncommented in layout
- [ ] Page loads fast (FCP < 1.5s)
- [ ] Spline appears after a few seconds
- [ ] No console errors
- [ ] Animations working
- [ ] Lighthouse score improved

---

## 🆘 Need Help?

Check these files:
- **SPLINE_SETUP_GUIDE.md** - Detailed instructions
- **PERFORMANCE_FIXES_SUMMARY.md** - Full performance analysis

The component is already built and ready - you just need to:
1. Run `npm install`
2. Export your scene
3. Uncomment the component

That's it! 🚀
