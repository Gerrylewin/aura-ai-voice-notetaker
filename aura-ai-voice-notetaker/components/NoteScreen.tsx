import React, { useState, useCallback, useEffect } from 'react';
import { continueConversation, analyzeTranscript } from '../services/geminiService';
import { ChatInterface } from './ChatInterface';
import { NoteActionsToolbar } from './NoteActionsToolbar';

const AnalysisSection = ({ title, items }) => {
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

export const NoteScreen = ({ conversation, onSave, onNewConversation }) => {
  const [editableTranscript, setEditableTranscript] = useState(conversation.transcript);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(conversation.analysis);
  const [chatHistory, setChatHistory] = useState(conversation.chatHistory);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset state when conversation changes
  useEffect(() => {
    setEditableTranscript(conversation.transcript);
    setCurrentAnalysis(conversation.analysis);
    setChatHistory(conversation.chatHistory);
    setIsEditing(false);
    setIsSaving(false);
  }, [conversation]);

  const isDirty = editableTranscript !== conversation.transcript;

  const handleReanalyze = async () => {
    setIsSaving(true);
    const { title, ...newAnalysis } = await analyzeTranscript(editableTranscript);
    setCurrentAnalysis(newAnalysis);
    
    const updatedConversation = {
        ...conversation,
        transcript: editableTranscript,
        analysis: newAnalysis,
        title: title,
    };
    onSave(updatedConversation);
    setIsSaving(false);
    setIsEditing(false);
  };
  
  const handleSaveTranscript = async () => {
    if (!isDirty) {
        setIsEditing(false);
        return;
    }
    await handleReanalyze();
  };

  const handleSendMessage = useCallback(async (prompt) => {
    if (!prompt.trim()) return;

    const newUserMessage = { role: 'user', content: prompt };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const aiResponse = await continueConversation(updatedHistory);
      const newAiMessage = { role: 'model', content: aiResponse };
      
      const finalHistory = [...updatedHistory, newAiMessage];
      setChatHistory(finalHistory);

      onSave({ ...conversation, chatHistory: finalHistory });

    } catch (error) {
      console.error("AI chat failed:", error);
      const errorMessage = { role: 'model', content: "I'm having trouble connecting. Please try again later." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory, conversation, onSave]);
  
  const handleDownload = () => {
    const { title, createdAt } = conversation;
    const transcript = editableTranscript;
    const analysis = currentAnalysis;

    let content = `Title: ${title}\n`;
    content += `Created At: ${new Date(createdAt).toLocaleString()}\n\n`;
    content += `--- Transcript ---\n${transcript}\n\n`;
    content += `--- AI Analysis ---\n`;
    content += `Summary: ${analysis.summary}\n`;
    content += `Sentiment: ${analysis.sentiment}\n`;
    if(analysis.keyTopics?.length > 0) content += `Key Topics: ${analysis.keyTopics.join(', ')}\n`;
    if(analysis.actionItems?.length > 0) content += `Action Items: ${analysis.actionItems.join(', ')}\n`;
    if(analysis.questions?.length > 0) content += `Questions: ${analysis.questions.join(', ')}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDuplicate = () => {
      if (!onNewConversation) return;
      const newConversation = {
          id: new Date().toISOString(),
          title: `Copy of ${conversation.title}`,
          createdAt: new Date().toISOString(),
          transcript: editableTranscript,
          analysis: currentAnalysis,
          chatHistory: [], // Start with a fresh chat
      };
      onNewConversation(newConversation);
      alert('Note duplicated successfully!');
  };

  return (
    <div className="bg-gray-900 md:bg-transparent flex flex-col h-full">
        <header className="text-center mb-2 md:mb-6 flex-shrink-0 hidden md:block">
            <h2 className="text-2xl font-semibold">{conversation.title}</h2>
            <p className="text-sm text-gray-500">{new Date(conversation.createdAt).toLocaleString()}</p>
        </header>

        <NoteActionsToolbar
            isDirty={isDirty}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={handleSaveTranscript}
            onEditToggle={() => setIsEditing(!isEditing)}
            onDownload={handleDownload}
            onReanalyze={handleReanalyze}
            onShare={() => alert('Share functionality coming soon!')}
            onDuplicate={handleDuplicate}
        />
      
      <div className="flex-grow overflow-y-auto p-4 md:p-6 md:pt-2 space-y-6">
        {/* Transcript Section */}
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Transcript</h3>
            {isEditing ? (
                <textarea 
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-gray-800 rounded-lg p-4 mt-2 space-y-2">
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