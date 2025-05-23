type PillProps = {
  text: string;
  color?: string;
};
export const Pill = ({ text, color }: PillProps) => {
  return (
    <div
      className={`rounded-full border text-white bg-white/30 px-2 text-xs flex justify-center items-center`}
      style={color ? { backgroundColor: color, borderColor: color } : {}}
    >
      {text}
    </div>
  );
};
