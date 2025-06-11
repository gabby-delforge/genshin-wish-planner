/* eslint-disable mobx/missing-observer */
import React from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

type CheckboxWithLabelProps = {
  id: string;
  label: string | React.ReactElement;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};
export const CheckboxWithLabel = ({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: CheckboxWithLabelProps) => {
  return (
    <div
      className={`flex items-center space-x-2 ${className ? className : ""}`}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label
        htmlFor={id}
        className="cursor-pointer text-xs  flex justify-between items-center w-full"
      >
        {label}
      </Label>
    </div>
  );
};
