"use client";

import Image from "next/image";
interface PrimogemProps {
  number: number;
  size?: number;
}

export default function Primogem({ number, size = 100 }: PrimogemProps) {
  return (
    <div>
      <div>{number}</div>
      <Image
        unoptimized
        src="/images/resources/primogem.webp"
        alt="primogem"
        width={size}
        height={size}
      />
    </div>
  );
}
