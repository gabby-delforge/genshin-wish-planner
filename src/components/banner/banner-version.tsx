import { BannerId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { Pill } from "../ui/pill";

type BannerVersionProps = { version: BannerId };

export const BannerVersion = observer(({ version }: BannerVersionProps) => {
  return (
    <Pill
      text={version}
      color={"bg-gradient-to-r from-[#ab68ee] to-[#c370db]"}
    />
  );
});
