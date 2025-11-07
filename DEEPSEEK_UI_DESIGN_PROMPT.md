# DeepSeek UI Design Prompt Template

Copy and paste this entire prompt into DeepSeek when you need UI design assistance:

---

## Project Context

I'm working on a **Next.js 14** e-commerce website for a chicken restaurant called "K2 Chicken" using:

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React functional components with hooks
- **Icons**: Lucide React (`lucide-react`)

## Current Design System

**Color Palette:**

- Primary: Orange (#EA580C) to Red (#DC2626) gradients
- Background: White with subtle gradients (orange-50, red-50)
- Text: Gray-900 for headings, Gray-600/700 for body
- Accents: Orange-600, Red-600 for CTAs

**Design Principles:**

- Clean, modern, minimal design
- Light backgrounds (white, gray-50, subtle gradients)
- Rounded corners (xl, 2xl)
- Subtle shadows and hover effects
- Smooth transitions (duration-200, duration-300)
- Gradient buttons (orange-600 to red-600)
- Glassmorphism effects (backdrop-blur, white/opacity)

**Typography:**

- Headings: Font-extrabold, Font-bold
- Body: Font-medium, Font-light
- Sizes: text-xl to text-8xl for hero sections

## Component Structure Example

```tsx
"use client";

import { useState } from "react";
import { IconName } from "lucide-react";

export default function ComponentName() {
  const [state, setState] = useState();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content */}
      </div>
    </section>
  );
}
```

## Important Requirements

1. **ALWAYS use the same tech stack**: Next.js 14, TypeScript, Tailwind CSS, React hooks
2. **ALWAYS use 'use client' directive** for interactive components
3. **ALWAYS use Lucide React icons** (import from 'lucide-react')
4. **ALWAYS follow the color scheme**: Orange/Red gradients, white backgrounds
5. **ALWAYS use Tailwind utility classes** - NO custom CSS files
6. **ALWAYS use functional components** with TypeScript interfaces
7. **ALWAYS maintain responsive design** (mobile-first with md:, lg: breakpoints)
8. **ALWAYS use the same spacing system**: py-20 for sections, gap-4/gap-6 for grids
9. **ALWAYS use rounded-xl or rounded-2xl** for modern look
10. **ALWAYS include hover states** with transition-all duration-200/300

## Current Component Examples

**Hero Section Style:**

- Light gradient background (from-orange-50 via-white to-red-50)
- Large gradient text headings
- Gradient CTA buttons
- Trust indicator cards with icons

**Product Cards:**

- White background with border-gray-200
- Rounded-2xl corners
- Hover: shadow-xl, border-orange-300
- Gradient price text
- Gradient add-to-cart buttons

**Header:**

- White/95 backdrop-blur
- Gradient logo badge
- Clean navigation links
- Orange hover states

## Your Task

When I ask for UI designs, please provide:

1. **Complete TypeScript/React component code** (not just HTML/CSS)
2. **Use Next.js 14 App Router patterns** ('use client' for interactivity)
3. **Use Tailwind CSS classes** exclusively
4. **Match the existing design system** (colors, spacing, typography)
5. **Include TypeScript interfaces** for props/state
6. **Make it responsive** (mobile, tablet, desktop)
7. **Include hover states and transitions**
8. **Use Lucide React icons** for all icons
9. **Follow the component structure** shown above
10. **Maintain consistency** with the existing codebase style

## Example Request Format

When I say: "Design a new feature section"
You should provide:

- Complete `.tsx` file code
- TypeScript interfaces
- Tailwind CSS classes
- Responsive design
- Hover effects
- Matching color scheme
- Lucide icons

**DO NOT:**

- Use CSS modules or styled-components
- Use inline styles (except for dynamic values)
- Use other icon libraries
- Use different color schemes
- Skip TypeScript types
- Ignore responsive design

---

## Ready to Use

Now, when I ask you to design any UI component, please follow all the guidelines above and provide complete, production-ready code that matches this codebase's style and tech stack.

---
