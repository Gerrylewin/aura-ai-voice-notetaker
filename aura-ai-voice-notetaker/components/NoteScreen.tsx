
import React, { useState, useCallback } from 'react';
import { Conversation, ChatMessage, AIAnalysis } from '../types';
import { continueConversation, analyzeTranscript } from '../services/geminiService';
import { ChatInterface } from './ChatInterface';
import { ArrowLeftIcon, CheckIcon, PencilIcon } from './icons';

interface NoteScreenProps {
  conversation: Conversation;
  onSave: (conversation: Conversation) => void;
  onBack: () => void;
}

const AnalysisSection: React.FC<{title: string, items: string[]}> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h4 className="text-md font-semibold text-gray-300 mt-4 mb-2">{title}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    );
}

export const NoteScreen: React.FC<NoteScreenProps> = ({ conversation, onSave, onBack }) => {
  const [editableTranscript, setEditableTranscript] = useState(conversation.transcript);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis>(conversation.analysis);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(conversation.chatHistory);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveTranscript = async () => {
    if (editableTranscript === conversation.transcript) {
        setIsEditing(false);
        return;
    }
    setIsSaving(true);
    // Re-analyze the edited transcript
    const { title, ...newAnalysis } = await analyzeTranscript(editableTranscript);
    setCurrentAnalysis(newAnalysis);
    
    const updatedConversation: Conversation = {
        ...conversation,
        transcript: editableTranscript,
        analysis: newAnalysis,
        title: title, // Update title as well
    };
    onSave(updatedConversation);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: prompt };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const aiResponse = await continueConversation(updatedHistory);
      const newAiMessage: ChatMessage = { role: 'model', content: aiResponse };
      
      const finalHistory = [...updatedHistory, newAiMessage];
      setChatHistory(finalHistory);

      onSave({ ...conversation, chatHistory: finalHistory });

    } catch (error) {
      console.error("AI chat failed:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "I'm having trouble connecting. Please try again later." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory, conversation, onSave]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[85vh]">
       <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors z-10">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <header className="text-center mb-6">
        <h2 className="text-xl font-semibold">{conversation.title}</h2>
        <p className="text-sm text-gray-500">{new Date(conversation.createdAt).toLocaleString()}</p>
      </header>
      
      <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6">
        {/* Transcript Section */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-200">Transcript</h3>
                {isEditing ? (
                    <button onClick={handleSaveTranscript} disabled={isSaving} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save'} <CheckIcon className="w-5 h-5"/>
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-gray-400 hover:text-white">
                        Edit <PencilIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
            {isEditing ? (
                <textarea 
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full h-48 bg-gray-900 rounded-lg p-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Editable Transcript"
                />
            ) : (
                <div className="flex justify-end">
                    <p className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-blue-600 text-white rounded-br-none whitespace-pre-wrap break-words">{editableTranscript}</p>
                </div>
            )}
        </div>

        {/* AI Analysis Section */}
        <div>
            <h3 className="text-lg font-semibold text-gray-200">AI Analysis</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 mt-2 space-y-2">
                <div>
                    <h4 className="text-md font-semibold text-gray-300">Summary</h4>
                    <p className="text-gray-400">{currentAnalysis.summary}</p>
                </div>
                 <div>
                    <h4 className="text-md font-semibold text-gray-300 mt-4">Sentiment</h4>
                    <p className="inline-block bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-sm">{currentAnalysis.sentiment}</p>
                </div>
                <AnalysisSection title="Key Topics" items={currentAnalysis.keyTopics} />
                <AnalysisSection title="Action Items" items={currentAnalysis.actionItems} />
                <AnalysisSection title="Questions" items={currentAnalysis.questions} />
            </div>
        </div>
        
        {/* Chat Section */}
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Chat with Aura</h3>
             <ChatInterface 
                messages={chatHistory} 
                isLoading={isLoading} 
                onSendMessage={handleSendMessage}
            />
        </div>
      </div>
    </div>
  );
};
