import { observer } from "mobx-react-lite";
import { ReactNode, useMemo } from "react";
import { Button } from "../ui/button";

type BannerInputBaseProps = {
  isLoading: boolean;
  title: ReactNode;
  showMaxButton?: boolean;
  onClickMax: () => void;
  showResetButton?: boolean;
  isResetDisabled?: boolean;
  onClickReset: () => void;
  maxButton?: ReactNode;
  children: ReactNode;
};
export const BannerInputBase = observer(
  ({
    isLoading,
    title,
    showMaxButton = true,
    onClickMax,
    showResetButton = true,
    isResetDisabled = false,
    onClickReset,
    maxButton,
    children,
  }: BannerInputBaseProps) => {
    const maxButtonComponent = useMemo(() => {
      if (!showMaxButton) return null;
      if (maxButton) return maxButton;
      return (
        <Button
          onClick={onClickMax}
          disabled={isLoading}
          variant="filled"
          size="sm"
          className="text-xs px-2 py-1 h-8"
        >
          Max
        </Button>
      );
    }, [showMaxButton, maxButton]);

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-row items-center gap-1 text-xs text-white text-left">
          {title}
        </div>
        <div className="flex items-center gap-1 justify-between">
          {children}
          <div className="flex gap-2">
            {showResetButton && (
              <Button
                onClick={onClickReset}
                disabled={isLoading || isResetDisabled}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-8 text-white/70 border-white/70"
              >
                Reset
              </Button>
            )}
            {maxButtonComponent}
          </div>
        </div>
      </div>
    );
  }
);
