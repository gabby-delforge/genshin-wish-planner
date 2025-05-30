import { Checkbox } from "./checkbox";
import { Label } from "./label";

type CheckboxWithLabelProps = {
  id: string;
  label: string | React.ReactElement;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
export const CheckboxWithLabel = ({
  id,
  label,
  checked,
  onCheckedChange,
}: CheckboxWithLabelProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label
        htmlFor={id}
        className="text-sm cursor-pointer flex justify-between items-center w-full"
      >
        {label}
      </Label>
    </div>
  );
};
