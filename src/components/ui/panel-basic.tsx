import { observer } from "mobx-react-lite";
import React from "react";
import { Card } from "./card";

type PanelBasicProps = {
  children?: React.ReactElement | React.ReactElement[];
  className?: string;
};
export const PanelBasic = observer(
  ({ children, className }: PanelBasicProps) => {
    return (
      <Card
        className={`${
          className ? className : ""
        } bg-bg-dark-2 border-void-2 backdrop-blur-sm`}
      >
        {children}
      </Card>
    );
  }
);
