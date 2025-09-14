
import React, { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  }, [handleInput]);

  const insertPageBreak = useCallback(() => {
    const pageBreakHtml = '<div class="page-break" style="page-break-before: always; border-top: 2px dashed #666; margin: 20px 0; padding: 10px 0; text-align: center; color: #666; font-size: 12px;">--- Page Break ---</div>';
    document.execCommand('insertHTML', false, pageBreakHtml);
    handleInput();
  }, [handleInput]);

  const formatButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
  ];

  const alignButtons = [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
  ];

  const headingButtons = [
    { command: 'formatBlock', value: 'h1', icon: Heading1, label: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', icon: Heading2, label: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', icon: Heading3, label: 'Heading 3' },
    { command: 'formatBlock', value: 'p', icon: Type, label: 'Paragraph' },
  ];

  return (
    <div className={`border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-gray-700">
        {/* Headings */}
        {headingButtons.map(({ command, value, icon: Icon, label }) => (
          <Button
            key={`${command}-${value}`}
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command, value)}
            title={label}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-600" />
        
        {/* Text Formatting */}
        {formatButtons.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command)}
            title={label}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-600" />
        
        {/* Alignment */}
        {alignButtons.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command)}
            title={label}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-600" />
        
        {/* Lists */}
        {listButtons.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            variant="ghost"
            size="sm"
            onClick={() => executeCommand(command)}
            title={label}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-600" />
        
        {/* Special Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('formatBlock', 'blockquote')}
          title="Quote"
          className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertPageBreak}
          title="Insert Page Break"
          className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className={`min-h-[400px] p-4 text-gray-900 dark:text-white outline-none prose prose-gray dark:prose-invert max-w-none ${
            !value && !isEditorFocused ? 'text-gray-400 dark:text-gray-500' : ''
          }`}
          style={{
            lineHeight: '1.6',
            color: 'inherit'
          }}
        />
        
        {!value && !isEditorFocused && placeholder && (
          <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
