# Integrating v0 Pages into w3stream

This guide explains how to add pages generated from v0 (Vercel's v0) into your Next.js app.

## 📁 Folder Structure Options

You have two main options for organizing your token migration pages:

### Option 1: Standalone Route (Recommended for token migration)
Create a dedicated folder for migration pages:

```
src/app/
  └── migration/          # or "token-migration"
      ├── page.tsx        # /migration (main migration page)
      ├── guide/
      │   └── page.tsx    # /migration/guide
      ├── status/
      │   └── page.tsx    # /migration/status
      └── layout.tsx      # Optional: custom layout for all migration pages
```

### Option 2: Route Group (If you want shared layout)
Use a route group if migration pages need a specific layout:

```
src/app/
  └── (migration)/        # Route group (doesn't affect URL)
      ├── layout.tsx      # Shared layout for all migration pages
      ├── migration/
      │   └── page.tsx    # /migration
      └── migration/
          └── guide/
              └── page.tsx # /migration/guide
```

## 🚀 Step-by-Step Integration

### Step 1: Create the Folder Structure

For a simple migration section, create:

```bash
# Create the migration folder
mkdir -p src/app/migration
```

### Step 2: Add Your v0 Page Component

Copy your v0 page code into `src/app/migration/page.tsx`:

**Example structure:**

```tsx
// src/app/migration/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Token Migration | w3stream',
  description: 'Migrate your tokens to the new system',
}

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Your v0 page content here */}
    </div>
  )
}
```

### Step 3: Handle Client Components

If your v0 pages use client-side features (hooks, interactivity), add `'use client'`:

```tsx
// src/app/migration/page.tsx
'use client'

import { useState } from 'react'
// ... rest of your component
```

### Step 4: Use Your Existing UI Components

Replace v0's default components with your shadcn/ui components:

```tsx
// Instead of v0's Button, use yours:
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
```

### Step 5: Apply Your Styling

Your v0 pages should automatically inherit:
- ✅ `globals.css` (design tokens, colors, spacing)
- ✅ Tailwind CSS classes
- ✅ Custom utility classes (`.glass-card`, `.btn-brand`, etc.)

**Example with your styling:**

```tsx
export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Glass card effect */}
        <div className="glass-card p-8 mb-8">
          <h1 className="hero-title mb-4">Token Migration</h1>
          <p className="text-slate-400 mb-6">
            Follow these steps to migrate your tokens
          </p>
          
          {/* Use your Button component */}
          <Button className="btn-brand">
            Start Migration
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 🎨 Styling Integration Checklist

When adapting v0 pages, ensure:

- [ ] Replace generic buttons with `Button` from `@/components/ui/button`
- [ ] Use your color tokens (cyan, purple, teal) instead of generic colors
- [ ] Apply `.glass-card` class for card components
- [ ] Use your spacing scale (from `globals.css`)
- [ ] Replace icons with `lucide-react` (you already use this)
- [ ] Use `cn()` utility for className merging

## 📝 Example: Complete Migration Page

Here's a complete example combining v0 design with your styling:

```tsx
// src/app/migration/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="hero-title mb-4">Token Migration</h1>
            <p className="text-slate-400 text-lg">
              Seamlessly migrate your tokens to the new system
            </p>
          </div>

          {/* Migration Steps */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                  Step 1: Connect Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Connect your wallet to begin the migration process.
                </p>
                <Button className="btn-brand">
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🔗 Navigation Integration

Add links to your migration pages in your navigation:

```tsx
// In your Navbar or AppSidebar component
<Link href="/migration" className="...">
  Token Migration
</Link>
```

## 🎯 Layout Options

### Option A: Use Main Layout (Default)
Your pages will automatically use `(main)/layout.tsx` if placed in a route group, or the root layout.

### Option B: Custom Layout for Migration
Create `src/app/migration/layout.tsx`:

```tsx
// src/app/migration/layout.tsx
export default function MigrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* Custom header/nav for migration pages */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <h2 className="text-xl font-semibold">Token Migration</h2>
        </div>
      </header>
      {children}
    </div>
  )
}
```

## ✅ Quick Checklist

- [ ] Create folder structure (`src/app/migration/`)
- [ ] Copy v0 page code to `page.tsx`
- [ ] Add `'use client'` if using hooks/interactivity
- [ ] Replace v0 components with your UI components
- [ ] Apply your styling classes (`.glass-card`, `.btn-brand`, etc.)
- [ ] Use your color tokens (cyan, purple, teal)
- [ ] Test the page at `/migration`
- [ ] Add navigation links if needed

## 🐛 Common Issues

**Issue: Styles not applying**
- Ensure `globals.css` is imported in root `layout.tsx` (already done)
- Check that Tailwind classes are being used correctly

**Issue: Components not found**
- Verify import paths use `@/components/ui/...`
- Check that components exist in `src/app/components/ui/`

**Issue: Client component errors**
- Add `'use client'` directive at the top of files using hooks

## 📚 Resources

- Your design system: `src/app/globals.css`
- UI components: `src/app/components/ui/`
- Utility functions: `src/app/lib/utils.ts`


