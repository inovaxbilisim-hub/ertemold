/**
 * Performance Hooks — Barrel export
 */

export { useDebounce, useDebouncedCallback, useDebouncedSearch } from './useDebounce';
export { 
  useIntersectionObserver, 
  useScrollProgress, 
  useElementInView,
  type IntersectionOptions,
} from './useIntersectionObserver';
export { 
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useIsTouchDevice,
  usePrefersDarkMode,
  usePrefersLightMode,
  usePrefersReducedMotion,
  useHighContrastMode,
  useBreakpoint,
  useOrientation,
} from './useMediaQuery';