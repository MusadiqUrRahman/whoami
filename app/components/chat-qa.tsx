'use client';

import { useState, useRef, useEffect } from 'react';
import rawQaData from '@/data/qa.json';

interface QaEntry {
  patterns: string[];
  answer: string;
  more?: string;
}

const qaData = rawQaData as QaEntry[];

interface ChatEntry {
  id: number;
  question: string;
  answer: string;
  streamedAnswer: string;
  isStreaming: boolean;
}

const STREAM_INTERVAL = 18;
const STREAM_CHUNK_MIN = 2;
const STREAM_CHUNK_MAX = 6;

const FOLLOW_UP_PATTERNS = [
  /^(tell me more|elaborate|explain|expand|go on|continue|more|further|details?|expand on that|tell me about it|i see,? tell me more|interesting,? tell me more|ok,? tell me more)/i,
];

function Cursor() {
  return <span className="inline-block w-[10px] h-[18px] bg-accent align-text-bottom animate-blink cursor-glow rounded-sm" />;
}

export default function ChatQA() {
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const lastMatchIdx = useRef<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  function isFollowUp(input: string): boolean {
    const trimmed = input.trim();
    return FOLLOW_UP_PATTERNS.some(p => p.test(trimmed));
  }

  function findMatch(lower: string): { answer: string; idx: number } | null {
    for (let i = 0; i < qaData.length; i++) {
      const qa = qaData[i];
      for (const pattern of qa.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(lower)) return { answer: qa.answer, idx: i };
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  function getAnswer(input: string): string {
    const lower = input.toLowerCase().trim();

    if (isFollowUp(input) && lastMatchIdx.current !== null) {
      const qa = qaData[lastMatchIdx.current];
      if (qa.more) return qa.more;
      return `That's all I have on that topic. Try asking something else — background, skills, projects, or anything else.`;
    }

    const match = findMatch(lower);
    if (match) {
      lastMatchIdx.current = match.idx;
      return match.answer;
    }

    return `I don't have an answer for "${input}" — but you can ask about my background, skills, projects, tech stack, location, or contact info. Or reach out directly at syedmusadiq.rahman@gmail.com`;
  }

  function streamAnswer(id: number, text: string) {
    let pos = 0;
    const t = setInterval(() => {
      const chunk = STREAM_CHUNK_MIN + Math.floor(Math.random() * (STREAM_CHUNK_MAX - STREAM_CHUNK_MIN + 1));
      pos = Math.min(pos + chunk, text.length);
      setHistory(prev =>
        prev.map(e => (e.id === id ? { ...e, streamedAnswer: text.slice(0, pos) } : e))
      );
      if (pos >= text.length) {
        clearInterval(t);
        setHistory(prev =>
          prev.map(e => (e.id === id ? { ...e, isStreaming: false } : e))
        );
        setIsProcessing(false);
      }
    }, STREAM_INTERVAL);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || isProcessing) return;

    setInput('');
    setIsProcessing(true);

    const answer = getAnswer(q);
    const id = nextId.current++;

    setHistory(prev => [
      ...prev,
      { id, question: q, answer, streamedAnswer: '', isStreaming: true },
    ]);

    streamAnswer(id, answer);
  }

  return (
    <div className="border-t border-border pt-4 mt-6">
      <div ref={scrollRef} className="space-y-5 max-h-[40vh] sm:max-h-[420px] overflow-y-auto">
        {history.map(entry => (
          <div key={entry.id}>
            <p className="text-base sm:text-lg mb-2">
              <span className="text-accent">&gt; </span>
              <span className="text-accent">{entry.question}</span>
            </p>
            <div className="border-l border-border pl-4 sm:pl-6">
              <div className="font-mono whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground">
                {entry.streamedAnswer}
                {entry.isStreaming && <Cursor />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4">
        <span className="text-gold text-base sm:text-lg shrink-0">$ ask&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isProcessing}
          placeholder="ask me anything..."
          className="flex-1 bg-transparent text-foreground text-base sm:text-lg outline-none border-none placeholder:text-muted"
          autoComplete="off"
          spellCheck={false}
        />
      </form>

      {history.length === 0 && (
        <p className="text-dim text-xs mt-2">
          Try: who are you, what do you build, contact, skills, projects, or just say hi
        </p>
      )}
    </div>
  );
}
