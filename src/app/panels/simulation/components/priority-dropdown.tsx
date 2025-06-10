import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PRIORITY,
  Priority,
  PriorityTextToPriority,
  PriorityValueToText,
} from "@/lib/types";
import { observer } from "mobx-react-lite";

type PriorityDropdownProps = {
  currentPriority: number;
  setCurrentPriority: (p: Priority) => void;
};
export const PriorityDropdown = observer(
  ({ currentPriority, setCurrentPriority }: PriorityDropdownProps) => {
    return (
      <div className="space-y-1 flex flex-col items-end ">
        <div className="text-xs text-white text-right mr-4">Priority</div>
        <Select
          value={PriorityValueToText[currentPriority]}
          onValueChange={(value: string) =>
            setCurrentPriority(PriorityTextToPriority[value])
          }
        >
          <SelectTrigger className=" bg-void-1 border-void-2">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent className="bg-void-1 border-void-2">
            <SelectItem value="1" className="text-[#ff6b6b]">
              {PriorityValueToText[1]}
            </SelectItem>
            <SelectItem value="2" className="text-[#feca57]">
              {PriorityValueToText[2]}
            </SelectItem>
            <SelectItem value="3" className="text-[#1dd1a1]">
              {PriorityValueToText[3]}
            </SelectItem>
            <SelectItem
              value={DEFAULT_PRIORITY.toString()}
              className="text-muted-foreground"
            >
              {PriorityValueToText[DEFAULT_PRIORITY]}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);
