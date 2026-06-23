# DeepFlow UI/UX Design System & Animation Lifecycle (Layer 1 SOP)

This document establishes the UI/UX design rules, design tokens, and animation guidelines for DeepFlow to ensure visual consistency and a premium "Midnight Luxe" aesthetic.

---

## 1. Design Tokens

### Color Palette (Midnight Luxe)
- **Obsidian (Base background)**: `#0D0D12` (HSL: `240, 17%, 6%`)
- **Ivory (Base text & contrast)**: `#FAF8F5` (HSL: `36, 20%, 98%`)
- **Flow Gold (Primary Accent)**: `#F59E0B` (HSL: `38, 92%, 50%`)
- **Warning Coral (Idle Alert)**: `#EF4444` (HSL: `0, 84%, 60%`)
- **Muted Stone (Borders & secondary labels)**: `#27272A` (HSL: `240, 5%, 16%`)
- **Glass Shading (Card backgrounds)**: `rgba(20, 18, 16, 0.4)`

### Typography
- **Primary / Body Font**: `Inter`, sans-serif (clean, high readability for text inputs and stats).
- **Secondary / Heading Font**: `Playfair Display`, serif (editorial, elegant, grounding for headers and titles).
- **Fallback Font Stack**: `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Georgia`, serif.

### Layout & Borders
- **Border Radius**: Bento cells use `1.5rem` (`24px`), buttons use `0.5rem` (`8px`) or are fully pill-shaped.
- **Glassmorphism**: `backdrop-filter: blur(24px) saturate(120%)` with a `1px` semi-transparent border (`rgba(255, 255, 255, 0.06)`).

---

## 2. Animation Lifecycles & GSAP Rules

To ensure animations feel weighted, physical, and intentional rather than floaty:

### GSAP Context Management
- All GSAP animations must be scoped within a React component using `gsap.context()`. This ensures clean memory lifecycle management and prevents memory leaks during page state switches.
- Clean up the context inside the React `useEffect` cleanup return function:
  ```javascript
  useEffect(() => {
    const ctx = gsap.context(() => {
      // animations here
    }, containerRef);
    return () => ctx.revert(); // clean up all animations
  }, []);
  ```

### State-Driven Transitions
- **Idle State**: Soft, slow pulsing (scale variance between `1.0` and `1.03`, duration `3s`, ease `"power1.inOut"`).
- **Writing State**: Fluid morphing path transition, scale `1.1`, rotation drift (duration `1.5s`, ease `"sine.out"`).
- **Warning State**: Rapid red jittering and bouncing (duration `0.1s`, back-and-forth x-translation of `2px`, ease `"rough"`).
- **Guillotined State**: Elastic scale down to `0.8` with immediate grayscale color saturation filter (ease `"bounce.out"`).
- **Completed State**: Expansion ring burst (scale `2.0`, opacity fade to `0`, duration `1s`).

---

## 3. Asymmetrical Layout Rule (Bento Box / Editorial)
- DeepFlow rejects the standard three-column app dashboard.
- It enforces a **60/40 Asymmetrical grid**:
  - The left 60% width is dedicated to the core editor canvas (Writing Arena) as an editorial writing instrument.
  - The right 40% width is stacked with Bento Cells for the Flow Orb, setup metrics, and neuro-acoustic controls.
