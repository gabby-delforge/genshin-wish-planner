/* eslint-disable mobx/missing-observer */
"use client";

import { ResourceType } from "@/lib/types";
import Image from "next/image";

type ResourceProps = {
  number?: number;
  size?: number;
};

const resourceMap: Record<ResourceType, string> = {
  primogem: "/images/resources/primogem.png",
  limitedWishes: "/images/resources/limited-wish.png",
  standardWish: "/images/resources/standard-wish.png",
  starglitter: "/images/resources/starglitter.png",
  stardust: "/images/resources/stardust.png",
  genesisCrystal: "/images/resources/genesis-crystal.png",
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
      {typeof number === "number" && Number.isFinite(number) && <div>{number}</div>}
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
