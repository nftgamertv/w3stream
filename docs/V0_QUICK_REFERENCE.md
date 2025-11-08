# v0 Integration Quick Reference

## 📋 File Mapping at a Glance

| v0 Location | Your Repo Location | Notes |
|------------|-------------------|-------|
| `app/about/page.tsx` | `src/app/about/page.tsx` | ✅ Copy as-is, then adapt styling |
| `app/contact/page.tsx` | `src/app/contact/page.tsx` | ✅ Copy as-is, then adapt styling |
| `app/faq/page.tsx` | `src/app/faq/page.tsx` | ✅ Copy as-is, then adapt styling |
| `app/faq/layout.tsx` | `src/app/faq/layout.tsx` | ⚠️ Optional - only if needed |
| `app/w3swap/` | `src/app/w3swap/page.tsx` | ✅ Main w3swap/token migration page (creates `/w3swap` route) |
| `components/w3swap/*.tsx` | `src/app/components/w3swap/*.tsx` | ✅ Copy all components |
| `app/globals.css` | ❌ **IGNORE** | Use existing `src/app/globals.css` |
| `app/layout.tsx` | ❌ **IGNORE** | Use existing `src/app/layout.tsx` |
| `package.json` | ⚠️ **MERGE** | Check for new dependencies only |

## 🚨 Critical: Do NOT Overwrite

- ❌ `src/app/globals.css` - Your design system
- ❌ `src/app/layout.tsx` - Your root layout
- ⚠️ `src/app/components/Hero.tsx` - Rename v0's to `W3swapHero.tsx`
- ⚠️ `src/app/components/Navbar.tsx` - Rename v0's to `W3swapNavbar.tsx` or merge

## 🎯 Key Adaptations

1. **Replace colors**: Use cyan (`#06b6d4`), purple (`#a855f7`), teal (`#14b8a6`)
2. **Apply classes**: `.glass-card`, `.btn-brand`, `.hero-title`
3. **Use components**: Import from `@/components/ui/button`, `@/components/ui/card`, etc.
4. **Add 'use client'**: If component uses hooks or interactivity

## 📦 Components to Copy

From `components/w3swap/`:
- ✅ `BenefitsSection.tsx`
- ✅ `CTASection.tsx`
- ✅ `DetailedProcessTimeline.tsx`
- ✅ `DualPerspectiveTimeline.tsx` (444 lines - most complex)
- ⚠️ `Hero.tsx` → Rename to `W3swapHero.tsx`
- ⚠️ `Navbar.tsx` → Rename to `W3swapNavbar.tsx` or merge
- ✅ `ProcessTimeline.tsx`

## 🔗 Import Path Updates

v0 might use:
```tsx
import { Button } from "@/components/ui/button"
```

Your repo uses (same!):
```tsx
import { Button } from "@/components/ui/button"  // ✅ No change needed
```

## 🎨 Styling Quick Replacements

| v0 Style | Your Style |
|----------|------------|
| `bg-white` | `bg-black` (dark theme) |
| `bg-blue-500` | `bg-cyan-500` or `bg-primary` |
| Generic buttons | `<Button className="btn-brand">` |
| Generic cards | `<Card className="glass-card">` |
| `text-gray-900` | `text-white` or `text-slate-400` |

## ⚡ Quick Start

```bash
# 1. Create directories
mkdir -p src/app/{about,contact,faq,w3swap}
mkdir -p src/app/components/w3swap

# 2. Copy files from v0 output
# (Adjust [v0-path] to where your v0 files are)

# 3. Adapt styling in each file
# 4. Test pages at /about, /contact, /faq, /w3swap
```

## 📚 Full Documentation

See `docs/V0_STRUCTURE_MAPPING.md` for detailed instructions.

