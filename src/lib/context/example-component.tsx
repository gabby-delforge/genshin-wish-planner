import { useReducer } from "react";
import { reducer } from "./reducer";
import { initialState } from "./types";

const ExampleComponent = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleClick = () => {
    dispatch({
      type: "SET_MODE",
      payload: state.mode === "playground" ? "optimizer" : "playground",
    });
  };
  return <button onClick={handleClick}>{state.mode}</button>;
};

export default ExampleComponent;
