"use client";

import { Panel } from "@/components/ui/panel";
import { BookMarked } from "lucide-react";
import { observer } from "mobx-react-lite";
import { SimulationResults } from "./simulation-results";

const SimulationResultsPanel = observer(() => {
  return (
    <Panel title="Simulation Results" icon={<BookMarked />}>
      <SimulationResults />
    </Panel>
  );
});

export default SimulationResultsPanel;
