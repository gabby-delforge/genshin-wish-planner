import { observer } from "mobx-react-lite";

type ProgressBarProps = { percent: number };
export const ProgressBar = observer(({ percent }: ProgressBarProps) => (
  <div className="w-full bg-void-2 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-[#7b68ee] to-[#9370db]  h-2 rounded-full"
      style={{ width: `${percent * 100}%` }}
    ></div>
  </div>
));
