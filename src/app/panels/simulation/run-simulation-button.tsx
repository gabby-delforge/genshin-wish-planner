import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

type RunSimulationButtonProps = {
  showSimulationCountInput?: boolean;
  customText?: string;
  className?: string;
};
export default function RunSimulationButton({
  showSimulationCountInput = true,
  customText,
  className,
}: RunSimulationButtonProps) {
  const { mode, simulationCount, isSimulating } = useGenshinState();
  const {
    runPlaygroundSimulation,
    runOptimizerSimulation,
    setSimulationCount,
  } = useGenshinActions();
  const handleRunSimulation = () => {
    if (mode === "playground") {
      runPlaygroundSimulation();
    } else if (mode === "strategy") {
      runOptimizerSimulation();
    }
  };

  const simulationCountInput = (
    <>
      <Label htmlFor="simulationCount" className="text-sm">
        Simulation Count
      </Label>

      <Input
        id="simulationCount"
        type="number"
        min="1000"
        max="100000"
        step="1000"
        value={simulationCount}
        onChange={(e) =>
          setSimulationCount(Number.parseInt(e.target.value) || 10000)
        }
        className="bg-void-1 border-void-2 w-full"
      />
    </>
  );

  const runSimulationButton = (
    <Button
      onClick={handleRunSimulation}
      disabled={isSimulating}
      className={`mt-6 bg-gradient-to-r from-[#7b68ee] to-[#9370db] hover:from-[#6a5acd] hover:to-[#8a2be2] border-none ${
        !showSimulationCountInput && className && className
      }`}
    >
      {isSimulating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Simulating...
        </>
      ) : (
        customText || "Run Simulation"
      )}
    </Button>
  );
  return showSimulationCountInput ? (
    <div
      className={`flex items-center space-x-4 mt-4 ${className && className}`}
    >
      <div className="flex-1">{simulationCountInput}</div>
      {runSimulationButton}
    </div>
  ) : (
    runSimulationButton
  );
}
