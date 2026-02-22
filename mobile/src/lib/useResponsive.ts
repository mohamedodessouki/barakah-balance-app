import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  columns: number; // For grid layouts
}

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

function getColumns(width: number): number {
  if (width >= BREAKPOINTS.desktop) return 3;
  if (width >= BREAKPOINTS.tablet) return 2;
  return 1;
}

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const breakpoint = getBreakpoint(dimensions.width);

  return {
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWeb: Platform.OS === 'web',
    columns: getColumns(dimensions.width),
  };
}

// Responsive style helper
export function responsive<T>(
  breakpoint: Breakpoint,
  styles: { mobile?: T; tablet?: T; desktop?: T }
): T | undefined {
  if (breakpoint === 'desktop' && styles.desktop) return styles.desktop;
  if (breakpoint === 'tablet' && styles.tablet) return styles.tablet;
  if (breakpoint === 'mobile' && styles.mobile) return styles.mobile;

  // Fallback cascade: desktop -> tablet -> mobile
  if (breakpoint === 'desktop') {
    return styles.desktop ?? styles.tablet ?? styles.mobile;
  }
  if (breakpoint === 'tablet') {
    return styles.tablet ?? styles.mobile;
  }
  return styles.mobile;
}

// CSS-like media query helper for className strings
export function responsiveClass(
  breakpoint: Breakpoint,
  classes: { mobile?: string; tablet?: string; desktop?: string }
): string {
  const parts: string[] = [];

  if (classes.mobile) parts.push(classes.mobile);
  if (breakpoint !== 'mobile' && classes.tablet) parts.push(classes.tablet);
  if (breakpoint === 'desktop' && classes.desktop) parts.push(classes.desktop);

  return parts.join(' ');
}
