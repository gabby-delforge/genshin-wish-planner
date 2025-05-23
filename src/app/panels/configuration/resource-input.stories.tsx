import type { Meta, StoryObj } from "@storybook/react";
import { ResourceInput } from "./resource-input";

const meta = {
  title: "App/ResourceInput",
  component: ResourceInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ResourceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Resource",
    amount: 0,
    handleChange: () => {},
    isLoading: false,
    type: "primogem",
  },
};
