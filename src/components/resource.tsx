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

function Resource({
  number,
  size = 24,
  type,
}: ResourceProps & { type: ResourceType }) {
  return (
    <div className="flex items-center flex-shrink-0">
      {number && <div>{number}</div>}
      <Image
        src={`/images/resources/${type}.webp`}
        alt={type}
        width={size}
        height={size}
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
