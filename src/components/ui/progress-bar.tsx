type ProgressBarProps = { percent: number };
export const ProgressBar = ({ percent }: ProgressBarProps) => (
  <div className="w-full bg-bg-dark-2 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-[#7b68ee] to-[#9370db] h-2 rounded-full"
      style={{ width: `${percent * 100}%` }}
    ></div>
  </div>
);
