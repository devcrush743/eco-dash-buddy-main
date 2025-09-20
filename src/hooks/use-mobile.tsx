import * as React from "react";

// Breakpoints matching Tailwind CSS
const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

// Hook to detect if screen is mobile (below md breakpoint)
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Hook to detect if screen is tablet (md to lg)
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
    const onChange = () => {
      setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg);
    };
    mql.addEventListener("change", onChange);
    setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTablet;
}

// Hook to detect if screen is desktop (lg and above)
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    };
    mql.addEventListener("change", onChange);
    setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isDesktop;
}

// Hook to get current breakpoint
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint | undefined>(undefined);

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS["2xl"]) {
        setBreakpoint("2xl");
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint("xl");
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint("lg");
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint("md");
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint("sm");
      } else {
        setBreakpoint("xs");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

// Hook to check if current screen is above a specific breakpoint
export function useBreakpointAbove(breakpoint: Breakpoint) {
  const [isAbove, setIsAbove] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    const onChange = () => {
      setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint]);
    };
    mql.addEventListener("change", onChange);
    setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint]);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!isAbove;
}

// Hook to check if current screen is below a specific breakpoint
export function useBreakpointBelow(breakpoint: Breakpoint) {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
    const onChange = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint]);
    };
    mql.addEventListener("change", onChange);
    setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint]);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!isBelow;
}
