# v0 Structure Mapping Guide

This guide shows exactly where to place each file from your v0 output.

## 📁 File Structure Mapping

### Pages (app directory)

**v0 Structure → Your Repo Location:**

```
v0: app/about/page.tsx
→ src/app/about/page.tsx

v0: app/contact/page.tsx  
→ src/app/contact/page.tsx

v0: app/faq/page.tsx
→ src/app/faq/page.tsx

v0: app/faq/layout.tsx
→ src/app/faq/layout.tsx (if needed, otherwise can skip)

v0: app/w3swap/ (directory)
→ src/app/w3swap/page.tsx (main w3swap/token migration page - creates /w3swap route)
```

### Components

**v0 Structure → Your Repo Location:**

```
v0: components/w3swap/BenefitsSection.tsx
→ src/app/components/w3swap/BenefitsSection.tsx

v0: components/w3swap/CTASection.tsx
→ src/app/components/w3swap/CTASection.tsx

v0: components/w3swap/DetailedProcessTimeline.tsx
→ src/app/components/w3swap/DetailedProcessTimeline.tsx

v0: components/w3swap/DualPerspectiveTimeline.tsx
→ src/app/components/w3swap/DualPerspectiveTimeline.tsx

v0: components/w3swap/Hero.tsx
→ src/app/components/w3swap/Hero.tsx (or rename to avoid conflict with existing Hero.tsx)

v0: components/w3swap/Navbar.tsx
→ src/app/components/w3swap/Navbar.tsx (or merge with existing Navbar.tsx)

v0: components/w3swap/ProcessTimeline.tsx
→ src/app/components/w3swap/ProcessTimeline.tsx
```

## ⚠️ Important: Files to IGNORE from v0

**DO NOT copy these files - you already have them:**

- ❌ `app/globals.css` → Use your existing `src/app/globals.css`
- ❌ `app/layout.tsx` → Use your existing `src/app/layout.tsx`
- ❌ `package.json` → Check for new dependencies, but merge with existing

## 🔧 Step-by-Step Integration

### Step 1: Create Directory Structure

```bash
# Create page directories
mkdir -p src/app/about
mkdir -p src/app/contact
mkdir -p src/app/faq
mkdir -p src/app/w3swap  # Main w3swap/token migration page (creates /w3swap route)

# Create component directory
mkdir -p src/app/components/w3swap
```

### Step 2: Copy Pages

Copy the page files from v0 to your repo:

```bash
# Copy pages (adjust paths based on where your v0 files are)
cp [v0-path]/app/about/page.tsx src/app/about/page.tsx
cp [v0-path]/app/contact/page.tsx src/app/contact/page.tsx
cp [v0-path]/app/faq/page.tsx src/app/faq/page.tsx
cp [v0-path]/app/faq/layout.tsx src/app/faq/layout.tsx  # Optional
```

### Step 3: Copy Components

Copy all components from `components/w3swap/`:

```bash
cp [v0-path]/components/w3swap/*.tsx src/app/components/w3swap/
```

### Step 4: Check package.json Dependencies

Compare v0's `package.json` with yours. Look for new dependencies and add them:

```bash
# Check what's new in v0's package.json
# Then add any missing dependencies to your package.json
```

### Step 5: Adapt the Code

For each file you copied, you'll need to:

1. **Update imports** to use your component paths:
   ```tsx
   // v0 might have:
   import { Button } from "@/components/ui/button"
   
   // Your repo uses:
   import { Button } from "@/components/ui/button"  // Same! ✅
   ```

2. **Replace v0's styling** with your design system:
   - Use your color tokens (cyan, purple, teal)
   - Apply `.glass-card` class where appropriate
   - Use `.btn-brand` for buttons
   - Use your spacing scale

3. **Handle naming conflicts**:
   - If v0 has `Hero.tsx` and you have `Hero.tsx`, rename v0's to `W3swapHero.tsx`
   - If v0 has `Navbar.tsx`, decide if you want to merge or rename

4. **Add 'use client'** if components use hooks:
   ```tsx
   'use client'
   // ... rest of component
   ```

## 🎨 Styling Adaptations Needed

### Replace Generic Colors

```tsx
// v0 might have:
className="bg-blue-500"

// Replace with your tokens:
className="bg-cyan-500"  // or use CSS variables
```

### Use Your Button Component

```tsx
// v0 might have generic buttons
<button>Click me</button>

// Replace with:
import { Button } from "@/components/ui/button"
<Button className="btn-brand">Click me</Button>
```

### Apply Glass Card Effect

```tsx
// v0 might have:
<div className="bg-white/10 backdrop-blur">

// Replace with:
<div className="glass-card">
```

## 📝 Example: Adapting a v0 Page

**Before (v0):**
```tsx
// app/about/page.tsx
export default function About() {
  return (
    <div className="bg-white">
      <h1>About Us</h1>
      <button>Learn More</button>
    </div>
  )
}
```

**After (adapted for your repo):**
```tsx
// src/app/about/page.tsx
'use client'  // Add if using hooks

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <Card className="glass-card">
          <CardContent className="p-8">
            <h1 className="hero-title mb-4">About Us</h1>
            <Button className="btn-brand">Learn More</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 🔍 Component-Specific Notes

### DualPerspectiveTimeline.tsx (444 lines - largest file)

This is likely a complex component. When adapting:
1. Check if it uses any v0-specific dependencies
2. Replace any v0 UI components with your shadcn/ui equivalents
3. Ensure animations work with your styling
4. Test thoroughly as it's the most complex component

### Navbar.tsx

You already have `src/app/components/Navbar.tsx`. Options:
1. **Rename v0's**: `W3swapNavbar.tsx` if it's specific to w3swap pages
2. **Merge**: If v0's navbar has features you want, merge them
3. **Keep separate**: Use v0's navbar only on w3swap pages

### Hero.tsx

You already have `src/app/components/Hero.tsx`. Options:
1. **Rename v0's**: `W3swapHero.tsx` 
2. **Use conditionally**: Import the right Hero based on the page

## ✅ Checklist

- [ ] Created all directory structures
- [ ] Copied all page files
- [ ] Copied all component files
- [ ] Checked package.json for new dependencies
- [ ] Updated imports in all files
- [ ] Replaced generic styling with your design system
- [ ] Resolved naming conflicts (Hero, Navbar)
- [ ] Added 'use client' where needed
- [ ] Tested each page loads correctly
- [ ] Verified components render properly

## 🚀 Quick Start Commands

```bash
# 1. Create directories
mkdir -p src/app/{about,contact,faq,w3swap}
mkdir -p src/app/components/w3swap

# 2. Copy files (adjust [v0-path] to your v0 output location)
# Pages
cp [v0-path]/app/about/page.tsx src/app/about/
cp [v0-path]/app/contact/page.tsx src/app/contact/
cp [v0-path]/app/faq/page.tsx src/app/faq/
cp [v0-path]/app/w3swap/* src/app/w3swap/  # If w3swap has files

# Components
cp [v0-path]/components/w3swap/*.tsx src/app/components/w3swap/

# 3. Install any new dependencies
npm install  # or pnpm install

# 4. Start adapting the code (see Step 5 above)
```

## 🐛 Troubleshooting

**Issue: Import errors**
- Check import paths use `@/` alias
- Verify components exist in `src/app/components/ui/`

**Issue: Styling looks wrong**
- Ensure `globals.css` is imported (already in root layout)
- Check that Tailwind classes match your setup
- Verify custom classes (`.glass-card`, `.btn-brand`) are defined

**Issue: Component conflicts**
- Rename conflicting components (Hero, Navbar)
- Update imports in pages that use them

