/* eslint-disable mobx/missing-observer */
import React, { createContext, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "./hooks/useMediaQuery";

// Usage example
// const App = observer(function App() {
//   return (
//     <ResponsiveProvider>
//       <MyApp />
//     </ResponsiveProvider>
//   );
// });

// const MyComponent = observer(function MyComponent() {
//   const { isMobile, isDesktop, width } = useResponsive();

//   return (
//     <div>
//       {isMobile && <MobileNavigation />}
//       {isDesktop && <DesktopNavigation />}
//       <p>Screen width: {width}px</p>
//     </div>
//   );
// });

// function MyPage() {
//   return (
//     <div>
//       <Mobile>
//         <MobileHeader />
//       </Mobile>

//       <Desktop>
//         <DesktopHeader />
//       </Desktop>

//       <Responsive
//         mobile={<MobileContent />}
//         tablet={<TabletContent />}
//         desktop={<DesktopContent />}
//       />

//       {/* Content that shows on all devices */}
//       <SharedContent />
//     </div>
//   );
// }

const ResponsiveContext = createContext<ReactiveContextType>({
  device: "mobile",
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  width: 1920,
  height: 1080,
});

const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};

type DeviceType = "mobile" | "tablet" | "desktop";
type ReactiveContextType = {
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
};

export const ResponsiveProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [device, setDevice] = useState<DeviceType>("mobile");

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      if (width <= breakpoints.mobile) {
        setDevice("mobile");
      } else if (width <= breakpoints.tablet) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    }

    window.addEventListener("resize", updateSize);
    updateSize(); // Set initial size

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const value: ReactiveContextType = {
    ...screenSize,
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error("useResponsive must be used within ResponsiveProvider");
  }
  return context;
}

// Responsive wrapper components
export function Mobile({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return isMobile ? children : fallback;
}

export function Desktop({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 769px)");
  return isDesktop ? children : fallback;
}

export function Tablet({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  return isTablet ? children : fallback;
}

// More flexible responsive component
export function Responsive({
  mobile,
  tablet,
  desktop,
  children,
}: {
  mobile: React.ReactNode;
  tablet: React.ReactNode;
  desktop: React.ReactNode;
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  if (isMobile && mobile) return mobile;
  if (isTablet && tablet) return tablet;
  if (isDesktop && desktop) return desktop;

  return children || null;
}
