# Eddie Design Rules - Flutter Web UI Modernization

**Goal**: Awe-inspiring Flutter web UI that prioritizes content over legacy styling.

## 1) Material 3 First

- `useMaterial3: true`
- `ColorScheme.fromSeed(brandSeed)`
- Light/Dark supported; no hardcoded colors (use tokens)

## 2) Adaptive Layout (Content-Led)

- **Breakpoints**: <600 mobile, 600–1024 tablet, >1024 desktop
- **Max content width**: ~1200px; reading width 60–75ch
- **8pt spacing scale**: 4,8,12,16,24,32,48,64

## 3) Navigation by Size

- **Mobile**: Bottom nav + top app bar
- **Tablet**: Nav rail + app bar
- **Desktop**: Permanent side nav or rail + app bar

## 4) Typography That Sells the Message

- `Typography.material2021()` + GoogleFonts
- Headings clamp 1–2 lines; body LH ~1.4–1.6
- Clear hierarchy: Display → Headline → Title → Body/Label

## 5) Motion = Micro, Not Flashy

- Durations ~150–300ms, Material easing
- Page transitions, button presses, list reorders, hero images

## 6) Components & Shape Language

- Corners 12–16; low elevation; subtle dividers
- Use chips/cards/banners for scannability; avoid dense borders

## 7) Images as First-Class Content

- Optimize to WebP/AVIF; responsive sizes; lazy-load
- Preserve alt text/captions; support dark overlays for legibility

## 8) Accessibility (Must-Pass)

- Contrast ≥ 4.5:1; min hit target 44×44
- Visible focus; semantic labels; textScaleFactor up to 1.3+

## 9) Performance Guardrails

- 60fps target; precache hero media; cache images
- Tree-shake icons; avoid unnecessary rebuilds; const where possible

## 10) States & Polish

- Skeleton loaders + friendly empty/error states
- Per-route titles/meta; PWA manifest/service worker (Flutter web)

## Acceptance Criteria

- **Lighthouse**: Performance ≥ 90, Accessibility ≥ 90
- **No hardcoded colors**; all via Theme tokens
- **Content JSON renders** with correct heading hierarchy & spacing

---

_This document serves as the definitive guide for all Flutter web UI modernization in the Eddie system._
