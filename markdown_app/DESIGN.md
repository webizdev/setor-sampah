# Design System Document: The Organic Breath

## 1. Overview & Creative North Star
**Creative North Star: "The Living Archive"**

In the waste management sector, we often face "utility fatigue"—apps that feel industrial, cold, and transactional. This design system rejects the "utility-first" aesthetic in favor of a **High-End Editorial** approach. We treat sustainability not as a chore, but as a prestigious, lifestyle-driven contribution to the planet.

By utilizing **intentional asymmetry**, **exaggerated white space**, and **tonal layering**, we move away from the "grid of boxes" typical of logistics apps. The experience should feel like flipping through a premium architectural or environmental journal: breathable, sophisticated, and deeply intentional.

---

## 2. Colors & Surface Architecture

The palette is rooted in deep botanical greens (`primary`) and supplemented by fertile, earthy tones (`tertiary`). This isn't just about "looking eco-friendly"; it's about establishing a premium hierarchy.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. 
*   *Implementation:* Instead of a line between items, place a `surface-container-low` card on a `surface` background.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define depth:
*   **Base:** `surface` (#f8f9fa)
*   **Sectioning:** `surface-container-low` (#f3f4f5) to group related content.
*   **Emphasis:** `surface-container-lowest` (#ffffff) for primary interactive cards.
*   **Depth:** `surface-container-highest` (#e1e3e4) for persistent navigation or utility bars.

### The Glass & Gradient Rule
To prevent the UI from feeling "flat" or "cheap," use **Glassmorphism** for floating elements (e.g., sticky headers or FABs). Apply `surface` at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should use a subtle linear gradient from `primary` (#0f5238) to `primary_container` (#2d6a4f) at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: Editorial Authority

We use a dual-sans-serif pairing to balance character with extreme readability.

*   **Display & Headlines (Plus Jakarta Sans):** These are your "Editorial Voice." Use `display-lg` and `headline-md` with tight letter-spacing (-0.02em) to create an authoritative, premium feel. Don't be afraid to use `headline-lg` for short, punchy statements even in small viewports.
*   **Body & Labels (Manrope):** Chosen for its geometric clarity and high x-height. Manrope handles the "Utility" aspect. Use `body-md` for general content and `label-md` for metadata.
*   **Asymmetric Scaling:** Use `display-sm` for hero numbers (e.g., "24kg recycled") paired with a very small `label-sm` in all caps to create a high-contrast, modern layout.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are often "dirty." In this system, we achieve lift through color logic and ambient light.

*   **The Layering Principle:** Place a `surface-container-lowest` card (Pure White) on top of a `surface-container-low` background. The slight shift in luminosity provides enough affordance for "tappability" without visual clutter.
*   **Ambient Shadows:** If a floating action requires a shadow, use a large blur (32px) at 6% opacity. Use the `on-surface` color (#191c1d) as the shadow base—never pure black.
*   **The Ghost Border:** If accessibility requires a border (e.g., in high-contrast modes), use the `outline_variant` token at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_container`), `xl` (1.5rem) rounded corners. Text in `on_primary`.
*   **Secondary:** `surface-container-high` background with `primary` colored text. No border.
*   **Tertiary:** No background. Use `title-sm` typography with an icon, utilizing `tertiary` (#693c1d) for a sophisticated "earth" accent.

### Cards & Lists
*   **The Rule of Zero Dividers:** Forbid divider lines. Use `16px` or `24px` vertical spacing to separate content blocks.
*   **The "Eco-Clip":** Use `xl` (1.5rem) rounding for cards to feel approachable, but use `sm` (0.25rem) for small chips to maintain a professional edge.

### Input Fields
*   **Style:** Minimalist. `surface-container-low` background, `xl` corner radius, no border.
*   **Focus State:** Transition the background to `surface-container-lowest` and add a subtle `outline` (#707973) at 20% opacity.

### Specific App Components
*   **Waste Trackers:** Use thick, `full` (9999px) rounded progress bars using `secondary` (#1f6d1a) against a `secondary_container` track.
*   **Collection Scheduling:** Use a horizontal "Filmstrip" layout rather than a standard vertical list to break the "logistics app" mold.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Void:** Use generous white space. If a screen feels "full," it’s likely over-designed.
*   **Layer Sustainably:** Use `surface-container` tiers to create a visual path for the user’s eye.
*   **Use Soft-Rounding:** Always use `lg` (1rem) or `xl` (1.5rem) for main UI containers to maintain the "approachable" brand promise.

### Don’t:
*   **Don't use 1px lines:** They create "visual noise" that breaks the premium editorial feel.
*   **Don't use pure black:** Use `on_surface` (#191c1d) for text to keep the contrast natural and "organic."
*   **Don't crowd icons:** Friendly icons need "room to breathe." Ensure icon containers have at least 12px of internal padding.