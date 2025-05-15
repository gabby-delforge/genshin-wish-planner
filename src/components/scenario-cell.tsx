import { ScenarioOutcome } from "@/lib/types";
import { useMemo } from "react";

type ScenarioCellProps = {
  scenario: ScenarioOutcome;
};

export default function ScenarioCell({ scenario }: ScenarioCellProps) {
  const result1 = scenario.result[0];
  const result2 = scenario.result[1];
  const cons1 = `C${scenario.constellation[0]}`;
  const cons2 = `C${scenario.constellation[1]}`;
  const text = useMemo(() => {
    if (!["-", "Missed", "Standard 5*"].includes(result1)) {
      if (!["-", "Missed", "Standard 5*"].includes(result2)) {
        return `${result1} (${cons1}) | ${result2} (${cons2})`; // Got both
      }
      return `${result1} (${cons1})`; // Got one
    }
    if (!["-", "Missed", "Standard 5*"].includes(result2)) {
      return `${result2} (${cons2})`; // Got one
    }

    return result1;
  }, [result1, result2, cons1, cons2]);

  if (!result1 || !result2) {
    return null;
  }

  const isSuccess =
    !["-", "Standard 5*", "Missed"].includes(result1) ||
    !["-", "Standard 5*", "Missed"].includes(result2);
  const isMissed = result1 === "Missed" || result2 === "Missed";
  const isStandard5Star =
    result1 === "Standard 5*" || result2 === "Standard 5*";
  const isSkipped = result1 === "-" || result2 === "-";

  return (
    <div
      className={`p-2 rounded-md text-center min-w-[100px] flex flex-col items-center justify-start gap-2 ${
        isSuccess
          ? "bg-[#1dd1a1]/20 border border-[#1dd1a1]/40"
          : isMissed
          ? "bg-[#ff6b6b]/20 border border-[#ff6b6b]/40"
          : isStandard5Star
          ? "bg-gold-1/20 border border-gold-1/40"
          : isSkipped
          ? "bg-bg-dark-2 border border-void-2"
          : "bg-bg-dark-2 border border-void-2"
      }`}
    >
      <div
        className={`text-sm font-medium ${
          isSuccess
            ? "text-[#1dd1a1]"
            : isMissed
            ? "text-[#ff6b6b]"
            : isStandard5Star
            ? "text-gold-1"
            : isSkipped
            ? "text-muted-foreground"
            : "text-[#1dd1a1]"
        }`}
      >
        {text.charAt(0).toUpperCase() + text.slice(1)}
      </div>
    </div>
  );
}
