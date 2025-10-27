# Video Loading Optimization - Test Plan

## Overview
This test plan validates the performance optimizations implemented for video loading on the splash page.

## Pre-Test Setup

### 1. Clear Browser Cache
```javascript
// Chrome DevTools Console
// Application > Storage > Clear site data
```

### 2. Enable Network Throttling
```
Chrome DevTools > Network tab > Throttling dropdown
- Fast 3G (for slow connection testing)
- Slow 3G (for worst-case scenario)
- No throttling (for baseline)
```

### 3. Enable Performance Monitoring
```
Chrome DevTools > Performance tab > Enable screenshots
Chrome DevTools > Network tab > Preserve log
```

---

## Test Suite 1: Functional Testing

### Test 1.1: Lazy Loading Triggers
**Objective**: Verify videos only load when component is visible

**Steps**:
1. Open Chrome DevTools > Network tab
2. Filter by "media" or "webm/mp4"
3. Load the page
4. Observe network requests

**Expected Results**:
- No video requests on initial page load (first 500ms)
- ScrollingVideo component triggers when it enters viewport (100px margin)
- VideoBackground triggers when it enters viewport (50px margin)
- All videos have `preload="none"` attribute

**Pass Criteria**: Videos load only when within specified rootMargin of viewport

---

### Test 1.2: Progressive Loading Priority
**Objective**: Verify carousel loads before logo

**Steps**:
1. Clear cache
2. Open DevTools > Network tab
3. Load page and scroll to ScrollingVideo component
4. Watch network requests in order

**Expected Results**:
1. Carousel.webm starts loading first (~1.5s after visible)
2. w3SLogo.webm starts loading second (~3s after visible)
3. Carousel finishes and plays before logo

**Pass Criteria**:
- Carousel requests initiate before logo
- Timing: carousel ~1.5s, logo ~3s
- Carousel is playing while logo is still loading

---

### Test 1.3: Autoplay Preservation
**Objective**: Verify videos autoplay after lazy load

**Steps**:
1. Load page
2. Scroll to each video component
3. Wait for videos to load

**Expected Results**:
- Background.mp4 autoplays when visible
- Carousel.webm (all 3 instances) autoplay when visible
- w3SLogo.webm autoplays when loaded
- All videos loop continuously

**Pass Criteria**: All videos autoplay without user interaction

---

### Test 1.4: Smooth Transitions
**Objective**: Verify fade-in animations work

**Steps**:
1. Load page with DevTools > Performance tab recording
2. Scroll to video components
3. Observe visual transitions

**Expected Results**:
- Videos fade in smoothly (opacity 0 → 1 or 0.1)
- Transition duration: 0.5s for ScrollingVideo, 0.3s for VideoBackground
- No jarring appearance or layout shifts
- CLS (Cumulative Layout Shift) < 0.1

**Pass Criteria**: Smooth, professional transitions with no visual glitches

---

### Test 1.5: State Management
**Objective**: Verify videos don't reload on re-render

**Steps**:
1. Load page and scroll to videos
2. Wait for all videos to load
3. Scroll away and back
4. Check Network tab for duplicate requests

**Expected Results**:
- Videos do not reload when scrolling away/back
- State flags prevent duplicate loads (isLoaded, carouselLoaded, logoLoaded)
- Video playback resumes where it left off

**Pass Criteria**: No duplicate network requests after initial load

---

## Test Suite 2: Performance Testing

### Test 2.1: Initial Page Load
**Objective**: Measure reduction in initial page weight

**Steps**:
1. Clear cache
2. Open DevTools > Network tab
3. Load page (don't scroll)
4. Wait 3 seconds
5. Check "Transferred" size in Network tab footer

**Expected Results**:
- BEFORE optimization: ~40.5MB transferred
- AFTER optimization: < 500KB transferred (no videos)
- Videos NOT in network requests during first 3s

**Pass Criteria**:
- Initial transfer < 500KB
- 90%+ reduction in initial page weight

---

### Test 2.2: Time to Interactive (TTI)
**Objective**: Verify page becomes interactive faster

**Steps**:
1. Clear cache
2. Open DevTools > Performance tab
3. Click record
4. Load page
5. Wait for page to be fully interactive
6. Stop recording
7. Analyze "Time to Interactive" metric

**Expected Results**:
- TTI < 3s (desktop)
- TTI < 5s (mobile/3G)
- Videos don't block main thread
- JavaScript executes immediately

**Pass Criteria**: TTI improves by 50%+ vs baseline

---

### Test 2.3: Lighthouse Audit
**Objective**: Achieve 90+ performance score

**Steps**:
1. Open Chrome DevTools > Lighthouse tab
2. Select "Performance" only
3. Select "Desktop" mode
4. Run audit
5. Review metrics

**Expected Results**:
- Performance score: 90+
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

**Pass Criteria**:
- Performance score ≥ 90
- All Core Web Vitals in "green" zone

---

### Test 2.4: Network Waterfall
**Objective**: Verify critical resources load first

**Steps**:
1. Clear cache
2. Open DevTools > Network tab
3. Load page
4. Expand "All" filter
5. Review waterfall chart

**Expected Results**:
- HTML loads first
- CSS/JS load before videos
- Videos load last (after idle callback)
- No request blocking

**Pass Criteria**: Videos are at bottom of waterfall, not blocking critical resources

---

### Test 2.5: requestIdleCallback Behavior
**Objective**: Verify videos load during browser idle time

**Steps**:
1. Open DevTools > Performance tab
2. Enable "Main" thread view
3. Record page load and scroll to videos
4. Analyze main thread activity

**Expected Results**:
- Video loading tasks occur during idle periods
- No long tasks (> 50ms) caused by video loading
- Main thread remains responsive

**Pass Criteria**: Video loads don't cause long tasks or block interactivity

---

## Test Suite 3: Browser Compatibility

### Test 3.1: Modern Browsers (requestIdleCallback)
**Browsers**: Chrome 47+, Edge 79+, Firefox 55+

**Steps**:
1. Test on each browser
2. Verify requestIdleCallback is used (check console logs if added)
3. Verify videos load and play

**Expected Results**:
- requestIdleCallback executes
- Videos load during idle time
- All functionality works

**Pass Criteria**: Full functionality on all modern browsers

---

### Test 3.2: Safari (setTimeout Fallback)
**Browsers**: Safari 13+, Mobile Safari

**Steps**:
1. Test on Safari (requestIdleCallback not supported)
2. Verify setTimeout fallback triggers
3. Verify videos load and play

**Expected Results**:
- setTimeout fallback executes (100ms delay)
- Videos still load progressively
- Slightly less optimal timing, but functional

**Pass Criteria**: Videos load and play correctly via fallback

---

### Test 3.3: Mobile Devices
**Devices**: iPhone (Safari), Android (Chrome)

**Steps**:
1. Test on physical devices or emulator
2. Test on 3G connection
3. Verify touch interactions don't interfere
4. Check video playback

**Expected Results**:
- Intersection Observer works on mobile
- Videos load when scrolling
- Autoplay works (muted videos)
- Smooth performance on mobile

**Pass Criteria**: Full functionality on mobile devices

---

### Test 3.4: Slow Connections
**Objective**: Verify graceful degradation on slow networks

**Steps**:
1. Enable Slow 3G throttling
2. Load page
3. Scroll to videos
4. Observe loading behavior

**Expected Results**:
- Page remains interactive while videos load
- Progressive enhancement works
- No timeout errors
- Videos eventually load and play

**Pass Criteria**: Page usable even if videos take 30s+ to load

---

## Test Suite 4: Edge Cases

### Test 4.1: Rapid Scrolling
**Objective**: Verify no duplicate loads with rapid scroll

**Steps**:
1. Load page
2. Rapidly scroll up and down through video components
3. Check Network tab for duplicate requests

**Expected Results**:
- Observer properly disconnects after first trigger
- State flags prevent duplicate loads
- No memory leaks

**Pass Criteria**: Videos load once, even with rapid scrolling

---

### Test 4.2: Browser Back/Forward
**Objective**: Verify behavior with navigation

**Steps**:
1. Load page, scroll to videos
2. Navigate to another page
3. Click browser back button
4. Check if videos reload

**Expected Results**:
- Videos may reload (expected with cache)
- No errors or broken state
- Smooth re-initialization

**Pass Criteria**: Videos work correctly after back/forward navigation

---

### Test 4.3: Autoplay Blocked
**Objective**: Handle autoplay policy restrictions

**Steps**:
1. Disable autoplay in browser settings
2. Load page and scroll to videos
3. Check console for errors

**Expected Results**:
- Graceful error handling
- Console logs "Video autoplay prevented"
- Videos still load but don't play
- User can manually click play

**Pass Criteria**: No uncaught errors, graceful degradation

---

### Test 4.4: Video Load Failures
**Objective**: Handle 404 or network errors

**Steps**:
1. Temporarily rename video files (simulate 404)
2. Load page
3. Check error handling

**Expected Results**:
- No JavaScript errors
- Fallback content shows ("Your browser does not support...")
- Page remains functional

**Pass Criteria**: Graceful degradation, no broken UI

---

## Test Suite 5: Accessibility

### Test 5.1: Screen Reader Compatibility
**Objective**: Verify ARIA attributes work

**Tools**: NVDA (Windows), VoiceOver (Mac), JAWS

**Steps**:
1. Enable screen reader
2. Navigate to video components
3. Verify announcements

**Expected Results**:
- Background videos: aria-hidden="true" (not announced)
- Logo video: aria-label="w3stream animated logo" (announced)
- Proper role attributes
- No confusing announcements

**Pass Criteria**: Decorative videos hidden, meaningful videos labeled

---

### Test 5.2: Keyboard Navigation
**Objective**: Verify no keyboard traps

**Steps**:
1. Use Tab key to navigate page
2. Verify no focus on pointer-events-none videos
3. Check for keyboard traps

**Expected Results**:
- Videos with pointer-events-none don't receive focus
- No keyboard traps
- Logical tab order

**Pass Criteria**: Videos don't interfere with keyboard navigation

---

### Test 5.3: Reduced Motion
**Objective**: Respect prefers-reduced-motion

**Note**: Current implementation doesn't check for reduced motion preference. Consider adding:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// If prefersReducedMotion, skip video loading or pause immediately
```

**Expected Results**:
- Videos respect user motion preferences
- Smooth experience for motion-sensitive users

**Pass Criteria**: Videos can be disabled for reduced motion preference

---

## Test Suite 6: Memory & Resource Management

### Test 6.1: Memory Leaks
**Objective**: Verify proper cleanup

**Steps**:
1. Open DevTools > Memory tab
2. Take heap snapshot
3. Navigate to page with videos
4. Navigate away
5. Force garbage collection
6. Take another heap snapshot
7. Compare

**Expected Results**:
- Observers properly disconnected
- Event listeners removed
- Video elements garbage collected
- No significant memory growth

**Pass Criteria**: < 5MB memory growth after cleanup

---

### Test 6.2: Multiple Page Visits
**Objective**: Verify no resource accumulation

**Steps**:
1. Load page 10 times (with navigation)
2. Monitor memory and network usage
3. Check for resource accumulation

**Expected Results**:
- Consistent memory usage across visits
- Browser cache utilized
- No exponential resource growth

**Pass Criteria**: Memory stable across multiple visits

---

## Performance Benchmarks

### Target Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Initial Load | < 500KB | 1MB |
| TTI | < 3s | 5s |
| FCP | < 1.5s | 2.5s |
| LCP | < 2.5s | 4s |
| TBT | < 200ms | 500ms |
| CLS | < 0.1 | 0.25 |
| Performance Score | 90+ | 70+ |

### Video Load Timing
| Video | Priority | Target Load Time | Max Load Time |
|-------|----------|------------------|---------------|
| carousel.webm | Medium | 1.5s after visible | 5s |
| w3SLogo.webm | Low | 3s after visible | 10s |
| background.mp4 | Medium | 2s after visible | 5s |

---

## Regression Testing

### Before Deployment
- [ ] Run full test suite
- [ ] Verify all pass criteria met
- [ ] Document any failures
- [ ] Get stakeholder approval

### After Deployment
- [ ] Monitor real user metrics (RUM)
- [ ] Track video load success rate
- [ ] Monitor Core Web Vitals
- [ ] Set up alerts for regressions

---

## Test Results Template

```markdown
## Test Execution: [Date]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]
- Network: [Fast/Slow/No throttling]

### Results
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Lazy Loading Triggers | PASS/FAIL | |
| 1.2 | Progressive Loading Priority | PASS/FAIL | |
| ... | ... | ... | |

### Performance Metrics
- Initial Load: [KB]
- TTI: [seconds]
- FCP: [seconds]
- LCP: [seconds]
- Performance Score: [0-100]

### Issues Found
1. [Description]
2. [Description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## Rollback Criteria

Rollback if:
- Performance score drops below 70
- Video load success rate < 90%
- TTI increases by > 50%
- Critical bugs in video playback
- Accessibility violations

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Performance Engineer | | | |
| Frontend Lead | | | |
| Product Manager | | | |
