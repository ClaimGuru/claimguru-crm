## 2. Complete Visual & Styling Specifications

This section details the complete visual and styling specifications for the ClaimGuru system, providing a comprehensive guide for recreating the application's look and feel with precision.

### 2.1. Technology Stack

*   **Styling**: TailwindCSS
*   **UI Components**: Radix UI primitives (`@radix-ui/react-*`) and a custom component library.
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Charts**: Recharts

### 2.2. Color Palette

The application utilizes a professional and modern color palette designed for clarity and visual appeal in a data-intensive application.

**Primary Colors:**
*   `primary`: `#3B82F6` (Blue-500)
*   `primary-dark`: `#2563EB` (Blue-600)
*   `primary-light`: `#60A5FA` (Blue-400)

**Secondary Colors:**
*   `secondary`: `#10B981` (Green-500)
*   `secondary-dark`: `#059669` (Green-600)
*   `secondary-light`: `#34D399` (Green-400)

**Neutral Colors:**
*   `gray-900`: `#111827`
*   `gray-800`: `#1F2937`
*   `gray-700`: `#374151`
*   `gray-600`: `#4B5563`
*   `gray-500`: `#6B7280`
*   `gray-400`: `#9CA3AF`
*   `gray-300`: `#D1D5DB`
*   `gray-200`: `#E5E7EB`
*   `gray-100`: `#F3F4F6`
*   `white`: `#FFFFFF`
*   `black`: `#000000`

**Feedback Colors:**
*   `success`: `#22C55E` (Green-500)
*   `warning`: `#FBBF24` (Amber-400)
*   `error`: `#EF4444` (Red-500)
*   `info`: `#3B82F6` (Blue-500)

### 2.3. Typography

*   **Font Family**: `Inter`, sans-serif
*   **Headings**:
    *   `h1`: 2.25rem (36px), font-bold
    *   `h2`: 1.875rem (30px), font-bold
    *   `h3`: 1.5rem (24px), font-semibold
    *   `h4`: 1.25rem (20px), font-semibold
*   **Body Text**:
    *   `p`: 1rem (16px), font-normal
    *   `small`: 0.875rem (14px), font-normal

### 2.4. Layout & Components

#### **Main Layout**
*   **Sidebar**: Collapsible, 256px expanded, 64px collapsed. Uses a dark background (`gray-800`).
*   **Header**: 64px height, light background (`white`), with a bottom border (`gray-200`).
*   **Content Area**: Main content area with a light gray background (`gray-100`).

#### **Buttons**
*   **Primary**: `bg-primary`, `text-white`, `hover:bg-primary-dark`
*   **Secondary**: `bg-secondary`, `text-white`, `hover:bg-secondary-dark`
*   **Outline**: `border border-gray-300`, `text-gray-700`, `hover:bg-gray-100`
*   **Ghost**: `text-gray-700`, `hover:bg-gray-100`

#### **Forms**
*   **Inputs**: `border-gray-300`, `rounded-md`, `focus:ring-primary`, `focus:border-primary`
*   **Labels**: `font-medium`, `text-gray-700`

#### **Cards**
*   `bg-white`, `rounded-lg`, `shadow-md`, `p-6`

### 2.5. Iconography

*   **Library**: Lucide React
*   **Size**: Default size 20px, adjustable as needed.
*   **Usage**: Used for navigation, buttons, and status indicators.

### 2.6. Animations

*   **Library**: Framer Motion
*   **Usage**:
    *   Page transitions (fade-in)
    *   Modal pop-ups (scale-in)
    *   Sidebar collapse/expand (width transition)
    *   Button hover effects (slight scale-up)

### 2.7. Charts & Data Visualization

*   **Library**: Recharts
*   **Chart Types**:
    *   **Bar Charts**: Used for comparisons (e.g., monthly sales).
    *   **Line Charts**: Used for trends over time (e.g., claims volume).
    *   **Pie Charts**: Used for proportions (e.g., claim status distribution).
    *   **Area Charts**: Used for cumulative data (e.g., revenue over time).
*   **Color Palette**: Uses the primary and secondary color palettes for data series.
*   **Tooltips**: Custom tooltips with detailed information on hover.
*   **Responsive**: Charts are responsive and adapt to container size.
