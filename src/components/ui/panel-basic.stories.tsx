import type { Meta, StoryObj } from "@storybook/react";
// Assuming you're using lucide-react for icons
import { PanelBasic } from "./panel-basic";

const meta = {
  title: "Base/PanelBasic",
  component: PanelBasic,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof PanelBasic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
