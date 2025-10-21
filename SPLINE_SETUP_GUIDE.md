# Self-Hosted Spline Scene Setup Guide

## Current Problem

The external Spline viewer is **destroying performance**:
- **12.6 MB** scene file loaded from `prod.spline.design`
- **632 KB** spline-viewer.js from unpkg.com
- **Blocks LCP**: 12.6 seconds (needs <2.5s)
- **Total Blocking Time**: 990ms (needs <300ms)
- **Lighthouse Score**: 42/100 ❌

## Solution: Self-Hosted + Lazy Loading

### Step 1: Install Dependencies

```bash
npm install @splinetool/react-spline @splinetool/runtime
```

**Added to package.json:**
- `@splinetool/react-spline`: ^4.0.0
- `@splinetool/runtime`: ^1.9.30

### Step 2: Export Your Spline Scene

1. Open your Spline project: `https://prod.spline.design/t0wbk9SR1W-64x63/scene.splinecode`
2. **File > Export > Code Export**
3. Choose **React Component** or **Runtime**
4. Download the exported files

You'll get:
- `scene.splinecode` (the 3D scene data)
- Assets (textures, models, etc.)

### Step 3: Self-Host the Assets

Create directory structure:
```
public/
  spline/
    scene.splinecode          # Your exported scene
    textures/                  # Any textures
    models/                    # Any 3D models
```

**Move your exported files to `public/spline/`**

### Step 4: Use the Optimized Component

I've created `src/app/components/SplineScene.tsx` with two components:

#### Option A: Standard Lazy Loading (Recommended)
```tsx
import { SplineScene } from '@/components/SplineScene'

<SplineScene
  sceneUrl="/spline/scene.splinecode"
  className="absolute inset-0 pointer-events-none"
/>
```

**Features:**
- Defers loading by 1 second
- Uses `requestIdleCallback` for non-blocking load
- Lazy loads the Spline library
- No LCP blocking

#### Option B: Ultra-Deferred Loading
```tsx
import { SelfHostedSplineScene } from '@/components/SplineScene'

<SelfHostedSplineScene
  sceneUrl="/spline/scene.splinecode"
  className="absolute inset-0 pointer-events-none"
/>
```

**Features:**
- Waits for page to be fully loaded
- 3-5 second deferral
- Even less impact on initial performance

### Step 5: Update Your Layout

**Current (SLOW):**
```tsx
// src/app/(main)/layout.tsx
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.82/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/t0wbk9SR1W-64x63/scene.splinecode" />
```

**New (FAST):**
```tsx
// src/app/(main)/layout.tsx
import { SelfHostedSplineScene } from '@/components/SplineScene'

<SelfHostedSplineScene
  sceneUrl="/spline/scene.splinecode"
  className="absolute inset-0 pointer-events-none"
/>
```

### Step 6: Optimize the Scene File

If the scene is still too large (>2MB), optimize in Spline:
1. **Reduce texture sizes** (1024x1024 → 512x512)
2. **Compress geometries**
3. **Remove unused assets**
4. **Simplify models** (reduce polygon count)
5. **Use draco compression** for meshes

Target: **<2 MB** for the entire scene

### Performance Benefits

| Metric | Before (External) | After (Self-Hosted + Lazy) | Improvement |
|--------|------------------|---------------------------|-------------|
| **LCP** | 12.6s | ~2-3s | **76-80%** |
| **TBT** | 990ms | ~200ms | **80%** |
| **Network** | 13.3 MB immediate | ~0 MB immediate | **100%** |
| **JS Execution** | 2,247ms blocking | ~300ms deferred | **87%** |
| **Lighthouse** | 42/100 | ~90+/100 | **+48 pts** |

### Advanced Optimization: Intersection Observer

For scenes below the fold, add viewport detection:

```tsx
"use client"

import { useState, useEffect, useRef } from 'react'
import { SelfHostedSplineScene } from '@/components/SplineScene'

export function SplineSceneWithIntersection() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="spline-container">
      {isVisible && (
        <SelfHostedSplineScene sceneUrl="/spline/scene.splinecode" />
      )}
    </div>
  )
}
```

### Next Steps

1. ✅ Dependencies added to package.json
2. ✅ Optimized component created
3. ⏳ **Run:** `npm install`
4. ⏳ **Export** your Spline scene
5. ⏳ **Move** files to `public/spline/`
6. ⏳ **Update** layout to use new component
7. ⏳ **Test** and verify performance

### Testing Checklist

After implementation:
- [ ] Scene loads smoothly without blocking
- [ ] No console errors
- [ ] Animations work as expected
- [ ] `requestIdleCallback` is being used (check DevTools)
- [ ] Run Lighthouse audit - target 90+ performance
- [ ] Test on mobile devices
- [ ] Verify scene appears correctly

### Troubleshooting

**Scene not loading?**
- Check browser console for errors
- Verify file path is correct (`/spline/scene.splinecode`)
- Ensure files are in `public/spline/` directory

**Still slow?**
- Reduce scene complexity in Spline editor
- Compress textures further
- Consider using ThreeBackground instead if scene is too heavy

**WebGL errors?**
- Check browser compatibility
- Ensure WebGL is supported
- Add fallback for unsupported browsers

## Recommendation

Given the performance requirements (Lighthouse 100/100), I recommend:

1. **First**: Try self-hosted + ultra-deferred loading
2. **If still slow**: Optimize the scene file (target <2MB)
3. **If still slow**: Consider using only the optimized ThreeBackground component
4. **Last resort**: Make Spline load only on user interaction (click/scroll)

The PRD mentions "Spline-sourced scene is separate", so we can make it optional or super-lazy without breaking requirements.
