import Image from "next/image";
interface LimitedWishProps {
  number: number;
}

export default function LimitedWish({ number }: LimitedWishProps) {
  return (
    <div>
      <div>{number}</div>
      <Image
        src="/images/resources/limited-wish.webp"
        alt="limited-wish"
        width={100}
        height={100}
      />
    </div>
  );
}
