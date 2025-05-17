"use client";

import Image from "next/image";

type ResourceProps = {
  number?: number;
  size?: number;
};

type ResourceType =
  | "primogem"
  | "limited-wish"
  | "standard-wish"
  | "starglitter";

const resourceMap = {
  primogem:
    "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png",
  "limited-wish": "/images/resources/limited-wish.webp",
  "standard-wish": "/images/resources/standard-wish.webp",
  starglitter: "/images/resources/starglitter.webp",
};

function Resource({
  number,
  size = 24,
  type,
}: ResourceProps & { type: ResourceType }) {
  return (
    <div className="flex items-center flex-shrink-0">
      {number && <div>{number}</div>}
      <Image
        src={resourceMap[type]}
        alt={type}
        width={size}
        height={size}
        unoptimized
      />
    </div>
  );
}

export function Primogem({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="primogem" />;
}

export function LimitedWish({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="limited-wish" />;
}

export function StandardWish({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="standard-wish" />;
}

export function Starglitter({ number, size = 24 }: ResourceProps) {
  return <Resource number={number} size={size} type="starglitter" />;
}
