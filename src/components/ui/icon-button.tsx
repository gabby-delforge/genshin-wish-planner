/* eslint-disable mobx/missing-observer */
import { Icon } from "@phosphor-icons/react";
import { ButtonHTMLAttributes, forwardRef } from "react";

type IconButtonProps = {
  icon: Icon;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: IconComponent,
      size = 24,
      weight = "regular",
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-md hover:text-white active:scale-110 origin-center focus:outline-none  transition-colors ${className}`}
        {...props}
      >
        <IconComponent size={size} weight={weight} />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
