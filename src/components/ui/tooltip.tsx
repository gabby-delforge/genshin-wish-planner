/* eslint-disable mobx/missing-observer */
"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React, { createContext, useContext, useState } from "react";

import { useIsMobile } from "@/lib/responsive-design/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

// Context to share state between Tooltip and TooltipTrigger
const TooltipContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
} | null>(null);

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        " z-50 overflow-hidden rounded-md bg-white px-4 py-2 text-sm text-bg-dark-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Enhanced Tooltip that handles mobile touch interactions
function Tooltip({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const contextValue = {
    open,
    setOpen,
    isMobile,
  };

  // On mobile, we control the open state manually and disable hover
  if (isMobile) {
    return (
      <TooltipContext.Provider value={contextValue}>
        <TooltipPrimitive.Root
          open={open}
          onOpenChange={setOpen}
          delayDuration={0}
          disableHoverableContent={true}
          {...props}
        >
          {children}
        </TooltipPrimitive.Root>
      </TooltipContext.Provider>
    );
  }

  // On desktop, use default behavior (hover)
  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipPrimitive.Root {...props}>
        {children}
      </TooltipPrimitive.Root>
    </TooltipContext.Provider>
  );
}

// Enhanced TooltipTrigger that handles touch events on mobile
const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, className, ...props }, ref) => {
  const context = useContext(TooltipContext);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Call original onClick if provided
    onClick?.(event);
    
    // On mobile, toggle tooltip state
    if (context?.isMobile) {
      context.setOpen(!context.open);
    }
  };

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      onClick={handleClick}
      className={cn(
        // Disable hover effects on mobile using CSS
        context?.isMobile ? "touch-manipulation" : "",
        className
      )}
      style={{
        // Disable hover on mobile devices
        ...(context?.isMobile && { WebkitTouchCallout: "none" }),
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
