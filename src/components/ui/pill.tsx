import { observer } from "mobx-react-lite";

type PillProps = {
  text: string;
  color?: string;
};
export const Pill = observer(({ text, color }: PillProps) => {
  return (
    <div
      className={`text-xxs font-bold rounded-full text-white bg-white/30 px-1.5 py-[1px] flex justify-center items-center ${
        color ? color : ""
      }`}
    >
      {text}
    </div>
  );
});
