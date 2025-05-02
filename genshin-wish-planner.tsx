import React, { useState, useEffect } from 'react';


// Types
type BannerSetup = {
  id: number;
  version: string;
  characters: string[];
  targetCharacters: string[];
  wishesToSpend: number;
  estimatedNewWishes: number;
};

type SimulationResult = {
  banner: number;
  success: boolean;
  wishesUsed: number;
  endPity: number;
  endGuaranteed: boolean;
};

type ScenarioResult = {
  pattern: string;
  count: number;
  percentage: string;
};

type WishResources = {
  primogems: number;
  starglitter: number;
  wishes: number;
};

// Wish Simulator
class WishSimulator {
  pity: number;
  guaranteed: boolean;

  constructor(startingPity = 0, guaranteed = false) {
    this.pity = startingPity;
    this.guaranteed = guaranteed;
  }
  
  get5StarProbability(): number {
    if (this.pity < 73) {
      return 0.006; // Base rate
    } else if (this.pity < 89) {
      // Soft pity - increases with each pull
      return 0.006 + (this.pity - 72) * 0.06;
    } else {
      return 1.0; // Hard pity (90th pull)
    }
  }
  
  wish(): string {
    this.pity++;
    const prob = this.get5StarProbability();
    
    if (Math.random() < prob) {
      // Reset pity
      this.pity = 0;
      
      // Check if guaranteed
      if (this.guaranteed) {
        this.guaranteed = false;
        return "featured";
      } else {
        // 50/50 chance
        if (Math.random() < 0.5) {
          return "featured";
        } else {
          this.guaranteed = true;
          return "standard";
        }
      }
    }
    
    return "non-5-star";
  }
}

// Main Component
const GenshinWishPlanner = () => {
  // State for current status
  const [currentPity, setCurrentPity] = useState(0);
  const [isGuaranteed, setIsGuaranteed] = useState(false);
  const [simulations, setSimulations] = useState(10000);
  
  // State for simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  
  // State for wish resources
  const [wishResources, setWishResources] = useState({
    primogems: 0,
    starglitter: 0,
    wishes: 0
  });
  
  // State for estimated wishes
  const [addEstimatedWishes, setAddEstimatedWishes] = useState(false);
  const [hasWelkin, setHasWelkin] = useState(false);
  const [hasBattlePass, setHasBattlePass] = useState(false);
  
  // State for banners
  const [banners, setBanners] = useState([
    {
      id: 1,
      version: "5.6 Phase 1",
      characters: [
        { name: "Escoffier", wishesToSpend: 0 },
        { name: "Navia", wishesToSpend: 0 }
      ],
      estimatedNewWishes: 0
    },
    {
      id: 2,
      version: "5.6 Phase 2",
      characters: [
        { name: "Kinich", wishesToSpend: 0 },
        { name: "Raiden", wishesToSpend: 0 }
      ],
      estimatedNewWishes: 0
    },
    {
      id: 3,
      version: "5.7 Phase 1",
      characters: [
        { name: "Mavuika", wishesToSpend: 0 },
        { name: "Skirk", wishesToSpend: 0 }
      ],
      estimatedNewWishes: 0
    }
  ]);
  
  // State for simulation results
  const [simulationResults, setSimulationResults] = useState(null);
  
  // Calculate total available wishes
  const calculateTotalAvailableWishes = () => {
    const primoWishes = Math.floor(wishResources.primogems / 160);
    const starglitterWishes = Math.floor(wishResources.starglitter / 5);
    return primoWishes + starglitterWishes + wishResources.wishes;
  };
  
  // Calculate total wishes to spend
  const calculateTotalWishesToSpend = () => {
    return banners.reduce((sum, banner) => {
      const bannerTotal = banner.characters.reduce((charSum, char) => charSum + char.wishesToSpend, 0);
      return sum + bannerTotal;
    }, 0);
  };
  
  // Calculate wishes available for a specific banner
  const calculateAvailableWishesForBanner = (bannerIndex) => {
    let availableWishes = calculateTotalAvailableWishes(); // Start with initial wishes
    
    // Add estimated wishes from previous banners and subtract spent wishes
    for (let i = 0; i < bannerIndex; i++) {
      availableWishes += banners[i].estimatedNewWishes;
      
      // Subtract all character wishes in this banner
      banners[i].characters.forEach(char => {
        availableWishes -= char.wishesToSpend;
      });
    }
    
    // Add estimated wishes from current banner
    availableWishes += banners[bannerIndex].estimatedNewWishes;
    
    return Math.max(0, availableWishes);
  };
  
  // Calculate wishes remaining
  const calculateWishesRemaining = () => {
    let totalAvailable = calculateTotalAvailableWishes();
    let totalPlanned = 0;
    
    // Process each banner in sequence
    for (let i = 0; i < banners.length; i++) {
      // Add new wishes from this banner
      totalAvailable += banners[i].estimatedNewWishes;
      
      // Calculate total wishes spent in this banner
      const bannerSpend = banners[i].characters.reduce((sum, char) => sum + char.wishesToSpend, 0);
      
      // Add to planned wishes (limited by what's available)
      const wishesForThisBanner = Math.min(bannerSpend, totalAvailable);
      totalPlanned += wishesForThisBanner;
      
      // Subtract from available
      totalAvailable -= wishesForThisBanner;
    }
    
    return totalAvailable;
  };
  
  // Check if wishes exceed available
  const calculateWishesExceedAvailable = () => {
    return calculateTotalWishesToSpend() > calculateTotalAvailableWishes() && calculateTotalAvailableWishes() > 0;
  };
  
  // Calculate estimated new wishes per banner
  const calculateEstimatedWishes = () => {
    if (!addEstimatedWishes) return 0;
    
    // Estimated wishes per phase (21 days)
    // Base: Daily commissions, events, etc.
    let estimatedWishes = 22; // About 3600 primos per phase from base sources
    
    // Welkin Moon: 90 primos per day = 1890 primos per phase = ~12 wishes
    if (hasWelkin) {
      estimatedWishes += 12;
    }
    
    // Battle Pass: About 8-10 wishes per patch, so ~4-5 per phase
    if (hasBattlePass) {
      estimatedWishes += 5;
    }
    
    return Math.floor(estimatedWishes);
  };
  
  // Update banner
  const updateBanner = (index, field, value) => {
    const newBanners = [...banners];
    
    if (field === 'targetCharacter') {
      newBanners[index][field] = value;
    } else if (field === 'wishesToSpend') {
      // Make sure wishes don't exceed available wishes for this banner
      let newWishValue = parseInt(value) || 0;
      const availableForThisBanner = calculateAvailableWishesForBanner(index);
      
      // Limit to available wishes
      if (availableForThisBanner > 0) {
        newWishValue = Math.min(newWishValue, availableForThisBanner);
      }
      
      newBanners[index][field] = newWishValue;
    }
    
    setBanners(newBanners);
  };
  
  // Run simulation
  const runSimulation = () => {
    // Start simulation progress
    setIsSimulating(true);
    setSimulationProgress(0);
    
    // Small delay to allow UI to update
    setTimeout(() => {
      // Track accumulated wishes through banners
      let accumulatedWishes = calculateTotalAvailableWishes();
      
      // Validate inputs and create a copy of banners with wish limits applied
      const runValidBanners = [];
      
      // Process each banner in sequence
      for (let i = 0; i < banners.length; i++) {
        const banner = banners[i];
        
        // Add newly accumulated wishes from this banner
        accumulatedWishes += banner.estimatedNewWishes;
        
        // Calculate actual wishes to spend (limited by available wishes)
        const actualWishesToSpend = Math.min(banner.wishesToSpend, accumulatedWishes);
        
        // Update accumulated wishes (subtract what was spent)
        accumulatedWishes -= actualWishesToSpend;
        
        // Add banner with actual wishes to spend
        runValidBanners.push({
          ...banner,
          wishesToSpend: actualWishesToSpend,
          // Keep estimated wishes for UI consistency
          estimatedNewWishes: banner.estimatedNewWishes
        });
      }
      
      // Run simulation with progress updates
      const totalSimulations = simulations;
      const batchSize = Math.min(1000, Math.floor(totalSimulations / 10));
      let completedSimulations = 0;
      const allResults = [];
      
      const runSimulationBatch = () => {
        // Run a batch of simulations
        const batchToRun = Math.min(batchSize, totalSimulations - completedSimulations);
        
        for (let i = 0; i < batchToRun; i++) {
          let currentPityValue = currentPity;
          let isGuaranteedValue = isGuaranteed;
          const bannerResults = [];
          
          // For each banner
          for (let j = 0; j < runValidBanners.length; j++) {
            const banner = runValidBanners[j];
            const simulator = new WishSimulator(currentPityValue, isGuaranteedValue);
            
            // Use only what was planned to spend
            const wishesToSpend = banner.wishesToSpend;
            
            // If no wishes to spend, always 0% chance
            if (wishesToSpend <= 0) {
              bannerResults.push({
                banner: banner.id,
                success: false,
                targets: banner.targetCharacters.map(char => ({ character: char, obtained: false })),
                wishesUsed: 0,
                endPity: currentPityValue,
                endGuaranteed: isGuaranteedValue
              });
              continue;
            }
            
            // Simulate pulls for this banner
            let pulls = 0;
            let obtained5Stars = [];
            let result;
            
            while (pulls < wishesToSpend) {
              pulls++;
              result = simulator.wish();
              
              if (result === "featured") {
                // Select a random character from the banner
                const featuredChar = banner.characters[Math.floor(Math.random() * banner.characters.length)];
                obtained5Stars.push(featuredChar);
              }
            }
            
            // Check if target characters were obtained
            const targetResults = banner.targetCharacters.map(char => ({
              character: char,
              obtained: obtained5Stars.includes(char)
            }));
            
            // Check if any target was obtained
            const anyTargetObtained = targetResults.some(r => r.obtained);
            
            bannerResults.push({
              banner: banner.id,
              success: anyTargetObtained,
              targets: targetResults,
              wishesUsed: pulls,
              endPity: simulator.pity,
              endGuaranteed: simulator.guaranteed
            });
            
            // Update state for next banner
            currentPityValue = simulator.pity;
            isGuaranteedValue = simulator.guaranteed;
          }
          
          allResults.push(bannerResults);
        }
        
        completedSimulations += batchToRun;
        const progress = Math.floor((completedSimulations / totalSimulations) * 100);
        setSimulationProgress(progress);
        
        // Continue with next batch or finalize
        if (completedSimulations < totalSimulations) {
          setTimeout(runSimulationBatch, 0);
        } else {
          // Calculate success rates for individual characters
          const characterSuccessRates = runValidBanners.map((banner, index) => {
            // If no wishes spent on this banner, return 0% for all characters
            if (banner.wishesToSpend <= 0) {
              return banner.targetCharacters.map(char => ({
                character: char,
                rate: 0
              }));
            }
            
            return banner.targetCharacters.map(char => {
              const successes = allResults.filter(sim => 
                sim[index].targets.some(t => t.character === char && t.obtained)
              ).length;
              
              return {
                character: char,
                rate: (successes / totalSimulations) * 100
              };
            });
          });
          
          // Calculate overall banner success rates (any target character)
          const bannerSuccessRates = runValidBanners.map((banner, index) => {
            // If no wishes spent on this banner, return 0%
            if (banner.wishesToSpend <= 0) {
              return 0;
            }
            
            const successes = allResults.filter(sim => sim[index].success).length;
            return (successes / totalSimulations) * 100;
          });
          
          // Find common scenarios
          const scenarioCounts = {};
          allResults.forEach(simResults => {
            const pattern = simResults.map(r => r.success ? "W" : "L").join("");
            if (!scenarioCounts[pattern]) {
              scenarioCounts[pattern] = 0;
            }
            scenarioCounts[pattern]++;
          });
          
          // Convert to array and sort
          const scenarioBreakdown = Object.entries(scenarioCounts)
            .map(([pattern, count]) => ({
              pattern,
              count,
              percentage: ((count / totalSimulations) * 100).toFixed(1) + "%"
            }))
            .sort((a, b) => b.count - a.count);
            
          setSimulationResults({ 
            results: allResults, 
            characterSuccessRates,
            bannerSuccessRates, 
            scenarioBreakdown,
            availableWishes: runValidBanners.map(b => b.wishesToSpend)
          });
          setIsSimulating(false);
        }
      };
      
      // Start the first batch
      runSimulationBatch();
    }, 50);
  };
  
  // Update estimated wishes when settings change
  useEffect(() => {
    const estimatedWishCount = calculateEstimatedWishes();
    const updatedBanners = [...banners];
    
    // Update estimated wishes for each banner
    for (let i = 0; i < updatedBanners.length; i++) {
      updatedBanners[i].estimatedNewWishes = addEstimatedWishes ? estimatedWishCount : 0;
    }
    
    setBanners(updatedBanners);
  }, [addEstimatedWishes, hasWelkin, hasBattlePass]);
  
  const interpretPattern = (pattern) => {
    return pattern.split('').map((char, index) => {
      const banner = banners[index];
      const characters = banner.targetCharacters.join('/');
      return `${banner.version} (${characters}): ${char === 'W' ? 'Got at least one!' : 'Missed all'} `;
    }).join(' → ');
  };
  
  // Run initial simulation
  useEffect(() => {
    runSimulation();
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-800">Genshin Impact Wish Planner</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Current Status</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Current Pity</label>
            <input 
              type="number"
              min="0"
              max="89"
              value={currentPity}
              onChange={e => setCurrentPity(Math.min(89, parseInt(e.target.value) || 0))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Guarantee Status</label>
            <select
              value={isGuaranteed ? "true" : "false"}
              onChange={e => setIsGuaranteed(e.target.value === "true")}
              className="w-full p-2 border rounded"
            >
              <option value="false">50/50 (Lost last 50/50? No)</option>
              <option value="true">Guaranteed (Lost last 50/50? Yes)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Simulation Count</label>
            <input
              type="number"
              min="1000"
              max="1000000"
              step="1000"
              value={simulations}
              onChange={e => setSimulations(Math.max(1000, parseInt(e.target.value) || 10000))}
              className="w-full p-2 border rounded"
            />
            <div className="text-xs text-gray-500 mt-1">Higher values are more accurate but slower</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Wish Resources</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Primogems</label>
            <input 
              type="number"
              min="0"
              value={wishResources.primogems}
              onChange={e => setWishResources({...wishResources, primogems: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded"
              placeholder="Enter primogems"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Starglitter</label>
            <input 
              type="number"
              min="0"
              value={wishResources.starglitter}
              onChange={e => setWishResources({...wishResources, starglitter: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded"
              placeholder="Enter starglitter"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">Wishes</label>
            <input 
              type="number"
              min="0"
              value={wishResources.wishes}
              onChange={e => setWishResources({...wishResources, wishes: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded"
              placeholder="Enter wishes"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-indigo-800 font-medium">
            Total Available Wishes: {calculateTotalAvailableWishes()}
          </div>
          
          {calculateWishesExceedAvailable() && (
            <div className="text-red-600 font-medium">
              Warning: Planned wishes exceed available wishes!
            </div>
          )}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-2">Estimated Future Wishes</h3>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="addEstimatedWishes"
              checked={addEstimatedWishes}
              onChange={e => setAddEstimatedWishes(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="addEstimatedWishes" className="text-sm">
              Add estimated wishes per banner (helps with future planning)
            </label>
          </div>
          
          {addEstimatedWishes && (
            <div className="flex gap-4 mt-2 pl-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="welkin"
                  checked={hasWelkin}
                  onChange={e => setHasWelkin(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="welkin" className="text-sm">Welkin Moon</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="battlepass"
                  checked={hasBattlePass}
                  onChange={e => setHasBattlePass(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="battlepass" className="text-sm">Battle Pass</label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Banner Setup</h2>
        
        {banners.map((banner, index) => (
          <div key={banner.id} className="mb-4 p-3 border-l-4 border-indigo-500 bg-indigo-50 rounded">
            <h3 className="font-medium mb-3">Banner {banner.version}</h3>
            
            {/* Available wishes for this banner */}
            <div className="mb-3 text-sm text-indigo-800 font-medium">
              Available wishes for this banner: {calculateAvailableWishesForBanner(index)}
            </div>
            
            {/* Character wish allocation */}
            <div className="bg-white p-3 rounded border mb-3">
              <div className="grid grid-cols-2 gap-2 mb-2 font-medium text-sm">
                <div>Character</div>
                <div>Wishes to Spend</div>
              </div>
              
              {banner.characters.map((character, charIndex) => (
                <div key={character.name} className="grid grid-cols-2 gap-2 mb-2 items-center">
                  <div>{character.name}</div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max={calculateAvailableWishesForBanner(index) - 
                            banner.characters.reduce((sum, c, i) => 
                              sum + (i === charIndex ? 0 : c.wishesToSpend), 0)}
                      value={character.wishesToSpend}
                      onChange={e => updateCharacterWishes(index, charIndex, e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {addEstimatedWishes && (
              <div className="mt-2 pl-2 text-sm">
                <span className="font-medium text-green-700">+{banner.estimatedNewWishes} estimated new wishes</span> accumulated during this banner
                <div className="mt-1 text-indigo-600 font-medium">
                  These wishes can be spent on this banner or saved for future banners
                </div>
              </div>
            )}
          </div>
        ))}
        
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className={`w-full mt-4 py-2 ${isSimulating ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded transition`}
        >
          {isSimulating ? `Simulating... ${simulationProgress}%` : 'Run Simulation'}
        </button>
        
        {/* Progress bar */}
        {isSimulating && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${simulationProgress}%` }}
            ></div>
          </div>
        )}
        
        {/* Floating wishes remaining indicator */}
        {calculateTotalAvailableWishes() > 0 && (
          <div className="fixed bottom-4 right-4 bg-indigo-700 text-white py-2 px-4 rounded-full shadow-lg z-10">
            <span className="font-bold">{calculateWishesRemaining()}</span> wishes remaining
          </div>
        )}
      </div>
      
      {simulationResults && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Simulation Results</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Success Rates by Character</h3>
            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner, bannerIndex) => (
                <div key={banner.id} className="border rounded p-3">
                  <div className="font-medium text-indigo-800 mb-2">
                    Banner {banner.version}
                    {simulationResults.availableWishes?.[bannerIndex] > 0 ? (
                      <> — {simulationResults.availableWishes?.[bannerIndex]} wishes</>
                    ) : (
                      <> — Not wishing on this banner</>
                    )}
                  </div>
                  
                  {simulationResults.characterSuccessRates[bannerIndex].map(result => (
                    <div key={result.character} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span>{result.character}</span>
                        <span className="font-bold">{result.rate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${result.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Any Target Character</span>
                      <span className="font-bold">{simulationResults.bannerSuccessRates[bannerIndex].toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${simulationResults.bannerSuccessRates[bannerIndex]}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Common Scenarios</h3>
            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scenario
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulationResults.scenarioBreakdown.slice(0, 5).map((scenario, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        {interpretPattern(scenario.pattern)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {scenario.percentage}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: scenario.percentage }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-center text-gray-500">
        <p>Note: This simulator uses the standard 5-star rates (0.6% base, soft pity at 74+, hard pity at 90) for the Limited Character Banner.</p>
      </div>
    </div>
  );
};

export default GenshinWishPlanner;
