import { API_BANNERS } from "@/lib/data";
import { BannerId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { Pill } from "../ui/pill";

type BannerVersionProps = { version: BannerId };

export const BannerVersion = observer(({ version }: BannerVersionProps) => {
  const banner = API_BANNERS[version];
  return (
    <Pill
      text={banner?.name || "Banner"}
      color={"bg-gradient-to-r from-[#ab68ee] to-[#c370db]"}
    />
  );
});
