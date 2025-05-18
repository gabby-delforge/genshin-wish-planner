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
import { AccountStatus as AccountStatusType, ResourceType } from "@/lib/types";

const ResourceInput = ({
  label,
  amount,
  handleChange,
  type,
}: {
  label: string;
  amount: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: ResourceType;
}) => {
  const resourceIcon = {
    primogem: <Primogem />,
    starglitter: <Starglitter />,
    limitedWish: <LimitedWish />,
    standardWish: <StandardWish />,
    stardust: <Stardust />,
    genesisCrystal: <GenesisCrystal />,
  }[type];

  return (
    <div className="space-y-2">
      <Label htmlFor={type} className="text-xs">
        {label}
      </Label>
      <div className="flex flex-row gap-1">
        <Input
          id={type}
          name={type}
          type="number"
          min="0"
          value={amount}
          onChange={handleChange}
          className="bg-void-1 border-void-2"
        />
        {resourceIcon}
      </div>
    </div>
  );
};

type WishResourcesProps = {
  accountStatus: AccountStatusType;
  handleResourceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
export const WishResources = ({
  accountStatus,
  handleResourceChange,
}: WishResourcesProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gold-1">Wishes</Label>
      <div className="grid grid-cols-3 gap-4">
        <ResourceInput
          label="Primogems"
          amount={accountStatus.ownedWishResources.primogems}
          handleChange={handleResourceChange}
          type="primogem"
        />
        <ResourceInput
          label="Intertwined Fate"
          amount={accountStatus.ownedWishResources.limitedWishes}
          handleChange={handleResourceChange}
          type="limitedWish"
        />
        <ResourceInput
          label="Acquaint Fate"
          amount={accountStatus.ownedWishResources.standardWishes}
          handleChange={handleResourceChange}
          type="standardWish"
        />
        <ResourceInput
          label="Starglitter"
          amount={accountStatus.ownedWishResources.starglitter}
          handleChange={handleResourceChange}
          type="starglitter"
        />
        <ResourceInput
          label="Stardust"
          amount={accountStatus.ownedWishResources.stardust}
          handleChange={handleResourceChange}
          type="stardust"
        />
        <ResourceInput
          label="Genesis Crystals"
          amount={accountStatus.ownedWishResources.genesisCrystal}
          handleChange={handleResourceChange}
          type="genesisCrystal"
        />
      </div>
    </div>
  );
};
