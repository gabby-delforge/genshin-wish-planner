import { LimitedWish } from "@/components/resource";
import { Label } from "@/components/ui/label";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { observer } from "mobx-react-lite";
import { ResourceInput } from "./resource-input";

export const WishResources = observer(() => {
  const {
    isLoading,
    accountCurrentWishValue: totalAvailableWishes,
    setAccountStatusOwnedWishResources,
    accountStatusOwnedWishResources,
  } = useGenshinState();
  return (
    <div className="space-y-3">
      <Label className="text-sm text-gold-1 block">Wishes</Label>
      <div className="grid grid-cols-2 @xs/config:grid-cols-3 gap-4">
        <ResourceInput
          label="Primogems"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.primogem}
          handleChange={setAccountStatusOwnedWishResources}
          type="primogem"
        />
        <ResourceInput
          label="Intertwined Fate"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.limitedWishes}
          handleChange={setAccountStatusOwnedWishResources}
          type="limitedWishes"
        />
        <ResourceInput
          label="Acquaint Fate"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.standardWish}
          handleChange={setAccountStatusOwnedWishResources}
          type="standardWish"
        />
        <ResourceInput
          label="Starglitter"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.starglitter}
          handleChange={setAccountStatusOwnedWishResources}
          type="starglitter"
        />
        <ResourceInput
          label="Stardust"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.stardust}
          handleChange={setAccountStatusOwnedWishResources}
          type="stardust"
        />
        <ResourceInput
          label="Genesis Crystals"
          isLoading={isLoading}
          amount={accountStatusOwnedWishResources.genesisCrystal}
          handleChange={setAccountStatusOwnedWishResources}
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
});
