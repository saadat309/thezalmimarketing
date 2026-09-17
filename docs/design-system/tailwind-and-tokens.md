# Tailwind CSS v4 & Design Tokens

The design system is powered by **Tailwind CSS v4** (`@tailwindcss/vite`) and custom CSS variables defined in `src/styles/index.css`.

---

## 1. CSS Variables & Theme Integration

Custom CSS variables govern colors, typography, border radii, and shadows, allowing dynamic theme switching (via `next-themes`):

- **Primary Brand Colors:** Deep corporate blues and dark slate tones representing stability and luxury real estate.
- **Neutral Scales:** Slate and zinc ramps (`--background`, `--foreground`, `--muted`, `--card`, `--border`) ensuring harmonious contrast.
- **Semantic Status Colors:**
  - Success: Emerald green (`--success`)
  - Warning: Amber yellow (`--warning`)
  - Destructive: Crimson red (`--destructive`)

---

## 2. Typography Scale

- **Font Family:** Inter / system sans-serif font stack.
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700).
- **Line Heights:** Tightly clamped headings (`leading-tight`) and readable body text (`leading-relaxed`).

---

## 3. Shadows, Borders & Animations

- **Border Radius:** Consistent curve tokens (`--radius: 0.5rem`, `rounded-lg`, `rounded-md`).
- **Shadows:** Soft elevation shadows (`shadow-sm`, `shadow-md`, `shadow-xl`) for cards, floating headers, and modal dialogs.
- **Transitions:** Smooth CSS transitions and `tailwindcss-animate` keyframes for dialog opens, accordion expansions, and hover micro-interactions.
