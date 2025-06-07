import React, { useState, useEffect } from 'react';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  roomCount: number;
  hasApiKey: boolean;
}

type OnboardingStep = 'welcome' | 'familiar-space' | 'tutorial' | 'first-memory' | 'complete';

export default function TextInput({
  text,
  onTextChange,
  onAnalyze,
  isAnalyzing,
  roomCount,
  hasApiKey
}: TextInputProps) {
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [isSwitchChecked, setIsSwitchChecked] = useState(false);

  useEffect(() => {
    // Reset switch when analysis completes
    if (!isAnalyzing) {
      setIsSwitchChecked(false);
    }
  }, [isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      return;
    }
    setIsSwitchChecked(true);
    onAnalyze();
  };

  const handleOnboardingNext = () => {
    switch (onboardingStep) {
      case 'welcome':
        setOnboardingStep('familiar-space');
        break;
      case 'familiar-space':
        setOnboardingStep('tutorial');
        break;
      case 'tutorial':
        setOnboardingStep('first-memory');
        break;
      case 'first-memory':
        setOnboardingStep('complete');
        break;
    }
  };

  const renderOnboardingContent = () => {
    const CardContent = ({ title, content, buttonText }: { title: string; content: React.ReactNode; buttonText: string }) => (
      <div className="bg-gray-200 w-48 h-64 rounded-lg">
        <div className="flex p-2 gap-1">
          <div className="">
            <span className="bg-teal-500 inline-block center w-3 h-3 rounded-full"></span>
          </div>
          <div className="circle">
            <span className="bg-orange-500 inline-block center w-3 h-3 rounded-full"></span>
          </div>
          <div className="circle">
            <span className="bg-indigo-500 box inline-block center w-3 h-3 rounded-full"></span>
          </div>
        </div>
        <div className="card__content p-4">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <div className="mb-4">{content}</div>
          <button
            onClick={handleOnboardingNext}
            className="btn-96 w-full"
          >
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    );

    switch (onboardingStep) {
      case 'welcome':
        return (
          <CardContent
            title="Welcome to Memory Rooms! 🏠"
            content={<p>Transform your thoughts and memories into beautiful 3D spaces.</p>}
            buttonText="Let's Begin →"
          />
        );
      case 'familiar-space':
        return (
          <CardContent
            title="Choose Your Space 🎯"
            content={<p>Start with a familiar place - your childhood home, favorite park, or any space that holds meaning.</p>}
            buttonText="Next →"
          />
        );
      case 'tutorial':
        return (
          <CardContent
            title="How It Works 🎮"
            content={
              <ul className="list-disc list-inside">
                <li>Type your memory or thought</li>
                <li>Click the switch to analyze</li>
                <li>Watch as your memory transforms into a 3D space</li>
                <li>Navigate using the minimap</li>
              </ul>
            }
            buttonText="Create Your First Memory →"
          />
        );
      case 'first-memory':
        return (
          <CardContent
            title="Create Your First Memory ✨"
            content={<p>Try describing a simple memory or feeling. For example: "A sunny day at the beach with gentle waves."</p>}
            buttonText="Complete Tutorial →"
          />
        );
      case 'complete':
        return null;
    }
  };

  return (
    <div className="text-input-container">
      {!hasApiKey && showApiKeyWarning && (
        <div className="api-key-warning">
          <p>⚠️ Please add your Gemini API key to the .env file</p>
          <button 
            onClick={() => setShowApiKeyWarning(false)}
            className="box-button"
          >
            <div className="button">
              <span>✕</span>
            </div>
          </button>
        </div>
      )}

      {onboardingStep !== 'complete' && (
        <div className="onboarding-overlay">
          {renderOnboardingContent()}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-input-form">
        <div className="w-full max-w-xs p-5 bg-black/20 backdrop-blur-md rounded-lg font-mono border border-white/10">
          <label className="block text-white/80 text-sm font-bold mb-2" htmlFor="text-input">
            Enter your text for analysis
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type your text here..."
            className="text-sm custom-input w-full px-4 py-2 border border-white/20 rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:-translate-y-1 focus:outline-blue-300 hover:shadow-lg hover:border-blue-300 bg-black/30 text-white placeholder-white/50 resize-none h-32"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            className="btn-96 analyze-button"
            disabled={isAnalyzing || !hasApiKey}
          >
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Text'}</span>
          </button>
        </div>
      </form>

      {roomCount > 0 && (
        <div className="room-count">
          🗺️ {roomCount} {roomCount === 1 ? 'room' : 'rooms'} generated
        </div>
      )}
    </div>
  );
}