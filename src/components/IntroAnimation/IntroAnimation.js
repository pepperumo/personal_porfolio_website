import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

/* ——— Static noise canvas ——— */

const drawStatic = (canvas, opacity) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = v * 0.1;
    d[i + 1] = v * 0.9;
    d[i + 2] = v * 0.6;
    d[i + 3] = opacity * 255;
  }
  ctx.putImageData(imageData, 0, 0);
};

/* ——— Boot data ——— */

const now = new Date();
const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

const CONNECT_TARGETS = [
  'peppegpt.ai',
  'neural.engine',
  'knowledge.graph',
  'vector.store',
  'rag.pipeline',
];
const connectTarget = CONNECT_TARGETS[Math.floor(Math.random() * CONNECT_TARGETS.length)];

const ASCII_LOGO = [
  '  ██████╗ ██████╗ ',
  ' ██╔════╝ ██╔══██╗',
  ' ██║  ███╗██████╔╝',
  ' ██║   ██║██╔══██╗',
  ' ╚██████╔╝██║  ██║',
  '  ╚═════╝ ╚═╝  ╚═╝',
];

const BOOT_LINES = [
  { text: '> Welcome to Giuseppe Rumore\'s Portfolio', highlight: true },
  { text: '>' },
  { text: `> boot giuseppe.rumore — ${dateStr} ${timeStr}` },
  { text: '> load react · three.js · framer-motion' },
  { text: `> connect ${connectTarget}`, append: ' ........... ok' },
  { text: '> compile portfolio', progress: true },
  { text: '>' },
  { text: '> READY', highlight: true },
];

const CHAR_MS = 22;
const LINE_PAUSE = 120;

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('off');
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [overlayFade, setOverlayFade] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [showLogo, setShowLogo] = useState(false);
  const skipRef = useRef(false);
  const staticCanvasRef = useRef(null);
  const staticRafRef = useRef(null);

  const handleSkip = useCallback(() => {
    if (skipRef.current) return;
    skipRef.current = true;
    onComplete();
  }, [onComplete]);

  // Reduced motion bypass
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      skipRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  // Static noise during power-on
  useEffect(() => {
    if (phase !== 'powerOn') {
      if (staticRafRef.current) cancelAnimationFrame(staticRafRef.current);
      // Clear canvas on exit
      if (staticCanvasRef.current) {
        const ctx = staticCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, staticCanvasRef.current.width, staticCanvasRef.current.height);
      }
      return;
    }
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 1200, 1);
      const opacity = Math.max(0, 0.4 * (1 - progress));
      drawStatic(staticCanvasRef.current, opacity);
      if (progress < 1) {
        staticRafRef.current = requestAnimationFrame(animate);
      }
    };
    staticRafRef.current = requestAnimationFrame(animate);
    return () => {
      if (staticRafRef.current) cancelAnimationFrame(staticRafRef.current);
    };
  }, [phase]);

  // CRT power-on timeline
  useEffect(() => {
    if (skipRef.current) return;
    const timers = [
      setTimeout(() => {
        if (!skipRef.current) {
          setPhase('powerOn');
        }
      }, 200),
      setTimeout(() => {
        if (!skipRef.current) {
          setPhase('boot');
          setShowCursor(true);
        }
      }, 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Boot typing sequence
  useEffect(() => {
    if (phase !== 'boot' || skipRef.current) return;

    const timers = [];
    const schedule = (fn, ms) => {
      timers.push(setTimeout(fn, ms));
    };
    let li = 0, ci = 0;
    const done = [];

    const animateProgress = (cb) => {
      const total = 20;
      let step = 0;
      const tick = () => {
        if (skipRef.current) return;
        step++;
        const filled = Math.round((step / total) * 10);
        const empty = 10 - filled;
        const pct = Math.round((step / total) * 100);
        setProgressText(
          ` [${'█'.repeat(filled)}${'·'.repeat(empty)}] ${String(pct).padStart(3)}%`
        );
        if (step < total) {
          schedule(tick, 40 + Math.random() * 30);
        } else {
          setProgressText(' [██████████] done');
          schedule(cb, 200);
        }
      };
      tick();
    };

    const tick = () => {
      if (skipRef.current) return;

      if (li >= BOOT_LINES.length) {
        // Show ASCII logo before shutdown
        schedule(() => {
          if (skipRef.current) return;
          setShowLogo(true);
          schedule(() => {
            if (skipRef.current) return;
            setShowCursor(false);
            setShowLogo(false);
            setPhase('powerOff');
          }, 800);
        }, 400);
        return;
      }

      const line = BOOT_LINES[li];

      // Progress bar line
      if (line.progress) {
        const baseText = line.text;
        if (ci < baseText.length) {
          ci++;
          setTyping(baseText.substring(0, ci));

          schedule(tick, CHAR_MS);
        } else {
          // Animate progress bar
          animateProgress(() => {
            done.push({ ...line, text: baseText + ' [██████████] done' });
            setLines([...done]);
            setTyping('');
            setProgressText('');
            li++;
            ci = 0;
            schedule(tick, LINE_PAUSE);
          });
        }
        return;
      }

      // Append line (types text, then appends suffix instantly)
      const fullText = line.text + (line.append || '');
      if (ci < line.text.length) {
        ci++;
        setTyping(line.text.substring(0, ci));
        schedule(tick, line.text.length <= 2 ? 50 : CHAR_MS);
      } else if (line.append && ci < fullText.length) {
        // Type the append part slightly faster
        ci++;
        setTyping(fullText.substring(0, ci));
        schedule(tick, 12);
      } else {
        done.push({ ...line, text: fullText });
        setLines([...done]);
        setTyping('');
        li++;
        ci = 0;
        schedule(tick, LINE_PAUSE);
      }
    };

    tick();
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Power-off → complete
  useEffect(() => {
    if (phase !== 'powerOff' || skipRef.current) return;
    const timers = [
      setTimeout(() => !skipRef.current && setOverlayFade(true), 350),
      setTimeout(() => !skipRef.current && onComplete(), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  return (
    <Overlay $fade={overlayFade}>
      <Screen $phase={phase}>
        <StaticCanvas
          ref={staticCanvasRef}
          width={320}
          height={240}
          $visible={phase === 'powerOn'}
        />
        <Scanlines />
        <ScanBeam $active={phase === 'boot'} />
        <Glow />
        <Vignette />
        <Terminal $visible={phase === 'boot' || phase === 'powerOff'}>
          {lines.map((line, i) => (
            <TermLine key={i} $highlight={line.highlight}>
              {line.text}
            </TermLine>
          ))}
          {!showLogo && (
            <TermLine>
              {typing}
              {progressText}
              {showCursor && <Cursor />}
            </TermLine>
          )}
          {showLogo && (
            <LogoBlock>
              {ASCII_LOGO.map((row, i) => (
                <LogoLine key={i}>{row}</LogoLine>
              ))}
            </LogoBlock>
          )}
        </Terminal>
      </Screen>
      <SkipButton onClick={handleSkip}>Skip</SkipButton>
    </Overlay>
  );
};

/* ——— Keyframes ——— */

const crtOn = keyframes`
  0% {
    transform: scaleY(0.005);
    background: #00e8a2;
    box-shadow: 0 0 40px 10px rgba(0, 232, 162, 0.8);
  }
  30% {
    transform: scaleY(0.005);
    background: #00e8a2;
    box-shadow: 0 0 30px 5px rgba(0, 232, 162, 0.5);
  }
  70% {
    transform: scaleY(0.8);
    background: #050a14;
    box-shadow: none;
  }
  100% {
    transform: scaleY(1);
    background: #050a14;
    box-shadow: none;
  }
`;

const crtOff = keyframes`
  0% {
    transform: scaleY(1);
    background: #050a14;
    filter: brightness(1);
  }
  20% {
    transform: scaleY(1);
    filter: brightness(2);
  }
  55% {
    transform: scaleY(0.005);
    background: #00e8a2;
    filter: brightness(1.5);
    box-shadow: 0 0 30px 8px rgba(0, 232, 162, 0.6);
  }
  100% {
    transform: scaleY(0);
    opacity: 0;
    filter: brightness(0);
  }
`;

const cursorBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const flicker = keyframes`
  0% { opacity: 1; }
  3% { opacity: 0.97; }
  6% { opacity: 1; }
  9% { opacity: 0.985; }
  12% { opacity: 1; }
  100% { opacity: 1; }
`;

const jitter = keyframes`
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-1px); }
  20% { transform: translateX(0); }
  50% { transform: translateX(1px); }
  60% { transform: translateX(0); }
  80% { transform: translateX(-0.5px); }
`;

const scanDown = keyframes`
  0% { top: -2px; }
  100% { top: 100%; }
`;

const logoFadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  30% { opacity: 1; transform: scale(1); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1); }
`;

/* ——— Styled Components ——— */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease;
  ${({ $fade }) => $fade && 'opacity: 0;'}
`;

const Screen = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #050a14;
  transform-origin: center;
  overflow: hidden;

  ${({ $phase }) => $phase === 'off' && css`
    transform: scaleY(0);
    opacity: 0;
  `}
  ${({ $phase }) => $phase === 'powerOn' && css`
    animation: ${crtOn} 1.2s ease-out forwards;
  `}
  ${({ $phase }) => $phase === 'boot' && css`
    transform: scaleY(1);
    animation: ${flicker} 10s infinite, ${jitter} 4s ease-in-out infinite;
  `}
  ${({ $phase }) => $phase === 'powerOff' && css`
    animation: ${crtOff} 0.8s ease-in forwards;
  `}
`;

const StaticCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
  image-rendering: pixelated;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s;
`;

const Scanlines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.08) 1px,
    rgba(0, 0, 0, 0.08) 2px
  );
`;

const ScanBeam = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  pointer-events: none;
  z-index: 5;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 232, 162, 0.12),
    rgba(0, 232, 162, 0.06),
    transparent
  );
  box-shadow: 0 0 12px 4px rgba(0, 232, 162, 0.06);
  ${({ $active }) => $active ? css`
    animation: ${scanDown} 3s linear infinite;
  ` : css`
    display: none;
  `}
`;

const Glow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 232, 162, 0.03) 0%,
    transparent 70%
  );
`;

const Vignette = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.4);
`;

const Terminal = styled.div`
  position: relative;
  z-index: 3;
  padding: 18vh 8vw;
  font-family: var(--font-mono, 'Fira Code', monospace);
  font-size: clamp(13px, 1.4vw, 18px);
  line-height: 1.9;
  color: #00e8a2;
  text-shadow:
    0 0 8px rgba(0, 232, 162, 0.25),
    2px 0 2px rgba(255, 0, 0, 0.35),
    -2px 0 2px rgba(0, 60, 255, 0.35);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  @media (max-width: 480px) {
    padding: 25vh 6vw;
    font-size: 13px;
    line-height: 1.8;
  }
`;

const TermLine = styled.div`
  white-space: pre;
  min-height: 1em;
  ${({ $highlight }) => $highlight && css`
    color: #fff;
    text-shadow:
      0 0 12px rgba(0, 232, 162, 0.7),
      0 0 30px rgba(0, 232, 162, 0.3),
      3px 0 2px rgba(255, 0, 0, 0.45),
      -3px 0 2px rgba(0, 60, 255, 0.45);
    font-size: 1.15em;
    letter-spacing: 0.05em;
  `}
`;

const LogoBlock = styled.div`
  margin-top: 0.8em;
  animation: ${logoFadeIn} 0.8s ease-out forwards;
`;

const LogoLine = styled.div`
  white-space: pre;
  line-height: 1.15;
  font-size: clamp(10px, 1.1vw, 14px);
  color: #00e8a2;
  text-shadow:
    0 0 10px rgba(0, 232, 162, 0.5),
    0 0 25px rgba(0, 232, 162, 0.2),
    3px 0 2px rgba(255, 0, 0, 0.4),
    -3px 0 2px rgba(0, 60, 255, 0.4);

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 0.6em;
  height: 1.15em;
  background: #00e8a2;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${cursorBlink} 0.8s step-end infinite;
  box-shadow: 0 0 6px rgba(0, 232, 162, 0.4);
`;

const SkipButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 10001;
  padding: 8px 20px;
  border: 1px solid rgba(0, 232, 162, 0.4);
  border-radius: 4px;
  background: rgba(10, 10, 26, 0.6);
  color: var(--secondary-color, #00e8a2);
  font-family: var(--font-mono, 'Fira Code', monospace);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &::before, &::after {
    display: none;
  }

  &:hover {
    background: rgba(0, 232, 162, 0.15);
    border-color: rgba(0, 232, 162, 0.7);
  }

  @media (max-width: 480px) {
    bottom: 20px;
    right: 20px;
    padding: 6px 16px;
    font-size: 11px;
  }
`;

export default IntroAnimation;
