import { Checkbox } from "@/components/ui/checkbox";
import { InfoIcon } from "@/components/ui/info-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { observer } from "mobx-react-lite";
import { ToggleGroup } from "radix-ui";

export const PityStatus = observer(() => {
  const {
    isLoading,
    characterPity,
    setCharacterPity,
    weaponPity,
    setWeaponPity,
    isNextCharacterFeaturedGuaranteed,
    isCapturingRadianceActive,
    isNextWeaponFeaturedGuaranteed,
    setIsNextCharacterFeaturedGuaranteed,
    setIsCapturingRadianceActive,
    setIsNextWeaponFeaturedGuaranteed,
  } = useGenshinState();
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm text-gold-1 block">Pity</Label>
      <div>
        <div className="text-xs italic text-white/50 mb-2">
          Character Banner
        </div>
        <div className="ml-4 grid grid-cols-2 @lg/config:grid-cols-[auto_1fr_auto_1fr] gap-1 items-center">
          <Label htmlFor="currentPity" className="my-auto text-xs">
            Pity
          </Label>
          <Input
            className="w-full"
            id="currentPity"
            isLoading={isLoading}
            name="currentPity"
            type="number"
            min="0"
            max="89"
            value={characterPity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCharacterPity(parseInt(e.target.value) || 0)
            }
            showPlusMinus
            width={"w-full"}
            validate={(value) => [
              value !== undefined &&
                parseInt(value.toString()) >= 0 &&
                parseInt(value.toString()) < 90,
              "",
            ]}
          />
          <Label
            htmlFor="isGuaranteed"
            className="flex flex-row gap-1 items-center my-auto text-xs @lg/config:ml-6"
          >
            <div>Last 50/50</div>
            <InfoIcon
              className="text-white/50"
              content={
                "Whether you last got the featured 5 star character (won) or a standard 5 star character (lost)."
              }
            />
          </Label>
          <ToggleGroup.Root
            type="single"
            className="items-center justify-center rounded-lg p-1 text-muted-foreground grid grid-cols-2 bg-void-1"
            value={isNextCharacterFeaturedGuaranteed ? "lost" : "won"}
            onValueChange={(value) => {
              if (value) {
                setIsNextCharacterFeaturedGuaranteed(value === "lost");
              }
            }}
          >
            <ToggleGroup.Item
              value="lost"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-3"
            >
              <span className="text-xs">Lost</span>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="won"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-3"
            >
              <span className="text-xs">Won</span>
            </ToggleGroup.Item>
          </ToggleGroup.Root>
          {isNextCharacterFeaturedGuaranteed ? (
            <>
              <Label
                htmlFor="capturingRadiance"
                className="flex flex-row gap-1 items-center my-auto text-xs @lg/config:ml-6"
              >
                <div>Capturing Radiance</div>
                <InfoIcon
                  className="text-white/50"
                  content={
                    "If you have lost two 50/50s in a row, the next one will trigger Capturing Radiance and guarantee that you'll get the featured 5-star character"
                  }
                />
              </Label>
              <div className="min-h-8 justify-self-end-safe self-center flex justify-center items-center mr-1">
                <Checkbox
                  checked={isCapturingRadianceActive}
                  onCheckedChange={(checked) =>
                    setIsCapturingRadianceActive(checked === true)
                  }
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div>
        <div className="text-xs italic text-white/50 mb-2">Weapon Banner</div>
        <div className="ml-4 grid grid-cols-2 @lg/config:grid-cols-[auto_1fr_auto_1fr] gap-1 items-center">
          <Label htmlFor="currentPity" className="my-auto text-xs">
            Pity
          </Label>
          <Input
            className="w-full"
            id="currentPity"
            isLoading={isLoading}
            name="currentPity"
            type="number"
            min="0"
            max="89"
            value={weaponPity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setWeaponPity(parseInt(e.target.value) || 0)
            }
            showPlusMinus
            width={"w-full"}
            validate={(value) => [
              value !== undefined &&
                parseInt(value.toString()) >= 0 &&
                parseInt(value.toString()) < 90,
              "",
            ]}
          />
          <Label
            htmlFor="isGuaranteed"
            className="flex flex-row gap-1 items-center my-auto text-xs @lg/config:ml-6"
          >
            <div>Last 75/25</div>
            <InfoIcon
              className="text-white/50"
              content={
                "Whether you last got either featured 5 star weapons (won, 75% chance) or a standard 5 star weapon (lost, 25% chance)."
              }
            />
          </Label>
          <ToggleGroup.Root
            type="single"
            className="items-center justify-center rounded-lg p-1 text-muted-foreground grid grid-cols-2 bg-void-1"
            value={isNextWeaponFeaturedGuaranteed ? "lost" : "won"}
            onValueChange={(value) => {
              if (value) {
                setIsNextWeaponFeaturedGuaranteed(value === "lost");
              }
            }}
          >
            <ToggleGroup.Item
              value="lost"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-3"
            >
              <span className="text-xs">Lost</span>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="won"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-3"
            >
              <span className="text-xs">Won</span>
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </div>
    </div>
  );
});
