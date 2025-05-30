import { observer } from "mobx-react-lite";
import { createContext, ReactNode, useContext } from "react";
import { genshinState, GenshinState } from "./genshin-state";

export const GenshinContext = createContext<GenshinState>(genshinState);

export const GenshinProvider: React.FC<{ children: ReactNode }> = observer(
  ({ children }) => (
    <GenshinContext.Provider value={genshinState}>
      {children}
    </GenshinContext.Provider>
  )
);

export const useGenshinState = () => useContext(GenshinContext);
