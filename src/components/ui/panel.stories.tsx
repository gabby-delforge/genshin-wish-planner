import type { Meta, StoryObj } from "@storybook/react";
// Assuming you're using lucide-react for icons
import { Panel } from "./panel";

const meta = {
  title: "Base/Panel",
  component: Panel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Panel",
    icon: null,
  },
};
