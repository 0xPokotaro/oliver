import { VoiceInput } from "./_components/voice-input";

const AIAgentPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">AI Agent - 音声入力</h1>
      <VoiceInput />
    </div>
  );
};

export default AIAgentPage;
