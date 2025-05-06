# Genshin Impact Wish Planner

A sophisticated planning tool for Genshin Impact players to optimize their wishes across multiple character banners. This application simulates the gacha mechanics of Genshin Impact to help players make informed decisions about how to spend their primogems.

## Features

- **Character Banner Planning**: Allocate wishes to specific upcoming character banners
- **Monte Carlo Simulation**: Run thousands of simulations to calculate success rates
- **Resource Tracking**: Keep track of your current primogems, starglitter, and wishes
- **Two Planning Modes**:
  - **Playground Mode**: Manually allocate wishes to characters and see success rates
  - **Strategy Mode**: Set priorities for characters and get optimized wish allocation recommendations

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/genshin-wish-planner.git
cd genshin-wish-planner
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev --turbopack
# or
yarn dev --turbopack
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## How It Works

### Account Setup

Enter your current account status:
- Current pity count (0-89)
- Guarantee status (50/50 or guaranteed)
- Current resources (primogems, starglitter, wishes)
- Welkin Moon and Battle Pass status for estimating future wishes

### Banner Planning

The app provides a list of upcoming character banners. For each banner:
1. Review the featured characters
2. In Playground Mode: Allocate wishes to each character you want
3. In Strategy Mode: Set priority levels for characters you want

### Simulation

After setting up your preferences:
1. Click "Run Simulation" to run thousands of Monte Carlo simulations
2. Review success rates for each character
3. See common outcome scenarios and their probabilities
4. In Strategy Mode, get recommended wish allocations based on your priorities

## Technologies Used

- Next.js with App Router
- React
- TypeScript
- TailwindCSS
- Shadcn UI Components

## Understanding Genshin Impact's Wish System

This planner implements Genshin Impact's complex pity and guarantee system:
- Base 5★ rate is 0.6%
- Soft pity starts at 74 pulls, gradually increasing until 90
- 50/50 system: First 5★ has 50% chance of being featured character
- If you lose 50/50, next 5★ is guaranteed to be the featured character
- Pity and guarantee carry over between banners of the same type

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests with improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This project is not affiliated with HoYoverse/miHoYo. Genshin Impact is a registered trademark of miHoYo Co., Ltd.