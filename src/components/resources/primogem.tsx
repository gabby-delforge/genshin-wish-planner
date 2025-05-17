"use client";

interface PrimogemProps {
  number: number;
  size?: number;
}

export default function Primogem({ number, size = 100 }: PrimogemProps) {
  return (
    <div>
      <div>{number}</div>
      <img
        src="/images/resources/primogem.webp"
        alt="primogem"
        width={size}
        height={size}
      />
    </div>
  );
}
