import { observer } from "mobx-react-lite";
import React, { createContext, ReactNode, useContext } from "react";
import { genshinState, GenshinState } from "./genshin-state";
import { useClientState } from "./use-client-state";

export const GenshinContext = createContext<GenshinState>(genshinState);

export const GenshinProvider: React.FC<{ children: ReactNode }> = observer(
  ({ children }) => {
    // Initialize client-side state hydration
    useClientState(genshinState);

    return (
      <GenshinContext.Provider value={genshinState}>
        {children}
      </GenshinContext.Provider>
    );
  }
);

export const useGenshinState = () => useContext(GenshinContext);
