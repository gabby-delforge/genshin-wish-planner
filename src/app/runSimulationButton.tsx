import { useGenshin } from "@/lib/context/genshin-context";
import { Label } from "@radix-ui/react-label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

export default function RunSimulationButton() {
  const {
    mode,
    simulations,
    setSimulations,
    isSimulating,
    runPlaygroundSimulation,
    runOptimizerSimulation,
  } = useGenshin();

  const handleRunSimulation = () => {
    if (mode === "playground") {
      runPlaygroundSimulation();
    } else if (mode === "strategy") {
      runOptimizerSimulation();
    }
  };
  return (
    <div className="flex items-center space-x-4 mt-4">
      <div className="flex-1">
        <Label htmlFor="simulationCount" className="text-sm">
          Simulation Count
        </Label>
        <Input
          id="simulationCount"
          type="number"
          min="1000"
          max="100000"
          step="1000"
          value={simulations}
          onChange={(e) =>
            setSimulations(Number.parseInt(e.target.value) || 10000)
          }
          className="bg-void-1 border-void-2"
        />
      </div>
      <Button
        onClick={handleRunSimulation}
        disabled={isSimulating}
        className="mt-6 bg-gradient-to-r from-[#7b68ee] to-[#9370db] hover:from-[#6a5acd] hover:to-[#8a2be2] border-none"
      >
        {isSimulating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Simulating...
          </>
        ) : (
          "Run Simulation"
        )}
      </Button>
    </div>
  );
}
