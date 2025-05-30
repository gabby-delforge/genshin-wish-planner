import { BannerId } from "@/lib/types";
import { getBannerColor } from "@/lib/utils";
import { Pill } from "../ui/pill";

type BannerVersionProps = { version: BannerId };

export const BannerVersion = ({ version }: BannerVersionProps) => {
  const color = getBannerColor(version);
  return <Pill text={version} color={color} />;
};
