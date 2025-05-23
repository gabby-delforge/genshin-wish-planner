import { LimitedWish } from "@/components/resource";
import { Label } from "@/components/ui/label";
import { useGenshinState } from "@/lib/context/genshin-context";
import { AccountStatus as AccountStatusType, ResourceType } from "@/lib/types";
import { ResourceInput } from "./resource-input";

type WishResourcesProps = {
  accountStatus: AccountStatusType;
  handleResourceChange: (name: ResourceType, amount: number) => void;
};
export const WishResources = ({
  accountStatus,
  handleResourceChange,
}: WishResourcesProps) => {
  const { isLoading, accountCurrentPrimogemValue: totalAvailableWishes } =
    useGenshinState();
  return (
    <div className="space-y-3">
      <Label className="text-sm text-gold-1 block">Wishes</Label>
      <div className="grid grid-cols-2 @xs/config:grid-cols-3 gap-4">
        <ResourceInput
          label="Primogems"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.primogem}
          handleChange={handleResourceChange}
          type="primogem"
        />
        <ResourceInput
          label="Intertwined Fate"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.limitedWishes}
          handleChange={handleResourceChange}
          type="limitedWishes"
        />
        <ResourceInput
          label="Acquaint Fate"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.standardWish}
          handleChange={handleResourceChange}
          type="standardWish"
        />
        <ResourceInput
          label="Starglitter"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.starglitter}
          handleChange={handleResourceChange}
          type="starglitter"
        />
        <ResourceInput
          label="Stardust"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.stardust}
          handleChange={handleResourceChange}
          type="stardust"
        />
        <ResourceInput
          label="Genesis Crystals"
          isLoading={isLoading}
          amount={accountStatus.ownedWishResources.genesisCrystal}
          handleChange={handleResourceChange}
          type="genesisCrystal"
        />
      </div>
      <div className="bg-void-1 rounded-md p-3 border border-void-2 mt-4">
        <div className="text-sm flex gap-1 items-center justify-center font-medium text-gold-1">
          <span className=" font-bold">
            <LimitedWish number={totalAvailableWishes} />
          </span>
          total wishes
        </div>
      </div>
    </div>
  );
};
