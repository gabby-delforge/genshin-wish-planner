import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";

type MaxLabelProps = {
  baseWishes: number;
  starglitterWishes: number;
};
export const MaxLabel = observer(
  ({ baseWishes, starglitterWishes }: MaxLabelProps) => {
    return (
      <>
        <span className="text-gold-1">Max:</span>
        {[
          {
            label: "",
            amount: baseWishes,
          },
          {
            label: "from Starglitter",
            amount: starglitterWishes,
          },
        ]
          .filter((w) => w.amount !== 0)
          .map((w, i) => (
            <div className="flex gap-1 items-center" key={w.label}>
              {i !== 0 && <div>{w.amount > 0 ? "+" : "-"}</div>}
              <LimitedWish number={Math.abs(w.amount)} />
              <div>{w.label}</div>
            </div>
          ))}
      </>
    );
  }
);
