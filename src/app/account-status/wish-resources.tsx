import { LimitedWish, Primogem, Starglitter } from "@/components/resource";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountStatus as AccountStatusType } from "@/lib/types";

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
      <div className="flex flex-col @xs:flex-row gap-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="primogems" className="text-sm">
            Primogems
          </Label>
          <div className="flex flex-row gap-1">
            <Input
              id="primogems"
              name="primogems"
              type="number"
              min="0"
              value={accountStatus.ownedWishResources.primogems}
              onChange={handleResourceChange}
              className="bg-void-1 border-void-2"
            />
            <Primogem />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="starglitter" className="text-sm">
            Starglitter
          </Label>
          <div className="flex flex-row gap-1">
            <Input
              id="starglitter"
              name="starglitter"
              type="number"
              min="0"
              value={accountStatus.ownedWishResources.starglitter}
              onChange={handleResourceChange}
              className="bg-void-1 border-void-2"
            />
            <Starglitter />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wishes" className="text-sm">
            Wishes
          </Label>
          <div className="flex flex-row gap-1">
            <Input
              id="wishes"
              name="wishes"
              type="number"
              min="0"
              value={accountStatus.ownedWishResources.wishes}
              onChange={handleResourceChange}
              className="bg-void-1 border-void-2"
            />
            <LimitedWish />
          </div>
        </div>
      </div>
    </div>
  );
};
