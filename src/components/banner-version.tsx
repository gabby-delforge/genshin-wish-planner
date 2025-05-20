import { VersionId } from "@/lib/types";
import { getBannerColor } from "@/lib/utils";
import { Pill } from "./ui/pill";

type BannerVersionProps = { version: VersionId };

export const BannerVersion = ({ version }: BannerVersionProps) => {
  const color = getBannerColor(version);
  console.log(color);
  return <Pill text={version} color={color} />;
};
