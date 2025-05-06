"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CharacterSuccessRate,
  SimulationResultSummary,
  VersionId,
} from "@/lib/types";
import { getCharacterRarityColor } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useMemo } from "react";
import { useGenshin } from "@/lib/context/genshin-context";

export default function SimulationResults() {
  const { playground, optimizer, mode } = useGenshin();

  // Add debugging console logs
  console.log("SimulationResults rendering", {
    mode,
    playgroundResults: playground.simulationResults,
    optimizerResults: optimizer.simulationResults,
  });

  // Create flattened success rate summaries for display
  const flattenedResults = useMemo(() => {
    if (!playground.simulationResults && !optimizer.simulationResults)
      return [];

    const summaries: SimulationResultSummary[] = [];

    let characterSuccessRates: Record<VersionId, CharacterSuccessRate[]> = {};
    if (mode === "playground") {
      characterSuccessRates =
        playground.simulationResults?.characterSuccessRates || {};
    } else {
      characterSuccessRates =
        optimizer.simulationResults?.characterSuccessRates || {};
    }

    // Process each banner's character success rates
    Object.entries(characterSuccessRates).forEach(
      ([version, characterRates]) => {
        characterRates.forEach((charRate) => {
          // Only include characters with allocated wishes (rate > 0)
          if (charRate.rate > 0) {
            // Calculate average wishes for this character
            let averageWishes = 0;
            let successCount = 0;

            // Get all simulation results for this banner version
            const simulationResults =
              mode === "playground"
                ? playground.simulationResults
                : optimizer.simulationResults;

            const bannerResults =
              simulationResults?.bannerResults[version as VersionId] || [];

            // Count successful simulations and total wishes used
            bannerResults.forEach((result) => {
              const charResult = result.characterResults.find(
                (cr) => cr.character === charRate.character && cr.obtained
              );

              if (charResult) {
                averageWishes += charResult.wishesUsed;
                successCount++;
              }
            });

            // Calculate average wishes if there were any successes
            const avgWishes =
              successCount > 0 ? Math.round(averageWishes / successCount) : 0;

            summaries.push({
              banner: version,
              character: charRate.character,
              successRate: charRate.rate,
              averageWishes: avgWishes,
            });
          }
        });
      }
    );

    return summaries;
  }, [playground.simulationResults, optimizer.simulationResults, mode]);

  return (
    <Card className="bg-[#2a2c42]/80 border-[#4a4c72] backdrop-blur-sm mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#f5d0a9]">
          Simulation Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="success-rates">
          <TabsList className="bg-[#1a1b2e] mb-4">
            <TabsTrigger
              value="success-rates"
              className="data-[state=active]:bg-[#4a4c72]"
            >
              Success Rates
            </TabsTrigger>
            <TabsTrigger
              value="common-scenarios"
              className="data-[state=active]:bg-[#4a4c72]"
            >
              Common Scenarios
            </TabsTrigger>
            {mode === "optimizer" && (
              <TabsTrigger
                value="recommended-wishes"
                className="data-[state=active]:bg-[#4a4c72]"
              >
                Recommended Wishes
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="success-rates" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Success Rates by Character
              </h3>

              <div className="grid gap-2">
                {flattenedResults.length > 0 ? (
                  flattenedResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-[#1a1b2e] rounded-md p-3 border border-[#4a4c72]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-sm font-medium">
                            {result.banner} —{" "}
                          </span>
                          <span
                            className={`text-sm font-medium ${getCharacterRarityColor(
                              5
                            )}`}
                          >
                            {result.character}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {result.successRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-full bg-[#2a2c42] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#7b68ee] to-[#9370db] h-2 rounded-full"
                          style={{ width: `${result.successRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Average wishes needed: {result.averageWishes}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1a1b2e] rounded-md p-4 text-center">
                    <p className="text-muted-foreground">
                      No simulation results available. Run a simulation to see
                      results here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="common-scenarios" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Common Scenarios</h3>
              <p className="text-sm text-muted-foreground">
                These are the most likely outcomes based on your wish
                allocation.
              </p>

              <div className="space-y-4">
                {(mode === "playground"
                  ? playground.simulationResults?.scenarioBreakdown?.slice(
                      0,
                      5
                    ) || []
                  : optimizer.simulationResults?.scenarioBreakdown?.slice(
                      0,
                      5
                    ) || []
                ).map((scenario, idx) => (
                  <Card key={idx} className="bg-[#1a1b2e] border-[#4a4c72]">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-medium">
                          Scenario #{idx + 1}
                        </div>
                        <div className="text-sm font-medium text-[#f5d0a9]">
                          {scenario.percentage}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {scenario.pattern.split("").map((result, index) => {
                          let resultType: "Success" | "Missed" | "Skipped" =
                            "Skipped";
                          let character = "";

                          // Interpret the pattern character
                          if (result === "-") {
                            resultType = "Skipped";
                          } else if (result === "L") {
                            resultType = "Missed";
                          } else if (result === "S") {
                            resultType = "Missed"; // Lost 50/50
                            character = "Standard 5★";
                          } else {
                            resultType = "Success";
                            // Determine which character by position in banner
                            const simulationResults =
                              mode === "playground"
                                ? playground.simulationResults
                                : optimizer.simulationResults;

                            const bannerVersions = Object.keys(
                              simulationResults?.bannerResults || {}
                            );
                            if (index < bannerVersions.length) {
                              const version = bannerVersions[
                                index
                              ] as VersionId;
                              const bannerResults =
                                simulationResults?.bannerResults[version];
                              if (bannerResults && bannerResults.length > 0) {
                                const charIndex = parseInt(result) - 1;
                                const charResults =
                                  bannerResults[0].characterResults;
                                if (
                                  charResults &&
                                  charIndex >= 0 &&
                                  charIndex < charResults.length
                                ) {
                                  character = charResults[charIndex].character;
                                }
                              }
                            }
                          }

                          // Get the banner version if available
                          const simulationResults =
                            mode === "playground"
                              ? playground.simulationResults
                              : optimizer.simulationResults;

                          const bannerVersions = Object.keys(
                            simulationResults?.bannerResults || {}
                          );
                          const bannerName =
                            index < bannerVersions.length
                              ? bannerVersions[index]
                              : `Banner ${index + 1}`;

                          return (
                            <div
                              key={index}
                              className={`p-2 rounded-md text-center ${
                                resultType === "Success"
                                  ? "bg-[#1dd1a1]/20 border border-[#1dd1a1]/40"
                                  : resultType === "Missed"
                                  ? "bg-[#ff6b6b]/20 border border-[#ff6b6b]/40"
                                  : "bg-[#2a2c42] border border-[#4a4c72]"
                              }`}
                            >
                              <div className="text-xs font-medium mb-1">
                                {bannerName}
                              </div>
                              <div
                                className={`text-sm font-medium ${
                                  resultType === "Success"
                                    ? "text-[#1dd1a1]"
                                    : resultType === "Missed"
                                    ? "text-[#ff6b6b]"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {resultType}
                              </div>
                              {character && (
                                <div className="text-xs mt-1">{character}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {mode === "optimizer" && (
            <TabsContent value="recommended-wishes" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Recommended Wish Allocation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Based on your priorities, here&apos;s the optimal wish
                  allocation strategy.
                </p>

                <div className="grid gap-2">
                  {flattenedResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-[#1a1b2e] rounded-md p-3 border border-[#4a4c72] flex justify-between items-center"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {result.banner} —{" "}
                        </span>
                        <span
                          className={`text-sm font-medium ${getCharacterRarityColor(
                            5
                          )}`}
                        >
                          {result.character}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Recommended wishes:
                          </span>{" "}
                          <span className="font-medium text-[#f5d0a9]">
                            {result.averageWishes}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Success rate:
                          </span>{" "}
                          <span className="font-medium">
                            {result.successRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
