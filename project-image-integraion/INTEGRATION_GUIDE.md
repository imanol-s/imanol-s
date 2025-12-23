# Animated Cover Image Integration Guide

## Overview

These lightweight Astro components play generative animations once (6 seconds), then freeze. Perfect for project cover images with smooth, aesthetic settling effects.

---

## Installation

### 1. Copy Component Files

Place these files in your `src/components/` directory:

```
src/components/
├── RoboticsAnimation.astro
└── DallasAnimation.astro
```

### 2. Ensure p5.js is Available

The components auto-load p5.js from CDN if needed. No additional setup required.

---

## Usage

### Option A: Replace Static Images in MDX Files

**Before (static image):**

```mdx
---
cover: "./images/robotics-nav/cover.webp"
---
```

**After (animated component):**

```mdx
---
cover: null # Set to null when using component
useAnimatedCover: true
animatedCoverComponent: "RoboticsAnimation"
animatedCoverSeed: 42
---
```

Then modify your `[id].astro` template to conditionally render:

```astro
---
// In src/pages/projects/[id].astro
import RoboticsAnimation from '@/components/RoboticsAnimation.astro';
import DallasAnimation from '@/components/DallasAnimation.astro';

const { useAnimatedCover, animatedCoverComponent, animatedCoverSeed, cover } = post.data;
---

{useAnimatedCover ? (
    animatedCoverComponent === 'RoboticsAnimation' ?
        <RoboticsAnimation seed={animatedCoverSeed} /> :
        <DallasAnimation seed={animatedCoverSeed} />
) : (
    <Image transition:name={`${post.id}-image`} class="rounded-2xl" src={cover} alt="Main project image"/>
)}
```

### Option B: Direct Import in Project Pages

**For Robotics Project** (create custom page or replace template):

```astro
---
import RoboticsAnimation from '@/components/RoboticsAnimation.astro';
---

<Layout title="Autonomous Robotics Navigation">
    <RoboticsAnimation seed={42} />
    <!-- Rest of your content -->
</Layout>
```

**For Dallas Crime Project:**

```astro
---
import DallasAnimation from '@/components/DallasAnimation.astro';
---

<Layout title="Dallas Crime Housing Analysis">
    <DallasAnimation seed={42} />
    <!-- Rest of your content -->
</Layout>
```

### Option C: Mixed Approach (Recommended for Your Portfolio)

Keep static images for project cards (performance), use animations on individual project pages:

**Project Card (homepage) - Keep static:**

```astro
<!-- src/components/ProjectCard.astro -->
<Image src={cover} alt={title} />
```

**Individual Project Page - Use animation:**

```astro
<!-- src/pages/projects/robotics.astro -->
<RoboticsAnimation seed={42} />
```

---

## Customization

### Different Seeds

Each seed produces a unique variation:

```astro
<RoboticsAnimation seed={42} />   <!-- Variation 1 -->
<RoboticsAnimation seed={127} />  <!-- Variation 2 -->
<DallasAnimation seed={999} />    <!-- Variation 3 -->
```

### Adjust Animation Duration

Edit the component file:

```js
const ANIMATION_DURATION = 360; // 6 seconds at 60fps
// Change to 480 for 8 seconds, or 240 for 4 seconds
```

### Canvas Size

Default is 800x800px. Modify in component:

```js
const canvas = p.createCanvas(1000, 1000); // Larger
const canvas = p.createCanvas(600, 600); // Smaller
```

---

## Performance Tips

### ✅ Good Practices:

1. **Use on individual pages only** - Not on listing pages with multiple animations
2. **Lazy load if below fold** - Add Intersection Observer if needed
3. **Test on mobile** - Animations pause when tab is inactive (built-in optimization)

### 🚫 Avoid:

1. **Multiple animations on one page** - Limit to 1-2 per page
2. **Animations in project card lists** - Too heavy for performance
3. **Very large canvas sizes** - Keep under 1200x1200px

---

## Recommended Integration for Your Portfolio

Based on your current structure:

### 1. Autonomous Robotics Navigation Project

**File:** `src/content/projects/autonomous-robotics-navigation-project.mdx`

**Add to frontmatter:**

```mdx
---
title: Autonomous Robotics Navigation Project
# ... existing fields
useAnimatedCover: true
animatedCoverComponent: "RoboticsAnimation"
animatedCoverSeed: 42
---
```

### 2. Dallas Crime Housing Analysis

**File:** `src/content/projects/dallas-crime-housing-analysis.mdx`

**Add to frontmatter:**

```mdx
---
title: Dallas Crime Effect on Housing Price Analysis
# ... existing fields
useAnimatedCover: true
animatedCoverComponent: "DallasAnimation"
animatedCoverSeed: 77
---
```

### 3. Modify Project Template

**File:** `src/pages/projects/[id].astro`

Add conditional rendering (see Option A above).

---

## Fallback for Static Builds

If you need static images for SEO/social sharing:

### Generate Static Fallbacks:

1. Open each HTML file in browser
2. Let animation complete
3. Right-click canvas → "Save image as..."
4. Save as `cover-static.webp`
5. Use as `ogImage` in MDX frontmatter

```mdx
---
cover: null # Animated on page
ogImage: "./images/robotics-nav/cover-static.webp" # Static for social
useAnimatedCover: true
---
```

---

## Testing

### 1. Visual Test:

- Animation should play for 6 seconds
- Should freeze at final state (not loop)
- Should be smooth (60fps)

### 2. Performance Test:

```js
// Open browser console
performance.measure("animation-duration");
// Should complete in ~6 seconds
```

### 3. Mobile Test:

- Check on actual device or Chrome DevTools mobile emulation
- Verify animations pause when tab inactive

---

## Troubleshooting

### Animation doesn't appear:

- Check browser console for errors
- Verify p5.js loaded: `console.log(typeof p5)`
- Check component import path

### Animation loops instead of stopping:

- Verify `animationComplete` flag is working
- Check `ANIMATION_DURATION` value

### Performance issues:

- Reduce `explorerCount` / `pointCount` parameters
- Decrease canvas size
- Use only on individual project pages

---

## Next Steps

1. Copy `RoboticsAnimation.astro` and `DallasAnimation.astro` to `src/components/`
2. Choose integration approach (Option A, B, or C)
3. Test on localhost
4. Adjust seeds to find your favorite variations
5. Deploy and enjoy! 🎨
