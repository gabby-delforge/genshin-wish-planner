import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

type RunSimulationButtonProps = {
  showSimulationCountInput?: boolean;
  customText?: string;
  className?: string;
};

const RunSimulationButton = observer(
  ({
    showSimulationCountInput = true,
    customText,
    className,
  }: RunSimulationButtonProps) => {
    const {
      mode,
      simulationCount,
      isSimulating,
      runPlaygroundSimulation,
      runOptimizerSimulation,
      setSimulationCount,
    } = useGenshinState();

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
);

export default RunSimulationButton;
