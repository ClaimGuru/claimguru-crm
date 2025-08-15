# Package Dependency Cleanup Recommendations

## Potentially Unused Dependencies

The following dependencies were not found in the source code analysis:

- `@hookform/resolvers`
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-toast`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`
- `@tanstack/react-query`
- `@tanstack/react-table`
- `@types/google.maps`
- `cmdk`
- `embla-carousel-react`
- `input-otp`
- `next-themes`
- `react-dropzone`
- `react-hook-form`
- `react-resizable-panels`
- `recharts`
- `sonner`
- `tailwindcss-animate`
- `tesseract.js`
- `zod`

## Recommended Actions

1. Review each dependency manually to confirm it's not used
2. Check if dependencies are used in configuration files or build scripts
3. Remove confirmed unused dependencies with: `pnpm remove <package-name>`
4. Test the application thoroughly after removing dependencies
