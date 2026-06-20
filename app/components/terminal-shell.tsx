'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import ChatQA from '@/app/components/chat-qa';
import projectsData from '@/data/projects.json';

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let lifecycleStarted = false;

// ─── Original Inline Components ─────────────────────────────────────

function TrafficLight() {
  return (
    <div className="flex items-center gap-[5px] mr-3">
      <span className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: '#ff5f57' }} />
      <span className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: '#febc2e' }} />
      <span className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: '#28c840' }} />
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function SkillTag({ label }: { label: string }) {
  return (
    <span className="block py-[3px] text-foreground">
      <span className="text-gold/60 mr-2 select-none">├──</span>{label}
    </span>
  );
}

// ─── Section Config ─────────────────────────────────────────────────

interface ToolAction { label: string; duration: number; }

const SECTION_CONFIGS = [
  {
    prompt: 'who is musadiq?',
    tools: [
      { label: 'Reading bio.md', duration: 250 },
      { label: 'Fetching profile data...', duration: 350 },
    ],
    streamText: `Name:        Syed Musadiq Ur Rahman
Role:        Agentic AI Developer
Location:    Islamabad, Pakistan
Bio:         building autonomous AI agents
             and intelligent automation systems`,
  },
  {
    prompt: 'tell me more about his background',
    tools: [
      { label: 'Loading experience records...', duration: 300 },
      { label: 'Parsing education history...', duration: 250 },
    ],
    streamText: `Musadiq is a final-year Computer Science student and a Certified
Agentic & Robotic AI Engineer candidate at PIAIC. He builds autonomous
AI agents using Python, CrewAI, OpenAI Agents SDK, LangChain, and n8n.`,
  },
  {
    prompt: 'cat skills.txt',
    tools: [
      { label: 'Indexing skills database...', duration: 200 },
      { label: 'Formatting output...', duration: 250 },
    ],
    streamText: `Python
Agentic AI / CrewAI
OpenAI Agents SDK
LangChain / LangGraph
n8n / Automation
LLMs & GenAI
Algorithmic Trading`,
  },
  {
    prompt: 'ls projects/',
    tools: [
      { label: 'Scanning repositories...', duration: 300 },
      { label: 'Fetching latest commits...', duration: 350 },
    ],
    streamText: `RCFD Bot — Automated trading bot for Deriv.
Market analysis, backtesting, strategy optimization,
risk management, and autonomous trade execution.

More agentic projects in progress...`,
  },
  {
    prompt: 'cat contact.txt',
    tools: [
      { label: 'Resolving contact endpoints...', duration: 200 },
    ],
    streamText: `github:   github.com/MusadiqUrRahman
linkedin: syed-musadiq-ur-rahman
email:    syedmusadiq.rahman@gmail.com`,
  },
];

const TYPING_SPEED = 35;
const STREAM_INTERVAL = 20;
const STREAM_CHUNK_MIN = 2;
const STREAM_CHUNK_MAX = 5;
const SECTION_GAP = 350;
const SCROLL_THROTTLE = 80;

// ─── ToolBlock Component ─────────────────────────────────────────────

function ToolBlock({
  tools,
  runningToolIdx,
  completedTools,
  expanded,
  onToggle,
  sectionDone,
}: {
  tools: ToolAction[];
  runningToolIdx: number;
  completedTools: boolean[];
  expanded: boolean;
  onToggle: () => void;
  sectionDone: boolean;
}) {
  const [spinner, setSpinner] = useState(0);
  const hasRunning = runningToolIdx >= 0;

  useEffect(() => {
    if (!hasRunning) return;
    const t = setInterval(() => setSpinner(s => (s + 1) % SPINNER.length), 80);
    return () => clearInterval(t);
  }, [hasRunning]);

  const doneCount = completedTools.filter(Boolean).length;
  const isComplete = doneCount === tools.length;

  return (
    <div className="border border-border rounded overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs bg-[var(--background)] hover:bg-[var(--surface)] transition-colors select-none group"
        aria-label={expanded ? 'Collapse tool uses' : 'Expand tool uses'}
      >
        <span className={isComplete ? 'text-success' : 'text-accent'}>●</span>
        <span className="text-dim group-hover:text-foreground transition-colors">
          {isComplete ? `${tools.length} tool uses` : `${doneCount} of ${tools.length} tool uses`}
        </span>
        {hasRunning && (
          <span className="text-accent ml-auto text-[11px]">{SPINNER[spinner]}</span>
        )}
        <span className={`ml-auto text-muted transition-transform text-[10px] ${hasRunning ? 'hidden' : ''}`}
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 pt-1 space-y-0.5 bg-[var(--background)] border-t border-border">
          {tools.map((tool, i) => {
            const isActive = hasRunning && i === runningToolIdx;
            const isDone = completedTools[i];
            return (
              <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                {isDone ? (
                  <span className="text-success shrink-0">✓</span>
                ) : isActive ? (
                  <span className="text-accent shrink-0 w-[10px] text-center">{SPINNER[spinner]}</span>
                ) : (
                  <span className="text-muted shrink-0 w-[10px] text-center">─</span>
                )}
                <span className={`${isDone ? 'text-dim' : isActive ? 'text-foreground' : 'text-muted'} ${isActive ? 'tool-shimmer' : ''} transition-colors rounded px-1`}>
                  {tool.label}
                </span>
                {isActive && <span className="text-muted text-[10px] ml-1">running...</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TerminalShell ───────────────────────────────────────────────────

// ─── Ambient Background Particles ───────────────────────────────────

function AmbientParticles() {
  const particles = [
    { left: 15, size: 2, dur: 35, delay: 0 },
    { left: 30, size: 3, dur: 28, delay: 4 },
    { left: 50, size: 2, dur: 40, delay: 8 },
    { left: 68, size: 3, dur: 32, delay: 2 },
    { left: 82, size: 2, dur: 38, delay: 6 },
    { left: 92, size: 2, dur: 30, delay: 10 },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-accent animate-particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.1,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function TerminalShell() {
  const reducedMotion = useReducedMotion();

  // ── Animation State ────────────────────────────────────────────────
  const [phase, setPhase] = useState<'init' | 'playing' | 'done'>('init');
  const [typingTexts, setTypingTexts] = useState<string[]>(SECTION_CONFIGS.map(() => ''));
  const [streamTexts, setStreamTexts] = useState<string[]>(SECTION_CONFIGS.map(() => ''));
  const [sectionPhase, setSectionPhase] = useState<
    Array<'hidden' | 'typing' | 'tools' | 'streaming' | 'done'>
  >(SECTION_CONFIGS.map(() => 'hidden'));
  const [toolResults, setToolResults] = useState<boolean[][]>(
    SECTION_CONFIGS.map(s => s.tools.map(() => false))
  );
  const [runningToolIdx, setRunningToolIdx] = useState(-1);
  const [toolExpanded, setToolExpanded] = useState<boolean[]>(SECTION_CONFIGS.map(() => true));

  // Refs for animation control
  const cancelled = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);

  // Module-level flag to detect Strict Mode double-mount

  // ── Initialize ────────────────────────────────────────────────────
  useEffect(() => {
    cancelled.current = false;

    if (reducedMotion) {
      setSectionPhase(SECTION_CONFIGS.map(() => 'done'));
      setPhase('done');
      SECTION_CONFIGS.forEach((_, i) => {
        setTypingTexts(p => { const n = [...p]; n[i] = SECTION_CONFIGS[i].prompt; return n; });
        setStreamTexts(p => { const n = [...p]; n[i] = SECTION_CONFIGS[i].streamText; return n; });
      });
      sessionStorage.setItem('portfolio-anim-played', '1');
      return;
    }

    const played = sessionStorage.getItem('portfolio-anim-played');
    if (played) {
      setSectionPhase(SECTION_CONFIGS.map(() => 'done'));
      setPhase('done');
      SECTION_CONFIGS.forEach((_, i) => {
        setTypingTexts(p => { const n = [...p]; n[i] = SECTION_CONFIGS[i].prompt; return n; });
        setStreamTexts(p => { const n = [...p]; n[i] = SECTION_CONFIGS[i].streamText; return n; });
      });
      return;
    }

    if (lifecycleStarted) {
      setSectionPhase(SECTION_CONFIGS.map(() => 'hidden'));
      setPhase('init');
      setTypingTexts(SECTION_CONFIGS.map(() => ''));
      setStreamTexts(SECTION_CONFIGS.map(() => ''));
      setToolResults(SECTION_CONFIGS.map(s => s.tools.map(() => false)));
    }

    lifecycleStarted = true;
    animateNext(0);
    return () => { cancelled.current = true; };
  }, [reducedMotion]);

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    const now = Date.now();
    if (now - lastScroll.current < SCROLL_THROTTLE) return;
    lastScroll.current = now;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sectionPhase, typingTexts, streamTexts, phase]);

  // ── Animation Engine ─────────────────────────────────────────────
  function animateNext(idx: number) {
    if (cancelled.current) return;
    if (idx >= SECTION_CONFIGS.length) {
      setPhase('done');
      sessionStorage.setItem('portfolio-anim-played', '1');
      return;
    }

    const config = SECTION_CONFIGS[idx];

    // Phase 1: Typing
    setSectionPhase(p => { const n = [...p]; n[idx] = 'typing'; return n; });
    setRunningToolIdx(-1);
    typePrompt(idx, config.prompt, () => {
      if (cancelled.current) return;

      // Phase 2: Tools
      setSectionPhase(p => { const n = [...p]; n[idx] = 'tools'; return n; });
      setToolExpanded(p => { const n = [...p]; n[idx] = true; return n; });
      runToolsSequentially(idx, config.tools, 0, () => {
        if (cancelled.current) return;

        // Auto-collapse tools after done
        setTimeout(() => {
          if (cancelled.current) return;
          setToolExpanded(p => { const n = [...p]; n[idx] = false; return n; });
        }, 1000);

        // Phase 3: Streaming
        setSectionPhase(p => { const n = [...p]; n[idx] = 'streaming'; return n; });
        streamBody(idx, config.streamText, () => {
          if (cancelled.current) return;

          // Phase 4: Done
          setSectionPhase(p => { const n = [...p]; n[idx] = 'done'; return n; });

          // Next section
          setTimeout(() => {
            if (cancelled.current) return;
            animateNext(idx + 1);
          }, SECTION_GAP);
        });
      });
    });
  }

  function typePrompt(idx: number, text: string, onDone: () => void) {
    let pos = 0;
    const t = setInterval(() => {
      if (cancelled.current) { clearInterval(t); return; }
      pos++;
      const displayed = text.slice(0, pos);
      setTypingTexts(p => { const n = [...p]; n[idx] = displayed; return n; });
      if (pos >= text.length) {
        clearInterval(t);
        onDone();
      }
    }, TYPING_SPEED);
  }

  function runToolsSequentially(
    idx: number,
    tools: ToolAction[],
    toolIdx: number,
    onDone: () => void
  ) {
    if (cancelled.current) return;
    if (toolIdx >= tools.length) {
      setRunningToolIdx(-1);
      onDone();
      return;
    }

    setRunningToolIdx(toolIdx);

    setTimeout(() => {
      if (cancelled.current) return;
      setToolResults(p => {
        const n = p.map(s => [...s]);
        n[idx][toolIdx] = true;
        return n;
      });
      setRunningToolIdx(-1);

      // Next tool after brief gap
      setTimeout(() => {
        if (cancelled.current) return;
        runToolsSequentially(idx, tools, toolIdx + 1, onDone);
      }, 80);
    }, tools[toolIdx].duration);
  }

  function streamBody(idx: number, text: string, onDone: () => void) {
    let pos = 0;
    const t = setInterval(() => {
      if (cancelled.current) { clearInterval(t); return; }
      const chunk = STREAM_CHUNK_MIN + Math.floor(Math.random() * (STREAM_CHUNK_MAX - STREAM_CHUNK_MIN + 1));
      pos = Math.min(pos + chunk, text.length);
      const displayed = text.slice(0, pos);
      setStreamTexts(p => { const n = [...p]; n[idx] = displayed; return n; });
      if (pos >= text.length) {
        clearInterval(t);
        onDone();
      }
    }, STREAM_INTERVAL);
  }

  // ── Render Helpers ───────────────────────────────────────────────
  function renderBody(idx: number) {
    const sp = sectionPhase[idx];
    if (sp === 'hidden') return null;
    const { streamText } = SECTION_CONFIGS[idx];

    switch (idx) {
      case 0: return renderHeroBody(sp, streamTexts[0], streamText);
      case 1: return renderAboutBody(sp, streamTexts[1]);
      case 2: return renderSkillsBody(sp, streamTexts[2]);
      case 3: return renderProjectsBody(sp, streamTexts[3]);
      case 4: return renderContactBody(sp, streamTexts[4]);
      default: return null;
    }
  }

  function cursorSpan() {
    return <span className="inline-block w-[10px] h-[18px] bg-accent align-text-bottom animate-blink cursor-glow rounded-sm" />;
  }

  // ── Individual Section Renderers ─────────────────────────────────

  function renderHeroBody(phase: string, streamed: string, fullText: string) {
    if (phase === 'streaming') {
      return (
        <div className="font-mono whitespace-pre-wrap text-sm sm:text-base text-foreground">
          {streamed}{cursorSpan()}
        </div>
      );
    }
    if (phase !== 'done') return null;

    return (
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-[180px] h-[180px] sm:w-[208px] sm:h-[208px] rounded-full overflow-hidden border-2 border-gold/70 animate-ring-pulse-gold">
              <Image
                src="/musadiq.png"
                alt="Musadiq Rahman"
                width={320}
                height={320}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center", transform: "scale(1.2)" }}
                priority
              />
            </div>
            <span className="text-muted text-[11px] mt-2 select-none">musadiq.png</span>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-[1.6rem] sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
              Syed Musadiq Ur Rahman
            </h1>
            <p className="text-gold text-xl sm:text-2xl mt-2 font-medium tracking-wide">
              Agentic AI Developer
            </p>
            <p className="text-sm sm:text-base text-foreground mt-3 max-w-md leading-relaxed">
              building <span className="text-accent">autonomous AI agents</span> and{' '}
              <span className="text-accent">intelligent automation systems</span>
            </p>
            <p className="text-dim text-xs sm:text-sm mt-2">// Islamabad, Pakistan</p>
            <div className="flex items-center gap-3 sm:gap-4 mt-4">
              <a href="https://github.com/MusadiqUrRahman" target="_blank" rel="noopener noreferrer" className="text-dim hover:text-accent transition-colors" aria-label="GitHub"><GitHubIcon /></a>
              <a href="https://www.linkedin.com/in/syed-musadiq-ur-rahman-548a6b307/" target="_blank" rel="noopener noreferrer" className="text-dim hover:text-accent transition-colors" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="mailto:syedmusadiq.rahman@gmail.com" className="text-dim hover:text-accent transition-colors" aria-label="Email"><MailIcon /></a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAboutBody(phase: string, streamed: string) {
    const fullText = `Musadiq is a final-year Computer Science student and a Certified
Agentic & Robotic AI Engineer candidate at PIAIC. He builds autonomous
AI agents using Python, CrewAI, OpenAI Agents SDK, LangChain, and n8n.`;

    if (phase === 'streaming') {
      return (
        <p className="font-mono whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground">
          {streamed}{cursorSpan()}
        </p>
      );
    }
    if (phase !== 'done') return null;

    return (
      <p className="text-sm sm:text-lg leading-relaxed sm:leading-[1.75] max-w-3xl text-foreground animate-fade-in">
        Musadiq is a final-year Computer Science student and a{' '}
        <span className="text-accent">Certified Agentic & Robotic AI Engineer (CAE)</span>{' '}
        candidate at PIAIC. He builds autonomous AI agents and automation systems using{' '}
        <span className="text-accent">Python</span>,{' '}
        <span className="text-accent">CrewAI</span>,{' '}
        <span className="text-accent">OpenAI Agents SDK</span>,{' '}
        <span className="text-accent">LangChain</span>, and{' '}
        <span className="text-accent">n8n</span>. He is deeply interested in algorithmic
        trading, LLM-powered tools, and practical digital products that solve real problems.
      </p>
    );
  }

  function renderSkillsBody(phase: string, streamed: string) {
    if (phase === 'streaming') {
      return (
        <div className="font-mono whitespace-pre-wrap text-sm sm:text-base text-foreground">
          {streamed}{cursorSpan()}
        </div>
      );
    }
    if (phase !== 'done') return null;

    return (
      <div className="space-y-0 font-mono animate-fade-in">
        <SkillTag label="Python" />
        <SkillTag label="Agentic AI / CrewAI" />
        <SkillTag label="OpenAI Agents SDK" />
        <SkillTag label="LangChain / LangGraph" />
        <SkillTag label="n8n / Automation" />
        <SkillTag label="LLMs & GenAI" />
        <SkillTag label="Algorithmic Trading" />
      </div>
    );
  }

  function ProjectCard({ project }: { project: typeof projectsData[0] }) {
    const statusColor = project.status === 'Live' ? 'text-success' : project.status === 'In Development' ? 'text-gold' : 'text-dim';
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gold/60 select-none">├──</span>
            <span className="text-highlight font-semibold">{project.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor} bg-transparent border border-current`}>
              {project.status}
            </span>
          </div>
        </div>
        <p className="text-foreground text-sm sm:text-base leading-relaxed pl-8">
          {project.tagline}
        </p>
        <p className="text-dim text-sm leading-relaxed pl-8 max-w-2xl">
          {project.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pl-8">
          {project.techStack.map((tech, i) => (
            <span key={i} className="text-xs px-2 py-0.5 text-muted bg-border/50 rounded">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-8 pt-1">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border text-accent border-accent/40 hover:bg-accent hover:text-background transition-colors"
            >
              Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border text-dim border-border hover:text-gold hover:border-gold transition-colors"
            >
              Source Code
            </a>
          )}
        </div>
      </div>
    );
  }

  function renderProjectsBody(phase: string, streamed: string) {
    if (phase === 'streaming') {
      return (
        <div className="font-mono whitespace-pre-wrap text-sm sm:text-base text-foreground">
          {streamed}{cursorSpan()}
        </div>
      );
    }
    if (phase !== 'done') return null;

    return (
      <div className="space-y-6 animate-fade-in">
        {projectsData.map((project, i) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  function renderContactBody(phase: string, streamed: string) {
    if (phase === 'streaming') {
      return (
        <div className="font-mono whitespace-pre-wrap text-sm sm:text-base text-foreground">
          {streamed}{cursorSpan()}
        </div>
      );
    }
    if (phase !== 'done') return null;

    return (
      <div className="space-y-2 font-mono text-sm sm:text-base animate-fade-in">
        <div className="flex gap-3">
          <span className="text-dim shrink-0 w-16">github</span>
          <a href="https://github.com/MusadiqUrRahman" target="_blank" rel="noopener noreferrer" className="text-highlight hover:underline underline-offset-2">
            github.com/MusadiqUrRahman
          </a>
        </div>
        <div className="flex gap-3">
          <span className="text-dim shrink-0 w-16">linkedin</span>
          <a href="https://www.linkedin.com/in/syed-musadiq-ur-rahman-548a6b307/" target="_blank" rel="noopener noreferrer" className="text-highlight hover:underline underline-offset-2">
            syed-musadiq-ur-rahman
          </a>
        </div>
        <div className="flex gap-3">
          <span className="text-dim shrink-0 w-16">email</span>
          <a href="mailto:syedmusadiq.rahman@gmail.com" className="text-highlight hover:underline underline-offset-2">
            syedmusadiq.rahman@gmail.com
          </a>
        </div>
      </div>
    );
  }

  // ── Should Show Check ─────────────────────────────────────────────
  function shouldShowSection(idx: number): boolean {
    if (phase === 'done' || reducedMotion) return true;
    return sectionPhase[idx] !== 'hidden';
  }



  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-start justify-center p-3 sm:p-4 relative">
      <AmbientParticles />
      <div className="terminal-glow relative w-full max-w-4xl rounded-xl">
        <div className="terminal-glass relative rounded-xl overflow-hidden border border-border/50">
        {/* Terminal Chrome Bar */}
        <div className="flex items-center justify-between px-4 py-[10px] border-b border-border">
          <div className="flex items-center gap-2">
            <TrafficLight />
            <span className="text-dim text-xs sm:text-sm tracking-wide select-none">
              musadiq@terminal — 0:45
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => { sessionStorage.removeItem('portfolio-anim-played'); location.reload(); }} className="hidden sm:inline-block text-xs px-3 py-[3px] rounded-full border text-gold border-gold/40 select-none cursor-pointer hover:bg-gold hover:text-background transition-colors">
              new session
            </button>
            <span className="text-xs px-2 py-[3px] rounded border text-dim border-border select-none">
              Ctrl+K
            </span>
            <span className="text-xs text-dim select-none flex items-center gap-1">
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-success animate-pulse-dot" />
              online
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 sm:px-6 py-5 sm:py-8 space-y-8 sm:space-y-10">
          {SECTION_CONFIGS.map((config, idx) => {
            if (!shouldShowSection(idx)) return null;

            const sp = sectionPhase[idx];
            const isTyping = sp === 'typing';
            const isTools = sp === 'tools';
            const isStreaming = sp === 'streaming';
            const isDone = sp === 'done';
            const isActive = isTyping || isTools || isStreaming;

            return (
              <section key={idx}>
                {/* Prompt line */}
                <p className="text-base sm:text-lg mb-3">
                  <span className="text-accent">&gt; </span>
                  {isDone || (isActive && typingTexts[idx]) ? (
                    <span className="text-accent">
                      {typingTexts[idx]}
                      {isTyping && cursorSpan()}
                    </span>
                  ) : null}
                </p>

                {/* Body wrapper */}
                <div className="border-l border-border pl-4 sm:pl-6 section-accent">
                  {/* Tool-use block (shown during tools + streaming + done) */}
                  {(isTools || isStreaming || isDone) && (
                    <ToolBlock
                      tools={config.tools}
                      runningToolIdx={isTools ? runningToolIdx : -1}
                      completedTools={toolResults[idx]}
                      expanded={toolExpanded[idx]}
                      onToggle={() => setToolExpanded(p => { const n = [...p]; n[idx] = !n[idx]; return n; })}
                      sectionDone={isDone}
                    />
                  )}

                  {/* Body content */}
                  {renderBody(idx)}
                </div>
                {idx < SECTION_CONFIGS.length - 1 && isDone && (
                  <div className="section-divider mt-8 sm:mt-10" />
                )}
              </section>
            );
          })}

          {/* Chat input — replaces trailing cursor */}
          {sectionPhase.every(p => p === 'done') && <ChatQA />}

          <div ref={bottomRef} />
        </div>
        </div>
      </div>
    </div>
  );
}
