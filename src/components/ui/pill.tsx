import { observer } from "mobx-react-lite";

type PillProps = {
  text: string;
  color?: string;
};
export const Pill = observer(({ text, color }: PillProps) => {
  return (
    <div
      className={`text-xs font-bold rounded-full text-white bg-white/30 px-3 py-[1px] flex justify-center items-center ${
        color ? color : ""
      }`}
    >
      {text}
    </div>
  );
});
