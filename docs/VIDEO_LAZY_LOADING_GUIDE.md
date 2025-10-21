# Video Lazy Loading - Developer Guide

## Quick Start

### Using the useLazyVideo Hook

The easiest way to add lazy loading to any video in the application:

```typescript
import { useLazyVideo } from '@/app/hooks/useLazyVideo'

function MyComponent() {
  const [videoRef, isLoaded, isPlaying] = useLazyVideo({
    src: '/videos/my-video.webm',
    type: 'video/webm',
    priority: 'low',        // 'high' or 'low'
    rootMargin: '100px',    // Load when within 100px of viewport
    threshold: 0.1,         // Trigger at 10% visibility
    delay: 1000,            // Optional delay in ms
  })

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="none"
      className="my-video"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s'
      }}
    >
      {/* Source injected automatically */}
      Your browser does not support the video tag.
    </video>
  )
}
```

---

## Best Practices

### 1. Always Use preload="none"
Prevents browser from downloading any video data until explicitly loaded.

```typescript
<video preload="none" ... />
```

### 2. Add Smooth Transitions
Fade videos in to prevent jarring appearance:

```typescript
style={{
  opacity: isLoaded ? 1 : 0,
  transition: 'opacity 0.5s ease-in-out'
}}
```

### 3. Prioritize Video Loading

**High Priority**: Videos user will see immediately
```typescript
priority: 'high'  // Uses immediate loading during idle time
```

**Low Priority**: Large files, below-the-fold content
```typescript
priority: 'low'   // Uses requestIdleCallback with longer timeout
```

### 4. Adjust rootMargin Based on File Size

**Small videos** (< 1MB): Load close to viewport
```typescript
rootMargin: '50px'
```

**Large videos** (> 10MB): Load well before viewport
```typescript
rootMargin: '200px'
```

### 5. Handle Autoplay Gracefully

Always catch autoplay promises:
```typescript
videoElement.play()
  .then(() => setIsPlaying(true))
  .catch(err => console.log('Autoplay prevented:', err))
```

---

## Common Patterns

### Pattern 1: Background Video (Low Priority)

```typescript
function BackgroundVideo() {
  const [videoRef, isLoaded] = useLazyVideo({
    src: '/videos/background.mp4',
    type: 'video/mp4',
    priority: 'low',
    rootMargin: '50px',
  })

  return (
    <div className="video-background">
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  )
}
```

### Pattern 2: Hero Video (High Priority)

```typescript
function HeroVideo() {
  const [videoRef, isLoaded, isPlaying] = useLazyVideo({
    src: '/videos/hero.webm',
    type: 'video/webm',
    priority: 'high',
    rootMargin: '100px',
  })

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="none"
      className="hero-video"
      poster="/images/hero-poster.jpg"  // Show placeholder
      style={{ opacity: isLoaded ? 1 : 0 }}
    />
  )
}
```

### Pattern 3: Multiple Videos with Staggered Loading

```typescript
function VideoGallery() {
  const [video1Ref] = useLazyVideo({
    src: '/videos/video1.webm',
    type: 'video/webm',
    priority: 'high',
    delay: 0,
  })

  const [video2Ref] = useLazyVideo({
    src: '/videos/video2.webm',
    type: 'video/webm',
    priority: 'low',
    delay: 1000,  // Load 1s after video1
  })

  const [video3Ref] = useLazyVideo({
    src: '/videos/video3.webm',
    type: 'video/webm',
    priority: 'low',
    delay: 2000,  // Load 2s after video1
  })

  return (
    <div className="gallery">
      <video ref={video1Ref} ... />
      <video ref={video2Ref} ... />
      <video ref={video3Ref} ... />
    </div>
  )
}
```

### Pattern 4: Manual Loading Control

If you need manual control instead of automatic Intersection Observer:

```typescript
function ManualLoadVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadVideo = () => {
    const video = videoRef.current
    if (!video || isLoaded) return

    const source = document.createElement('source')
    source.src = '/videos/my-video.webm'
    source.type = 'video/webm'
    video.appendChild(source)
    video.load()

    video.addEventListener('loadeddata', () => {
      video.play().catch(err => console.log('Autoplay prevented:', err))
      setIsLoaded(true)
    }, { once: true })
  }

  return (
    <div>
      <button onClick={loadVideo}>Load Video</button>
      <video ref={videoRef} preload="none" />
    </div>
  )
}
```

---

## Performance Checklist

Before deploying a new video component:

- [ ] Added `preload="none"` attribute
- [ ] Implemented lazy loading (Intersection Observer or hook)
- [ ] Set appropriate `priority` ('high' or 'low')
- [ ] Configured `rootMargin` based on file size
- [ ] Added smooth opacity transition
- [ ] Handled autoplay rejection gracefully
- [ ] Added accessibility attributes (`aria-label`, `aria-hidden`)
- [ ] Tested on throttled network (Fast 3G)
- [ ] Verified no duplicate loads
- [ ] Checked memory cleanup (observers disconnected)

---

## Debugging

### Check if Intersection Observer is Working

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      console.log('Intersecting:', entry.isIntersecting)
      console.log('Intersection ratio:', entry.intersectionRatio)
    })
  },
  { rootMargin: '100px', threshold: 0.1 }
)
```

### Monitor requestIdleCallback

```typescript
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    console.log('Loading during idle time')
    loadVideo()
  }, { timeout: 2000 })
} else {
  console.log('requestIdleCallback not supported, using setTimeout')
  setTimeout(loadVideo, 100)
}
```

### Track Video Load Performance

```typescript
const startTime = performance.now()

videoElement.addEventListener('loadeddata', () => {
  const loadTime = performance.now() - startTime
  console.log(`Video loaded in ${loadTime}ms`)
}, { once: true })
```

---

## Common Issues

### Issue 1: Video Not Loading

**Symptoms**: Video never appears, no network request

**Causes**:
- Intersection Observer not triggering
- Element never enters viewport
- Observer threshold too high

**Solutions**:
```typescript
// Increase rootMargin
rootMargin: '200px'  // Load earlier

// Lower threshold
threshold: 0.01  // Trigger with just 1% visibility

// Add debug logs
observer = new IntersectionObserver(
  (entries) => {
    console.log('Observer triggered:', entries[0].isIntersecting)
  }
)
```

### Issue 2: Multiple Loads

**Symptoms**: Same video loads multiple times

**Causes**:
- Observer not disconnected
- State not tracking loaded status
- Component re-rendering

**Solutions**:
```typescript
// Use state flag
const [isLoaded, setIsLoaded] = useState(false)

if (entry.isIntersecting && !isLoaded) {
  loadVideo()
  observer.disconnect()  // Important!
}
```

### Issue 3: Autoplay Blocked

**Symptoms**: Video loads but doesn't play

**Causes**:
- Browser autoplay policy
- Video not muted
- User interaction required

**Solutions**:
```typescript
// Always mute autoplay videos
<video muted ... />

// Catch autoplay rejection
video.play().catch(err => {
  console.log('Autoplay blocked, show play button')
  setShowPlayButton(true)
})
```

### Issue 4: Poor Performance on Mobile

**Symptoms**: Slow load, janky scrolling

**Causes**:
- Video too large
- Loading too many simultaneously
- Not using requestIdleCallback

**Solutions**:
```typescript
// Increase delay for mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
const delay = isMobile ? 2000 : 1000

// Reduce quality for mobile
const videoSrc = isMobile
  ? '/videos/mobile-quality.webm'
  : '/videos/desktop-quality.webm'
```

---

## Video File Optimization Tips

### 1. File Size Guidelines
- Background videos: < 1MB
- Feature videos: < 10MB
- Logo animations: < 5MB
- Full-screen videos: < 20MB

### 2. Recommended Codecs
- **WebM (VP9)**: Best compression, modern browsers
- **MP4 (H.264)**: Wide compatibility, fallback
- **Avoid**: Uncompressed, very high bitrate

### 3. FFmpeg Compression Commands

**High quality, small file:**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

**Mobile-optimized:**
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 35 -b:v 500k -vf scale=1280:-1 output.webm
```

**Extract poster frame:**
```bash
ffmpeg -i video.webm -ss 00:00:01 -frames:v 1 poster.jpg
```

### 4. Use Poster Images

Always provide a poster for instant visual feedback:
```typescript
<video poster="/images/video-poster.jpg" ... />
```

---

## Testing Your Implementation

### 1. Network Test
```javascript
// Chrome DevTools > Network
// Filter by: "media"
// Verify:
// - Videos load only when visible
// - Correct load order (high priority first)
// - No duplicate requests
```

### 2. Performance Test
```javascript
// Chrome DevTools > Performance
// Record page load
// Verify:
// - TTI < 3s
// - No long tasks from video loading
// - requestIdleCallback used for low priority
```

### 3. Memory Test
```javascript
// Chrome DevTools > Memory
// Take heap snapshot before/after navigation
// Verify:
// - Observers cleaned up
// - No memory leaks
// - Video elements garbage collected
```

---

## Migration Guide

### Migrating Existing Video Components

**Before:**
```typescript
function OldVideoComponent() {
  return (
    <video autoPlay loop muted playsInline>
      <source src="/videos/large-video.webm" type="video/webm" />
    </video>
  )
}
```

**After:**
```typescript
import { useLazyVideo } from '@/app/hooks/useLazyVideo'

function NewVideoComponent() {
  const [videoRef, isLoaded] = useLazyVideo({
    src: '/videos/large-video.webm',
    type: 'video/webm',
    priority: 'low',
    rootMargin: '100px',
  })

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="none"
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
    >
      Your browser does not support the video tag.
    </video>
  )
}
```

---

## Resources

### Browser Compatibility
- [Intersection Observer](https://caniuse.com/intersectionobserver): 97%+
- [requestIdleCallback](https://caniuse.com/requestidlecallback): 95%+
- [preload attribute](https://caniuse.com/link-rel-preload): 98%+

### Documentation
- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN: requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [Web.dev: Video Performance](https://web.dev/fast/#optimize-your-videos)

### Tools
- [FFmpeg](https://ffmpeg.org/) - Video compression
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [WebPageTest](https://www.webpagetest.org/) - Real-world testing

---

## Support

For questions or issues:
1. Check this guide first
2. Review test plan: `VIDEO_OPTIMIZATION_TEST_PLAN.md`
3. Read performance report: `PERFORMANCE_OPTIMIZATION_REPORT.md`
4. Contact performance engineering team
