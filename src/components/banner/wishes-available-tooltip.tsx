import { observer } from "mobx-react-lite";
import React from "react";
import { LimitedWish } from "../resource";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type WishSource = {
  amount: number;
  label: string;
};
type WishesAvailableTooltipProps = {
  wishSources: WishSource[];
  showEmptySources?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement;
};
export const WishesAvailableTooltip = observer(
  ({
    wishSources,
    showEmptySources = false,
    onOpenChange = () => {},
    children,
  }: WishesAvailableTooltipProps) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300} onOpenChange={onOpenChange}>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent className="flex gap-1 items-center">
            {wishSources
              .filter((w) => (showEmptySources ? true : w.amount !== 0))
              .map((w, i) => (
                <div className="flex gap-1 items-center" key={w.label}>
                  {i !== 0 && (
                    <div className="text-black/50">
                      {w.amount > 0 ? "+" : "-"}
                    </div>
                  )}
                  <LimitedWish number={Math.abs(w.amount)} />
                  <div>{w.label}</div>
                </div>
              ))}
            {!showEmptySources &&
              wishSources.filter((w) => w.amount !== 0).length === 0 && (
                <LimitedWish number={0} />
              )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);
