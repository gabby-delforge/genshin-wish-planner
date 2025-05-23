import * as React from "react";

import { cn } from "@/lib/utils";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { IconButton } from "./icon-button";
type InputExtendedProps = {
  isLoading?: boolean;
  unit?: React.ReactElement;
  showPlusMinus?: boolean;
  onClickPlusMinus?: (change: -1 | 1) => void;
};
const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & InputExtendedProps
>(
  (
    {
      className,
      type,
      onChange,
      value,
      unit,
      isLoading = false,
      showPlusMinus,
      onClickPlusMinus,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(value || "0");

    const handleBlur = () => {
      if (inputValue === "" || inputValue === "0") {
        setInputValue("0");
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };

    React.useEffect(() => {
      setInputValue(value !== undefined ? value.toString() : "0");
    }, [value]);

    // Class that emulates an "input"-like aesthetic, for the wrapper div
    const c = cn(
      `flex
        h-7 min-w-0
        rounded-md
        border border-white/12
        bg-white/3 
        px-2 py-1
        text-base 
        shadow-sm 
        transition-colors 
        file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground 
        placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
        disabled:cursor-not-allowed disabled:opacity-50 
        md:text-sm`,
      className
    );

    const inputWrapper = (
      <div className={`${c} justify-between pl-1  ${isLoading && "shimmer"}`}>
        {unit && unit}

        <input
          type={type}
          className={`focus-visible:outline-none text-right min-w-0 w-full`}
          ref={ref}
          value={isLoading ? "" : inputValue}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>
    );

    const plusMinus = (
      <div className="flex flex-col">
        <IconButton
          icon={CaretUpIcon}
          size={12}
          onClick={() => onClickPlusMinus && onClickPlusMinus(1)}
          weight="bold"
          className="text-white/30"
        />
        <IconButton
          icon={CaretDownIcon}
          size={12}
          onClick={() => onClickPlusMinus && onClickPlusMinus(-1)}
          weight="bold"
          className="text-white/30"
        />
      </div>
    );

    return showPlusMinus ? (
      <div className={`flex gap-[2px] `}>
        {inputWrapper}
        {plusMinus}
      </div>
    ) : (
      inputWrapper
    );
  }
);
Input.displayName = "Input";

export { Input };
