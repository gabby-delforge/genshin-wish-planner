"use client";

import { ResourceType } from "@/lib/types";
import Image from "next/image";

type ResourceProps = {
  number?: number;
  size?: number;
};

const resourceMap: Record<ResourceType, string> = {
  primogem:
    "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png",
  limitedWishes:
    "https://static.wikia.nocookie.net/gensin-impact/images/1/1f/Item_Intertwined_Fate.png",
  standardWish:
    "https://static.wikia.nocookie.net/gensin-impact/images/2/22/Item_Acquaint_Fate.png",
  starglitter:
    "https://static.wikia.nocookie.net/gensin-impact/images/6/69/Item_Masterless_Starglitter.png",
  stardust:
    "https://static.wikia.nocookie.net/gensin-impact/images/7/7c/Item_Masterless_Stardust.png",
  genesisCrystal:
    "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Item_Genesis_Crystal.png",
};

function Resource({
  number,
  size = 24,
  type,
}: ResourceProps & { type: ResourceType }) {
  return (
    <div className="flex items-center flex-shrink-0">
      <Image
        src={resourceMap[type]}
        alt={type}
        width={size}
        height={size}
        unoptimized
      />
      {number && <div>{number}</div>}
    </div>
  );
}

export function Primogem({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="primogem" />;
}

export function LimitedWish({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="limitedWishes" />;
}

export function StandardWish({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="standardWish" />;
}

export function Starglitter({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="starglitter" />;
}

export function Stardust({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="stardust" />;
}

export function GenesisCrystal({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="genesisCrystal" />;
}
