import React from "react";
import { CardContent, CardHeader, CardTitle } from "./card";
import { PanelBasic } from "./panel-basic";
import { Separator } from "./separator";

type PanelProps = {
  title: string | React.ReactElement;
  icon?: React.ReactNode;
  topRight?: React.ReactNode;
  className?: string;
  children?: React.ReactElement | React.ReactElement[];
};
export const Panel = ({
  title,
  icon,
  topRight = null,
  className = "",
  children,
}: PanelProps) => {
  return (
    <PanelBasic className={className}>
      {topRight ? (
        <div className="absolute top-0 right-0 mr-3 mt-3">{topRight}</div>
      ) : (
        <></>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="h4 pb-2">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              {icon && icon}
              {/* TODO: This size isn't working properly */}
              {title}
            </div>
          </div>
        </CardTitle>
        <Separator className="bg-void-2/50 mb-2" />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </PanelBasic>
  );
};
