import type { Meta, StoryObj } from "@storybook/react";
import BannerCard from "./banner-card";

const meta = {
  title: "Components/BannerCard",
  component: BannerCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BannerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    banner: {
      id: "5.6v1",
      version: "5.6v1",
      name: "5.6v1",
      startDate: "01-01-25",
      endDate: "01-31-25",
      characters: [],
    },
    mode: "playground",
    allocation: {},
    availableWishes: {},
    estimatedNewWishesPerBanner: 25,
    updateBannerConfiguration: () => {},
  },
};
