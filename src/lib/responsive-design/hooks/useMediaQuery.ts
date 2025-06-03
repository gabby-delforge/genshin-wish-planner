import { useEffect, useState } from "react";

// // Usage example
// function MyComponent() {
//   const isMobile = useIsMobile();
//   const isDesktop = useIsDesktop();

//   if (isMobile) {
//     return <MobileComponent />;
//   }

//   if (isDesktop) {
//     return <DesktopComponent />;
//   }

//   return <TabletComponent />;
// }

// Custom hook for media queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);

    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)");
}
