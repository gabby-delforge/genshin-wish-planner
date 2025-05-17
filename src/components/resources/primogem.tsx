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
        src="https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest?cb=20201117071158"
        alt="primogem"
        width={size}
        height={size}
      />
    </div>
  );
}
