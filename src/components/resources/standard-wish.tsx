import Image from "next/image";
interface StandardWishProps {
  number: number;
}

export default function StandardWish({ number }: StandardWishProps) {
  return (
    <div>
      <div>{number}</div>
      <Image
        src="/images/resources/standard-wish.webp"
        alt="standard-wish"
        width={100}
        height={100}
      />
    </div>
  );
}
