import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

type InfoIconProps = {
  content: string | React.ReactElement | React.ReactElement[];
  contentMaxWidth?: number;
  forceOpen?: boolean; // For debugging
  className?: string;
};

export const InfoIcon = observer(
  ({
    content,
    contentMaxWidth,
    forceOpen = false,
    className = "",
  }: InfoIconProps) => {
    const [isOpen, setIsOpen] = useState(forceOpen);

    return (
      <TooltipProvider>
        <Tooltip
          delayDuration={300}
          open={forceOpen ? true : isOpen}
          onOpenChange={forceOpen ? undefined : setIsOpen}
        >
          <TooltipTrigger asChild>
            <Info width={12} height={12} className={className} />
          </TooltipTrigger>
          <TooltipContent
            className={cn("flex gap-1 items-center")}
            style={{
              ...(contentMaxWidth &&
                contentMaxWidth > 0 && { maxWidth: `${contentMaxWidth}px` }),
            }}
          >
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);
