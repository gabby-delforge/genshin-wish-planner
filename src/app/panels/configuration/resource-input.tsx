import {
  GenesisCrystal,
  LimitedWish,
  Primogem,
  StandardWish,
  Stardust,
  Starglitter,
} from "@/components/resource";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResourceType } from "@/lib/types";
import { observer } from "mobx-react-lite";

export const ResourceInput = observer(
  ({
    label,
    amount,
    handleChange,
    isLoading = false,
    type,
  }: {
    label: string;
    amount: number;
    isLoading?: boolean;
    handleChange: (name: ResourceType, amount: number) => void;
    type: ResourceType;
  }) => {
    const resourceIcon = {
      primogem: <Primogem size={20} />,
      starglitter: <Starglitter size={20} />,
      limitedWishes: <LimitedWish size={20} />,
      standardWish: <StandardWish size={20} />,
      stardust: <Stardust size={20} />,
      genesisCrystal: <GenesisCrystal size={20} />,
    }[type];

    return (
      <div className="flex flex-col justify-between gap-1">
        <Label
          htmlFor={type}
          className="text-xs block leading-none align-text-bottom h-full"
        >
          {label}
        </Label>
        <Input
          id={type}
          name={type}
          isLoading={isLoading}
          type="number"
          min="0"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(type, parseInt(e.target.value) || 0)
          }
          unit={resourceIcon}
          showPlusMinus
          className="w-full"
        />
      </div>
    );
  }
);
