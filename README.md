# Memory Palace

A 3D visualization tool that creates a memory palace based on text input. The application uses Three.js to create an immersive 3D environment where different concepts and emotions are represented as distinct rooms.

## Features

- Dynamic room generation based on text analysis
- Emotion-based room styling:
  - Positive emotions: bright, spacious rooms
  - Negative emotions: dark, confined spaces
  - Neutral emotions: balanced, moderate spaces
- WASD navigation between rooms
- Floating labels for each concept
- Interactive minimap for room teleportation
- OpenAI integration for text analysis

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/biatrix00/Memory-Palace.git
cd Memory-Palace
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
VITE_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Enter any text in the input field
2. The AI will analyze the text and create rooms for different concepts
3. Navigate between rooms using WASD keys
4. Click on rooms in the minimap to teleport
5. Each room's style reflects the emotional content of its concept

## Technologies Used

- React
- Three.js
- TypeScript
- OpenAI API
- Vite
- Tailwind CSS

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 