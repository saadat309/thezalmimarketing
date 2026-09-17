# UI Component Library Reference

The component library resides in `src/components/` and is structured into reusable UI primitives (`src/components/ui/`), domain-specific property components (`src/components/property/`), marketing landing sections (`src/components/home/`), and administrative dashboard widgets (`src/components/dashboard/`).

---

## 1. UI Primitives (`src/components/ui/`)

Built on top of **Radix UI primitives** and styled with Tailwind CSS v4 and `class-variance-authority` (`cva`):
- **Buttons (`button.jsx`):** Supports variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes (`sm`, `md`, `lg`, `icon`).
- **Dialogs & Sheets (`dialog.jsx`, `sheet.jsx`, `alert-dialog.jsx`):** Accessible modals, side drawers, and confirmation dialogs powered by Radix primitives.
- **Data Tables (`table.jsx`, `data-table.jsx`, `CrudDataTable.jsx`):** Built with `@tanstack/react-table`, supporting sorting, pagination, row selection, and column visibility.
- **Form Controls (`input.jsx`, `textarea.jsx`, `select.jsx`, `checkbox.jsx`, `radio-group.jsx`, `switch.jsx`):** Integrated with `react-hook-form` and `zod` validation schemas.
- **Feedback & Overlays (`tooltip.jsx`, `popover.jsx`, `sonner.jsx`, `skeleton.jsx`, `spinner.jsx`):** Toast notifications via Sonner, loading skeletons, and floating tooltips.
- **Carousels & Sliders (`carousel.jsx`, `EmblaCarousel.jsx`, `ImageSlider.jsx`):** Powered by `embla-carousel-react` for smooth property image galleries and full-screen viewers.

---

## 2. Domain & Feature Components

- **Home & Marketing Sections (`src/components/home/`):**
  - `HeroSection.jsx`: Dynamic landing hero with search triggers and background imagery.
  - `CardGrid.jsx` & `CardSlider.jsx`: Responsive property and society card displays.
  - `ReviewSection.jsx`, `WhyUs.jsx`, `HowItWorksSection.jsx`: Conversion-focused marketing components.
  - Landing Page Editor components for managing dynamic hero/content sections.
- **Property Views (`src/components/property/`):**
  - `ImageSlider.jsx` & `FullscreenImageViewer.jsx`: Immersive property photo galleries.
- **Dashboard Administrative Widgets (`src/components/dashboard/`):**
  - `DashboardLayout.jsx`, `site-header.jsx`, `section-cards.jsx`: Administrative navigation and statistics summary cards.
  - `CrudDataTable.jsx`: Reusable CRUD table wrapper for managing database entities.
  - `QuillRichText.jsx`: Rich text editor integration for descriptions and announcements.
  - **Calculator Widgets:** Administrative interface components for managing property transfer fees, tax rates, rates, property types, phases, and fee rules.
