"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { IconButton } from "./icon-button";

type InputExtendedProps = {
  isLoading?: boolean;
  unit?: React.ReactElement;
  showPlusMinus?: boolean;
  width?: string;
  validate?: (
    value: string | number | readonly string[] | undefined
  ) => [boolean, string];
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
      width,
      validate,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const internalRef = React.useRef<HTMLInputElement>(null);
    const [isValid, setIsValid] = React.useState(true);
    const [errorHint, setErrorHint] = React.useState("");

    // Use the passed ref if available, otherwise use our internal ref
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    React.useEffect(() => {
      if (!validate) return;
      const [valid, error] = validate(value);
      setIsValid(valid);
      setErrorHint(error);
    }, [value, validate]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      // Normalize empty or invalid values on blur
      if (e.target.value === "" || e.target.value === "0") {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: "0" },
          currentTarget: e.currentTarget,
        } as React.ChangeEvent<HTMLInputElement>;

        onChange?.(syntheticEvent);
      }

      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Normalize leading zeros (but allow empty while focused)
      if (newValue !== "" && newValue !== "0" && /^0+\d/.test(newValue)) {
        const normalized = newValue.replace(/^0+/, "");
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: normalized },
        };
        onChange?.(syntheticEvent);
      } else {
        onChange?.(e);
      }
    };

    const handlePlusMinusChange = (newValue: number) => {
      if (onChange) {
        const target =
          inputRef.current ||
          ({
            value: newValue.toString(),
            name: props.name || "",
            type: type || "text",
          } as HTMLInputElement);

        const syntheticEvent = {
          target: { ...target, value: newValue.toString() },
          currentTarget: target,
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      }
    };

    // Determine what to display
    const displayValue = (() => {
      if (isLoading) return "";

      const stringValue = value?.toString() || "0";

      // If focused and the value would be "0", allow it to be empty for typing
      if (isFocused && stringValue === "0") {
        return ""; // This allows user to see empty field when they clear it
      }

      return stringValue;
    })();

    // Class that emulates an "input"-like aesthetic, for the wrapper div
    const c = cn(
      `flex items-center
        h-7 min-w-0
        rounded-md
        border border-white/12 hover:border-white/25
        bg-white/3 focus-within:bg-white/10
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
          className={`focus-visible:outline-none text-right min-w-0 ${
            width ? width : ""
          } ${!isValid ? "text-red-300" : ""}`}
          ref={inputRef}
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>
    );

    const plusMinus = (
      <div className="flex flex-col justify-around items-center">
        <IconButton
          icon={CaretUpIcon}
          size={12}
          onClick={() => {
            const currentValue = Number(value) || 0;
            handlePlusMinusChange(currentValue + 1);
          }}
          weight="bold"
          className="text-white/30"
        />
        <IconButton
          icon={CaretDownIcon}
          size={12}
          onClick={() => {
            const currentValue = Number(value) || 0;
            handlePlusMinusChange(Math.max(0, currentValue - 1));
          }}
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
