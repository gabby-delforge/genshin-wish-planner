import { CaretUpIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Plus } from "lucide-react"; // Assuming you're using lucide-react for icons
import { IconButton } from "./icon-button";

const meta = {
  title: "Base/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onClick: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Plus />,
    icon: CaretUpIcon,
    "aria-label": "Add item",
  },
};
