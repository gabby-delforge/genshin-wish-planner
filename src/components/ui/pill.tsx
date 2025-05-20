type PillProps = {
  text: string;
  color?: string;
};
export const Pill = ({ text, color = "white" }: PillProps) => {
  return (
    <div
      className={`rounded-full border border-[${color}] bg-[${color}/50] text-white px-2 text-xs`}
    >
      {text}
    </div>
  );
};
