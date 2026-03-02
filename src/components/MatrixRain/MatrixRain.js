import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// ── Tunable constants ──
const FONT_SIZE = 15;
const LINE_HEIGHT = 24;
const COLUMN_WIDTH = 400;
const LINES_PER_COL = 8;
const MIN_SPEED = 0.25;
const MAX_SPEED = 0.6;
const TYPING_SPEED_MIN = 0.02;
const TYPING_SPEED_MAX = 0.25;
const FADE_OUT_SPEED = 0.004;  // alpha decrease per frame once fully typed
const HOLD_FRAMES_MIN = 60;   // frames to hold fully-typed before fading
const HOLD_FRAMES_MAX = 180;
const BEND_RADIUS = 250;
const BEND_STRENGTH = 0.6;
const BEND_DECAY = 0.93;

// ── Scroll speed burst ──
const SCROLL_BOOST_MULTIPLIER = 3.0;
const SCROLL_BOOST_DECAY = 0.94;

// ── Scroll color shift: green → teal → blue ──
const COLOR_STOPS = [
  { at: 0.0, r: 40, g: 180, b: 100, head: '#40c080' },
  { at: 0.5, r: 40, g: 160, b: 150, head: '#40b0a0' },
  { at: 1.0, r: 50, g: 130, b: 200, head: '#4080c0' },
];

// ── Click ripple ──
const RIPPLE_EXPAND_SPEED = 6;
const RIPPLE_RING_WIDTH = 120;
const RIPPLE_PUSH_STRENGTH = 20;
const RIPPLE_BRIGHTNESS = 0.8;
const RIPPLE_MAX_AGE = 200;

// ── CRT Effects ──
const CHROMATIC_OFFSET = 3;       // px offset for red/blue channels
const CHROMATIC_ALPHA = 0.35;     // opacity for chromatic aberration copies
const SCANLINE_SPACING = 3;       // px between scanlines
const SCAN_BEAM_SPEED = 0.5;      // px/frame for scan beam sweep
const SCAN_BEAM_HEIGHT = 2;       // px height of scan beam
const SCAN_BEAM_ALPHA = 0.08;     // glow intensity of scan beam
const VIGNETTE_EDGE_ALPHA = 0.3;  // darkness at screen edges
const FLICKER_CHANCE = 0.03;      // ~3% chance per frame
const FLICKER_ALPHA = 0.08;       // how much to darken on flicker
const PHOSPHOR_ALPHA = 0.015;     // center phosphor glow intensity
const GLITCH_CHANCE = 0.02;       // ~2% chance per frame
const GLITCH_MIN_H = 4;           // min glitch strip height
const GLITCH_MAX_H = 12;          // max glitch strip height
const GLITCH_MIN_OFFSET = 6;      // min X offset for glitch
const GLITCH_MAX_OFFSET = 16;     // max X offset for glitch

// ── Code snippets pool (Python + TypeScript) ──
const CODE_SNIPPETS = [
  // Python
  'async def fetch_data(url: str, timeout: int = 30) -> dict:',
  '    response = await httpx.get(url, timeout=timeout)',
  '    return response.json()',
  'class AgentPipeline(BaseModel):',
  '    model: str = "claude-opus-4-6"',
  '    temperature: float = 0.7',
  '    max_tokens: int = 4096',
  '    def invoke(self, prompt: str) -> str:',
  '        return self.client.complete(prompt)',
  '@app.post("/api/chat/stream")',
  'async def stream_chat(request: ChatRequest):',
  '    async for chunk in agent.stream(request.query):',
  '        yield {"text": chunk.content}',
  'embeddings = model.encode(documents, batch_size=32)',
  'results = vector_store.similarity_search(query, k=5)',
  'def build_rag_chain(retriever, llm):',
  '    return retriever | prompt | llm | output_parser',
  'pipeline = Pipeline(steps=[clean, embed, index])',
  'credentials = ServiceAccountCredentials.from_json(key)',
  'df = pd.DataFrame(records).dropna(subset=["score"])',
  'logger.info(f"Processing {len(items)} documents")',
  'cache = Redis(host="localhost", port=6379, db=0)',
  'tokens = tokenizer.encode(text, max_length=512)',
  'scheduler.add_job(sync_data, "cron", hour=2)',
  'with Session(engine) as session:',
  '    session.add_all(batch)',
  '    session.commit()',
  '@retry(stop=stop_after_attempt(3), wait=wait_exponential())',
  'async def process_webhook(payload: WebhookEvent):',
  '    await queue.enqueue(payload.model_dump())',
  'torch.nn.functional.softmax(logits, dim=-1)',
  'loss = criterion(predictions, targets)',
  'optimizer.zero_grad(); loss.backward(); optimizer.step()',
  'chunks = text_splitter.split_documents(raw_docs)',
  'vector_db = FAISS.from_documents(chunks, embeddings)',
  'app.state.limiter = RateLimiter(max_calls=10, period=60)',
  'config = yaml.safe_load(Path("config.yml").read_text())',
  'graph = StateGraph(AgentState)',
  'graph.add_node("retrieve", retrieval_node)',
  'graph.add_edge("retrieve", "generate")',

  // TypeScript
  'export const handler: APIGatewayProxyHandler = async (event) => {',
  '  const body = JSON.parse(event.body ?? "{}");',
  '  return { statusCode: 200, body: JSON.stringify(result) };',
  'interface ChatMessage { role: "user" | "assistant"; content: string; }',
  'type StreamChunk = { text: string; complete?: boolean };',
  'const useDebounce = <T>(value: T, delay: number): T => {',
  '  const [debounced, setDebounced] = useState<T>(value);',
  '  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay);',
  '    return () => clearTimeout(t); }, [value, delay]);',
  '  return debounced; };',
  'export async function* streamResponse(query: string) {',
  '  const reader = response.body?.getReader();',
  '  while (true) { const { done, value } = await reader.read();',
  '    if (done) break; yield decoder.decode(value); }',
  'const router = createBrowserRouter([',
  '  { path: "/", element: <Layout />, children: routes },',
  ']);',
  'app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));',
  'const schema = z.object({ query: z.string().min(1), history: z.array(messageSchema) });',
  'export const trpc = createTRPCReact<AppRouter>();',
  'const mutation = useMutation({ mutationFn: createProject,',
  '  onSuccess: () => queryClient.invalidateQueries(["projects"]) });',
  'const ws = new WebSocket(`wss://{host}/ws`);',
  'ws.onmessage = (e) => dispatch({ type: "MESSAGE", payload: JSON.parse(e.data) });',
  'prisma.user.findMany({ where: { active: true }, include: { posts: true } });',
  'const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });',
  'middleware.ts: export function middleware(request: NextRequest) {',
  '  if (!session) return NextResponse.redirect(new URL("/login", request.url));',
  'const embed = new OpenAIEmbeddings({ modelName: "text-embedding-3-small" });',
  'const chain = RunnableSequence.from([retriever, promptTemplate, model, parser]);',
  'io.on("connection", (socket: Socket) => { socket.join(socket.handshake.query.room); });',
  'const cache = new Map<string, { data: unknown; expires: number }>();',
  'export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };',
  'const pipeline = stream.pipe(transform).pipe(sink);',
  'Deno.serve({ port: 8000 }, async (req) => new Response(body, { status: 200 }));',
  'const worker = new Worker(new URL("./worker.ts", import.meta.url));',
];

const randomSnippet = () => CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];

const MatrixRain = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── Mouse state ──
    let mouseX = -9999;
    let mouseY = -9999;
    let prevMouseX = -9999;
    let mouseVelX = 0;

    const onMouseMove = (e) => {
      if (prevMouseX > -9000) {
        mouseVelX = e.clientX - prevMouseX;
      }
      prevMouseX = e.clientX;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      prevMouseX = -9999;
      mouseVelX = 0;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    // ── Scroll state ──
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      scrollBoost = Math.min(delta / 10, SCROLL_BOOST_MULTIPLIER);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Click ripple state ──
    let ripples = [];

    const onClick = (e) => {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, age: 0 });
    };
    window.addEventListener('click', onClick);

    // ── Color interpolation helper ──
    function getScrollColor() {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1, window.scrollY / maxScroll);

      let a = COLOR_STOPS[0], b = COLOR_STOPS[COLOR_STOPS.length - 1];
      for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (progress >= COLOR_STOPS[i].at && progress <= COLOR_STOPS[i + 1].at) {
          a = COLOR_STOPS[i];
          b = COLOR_STOPS[i + 1];
          break;
        }
      }
      const t = (progress - a.at) / (b.at - a.at || 1);
      return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
        head: t < 0.5 ? a.head : b.head,
      };
    }

    // ── Row state (grid-based) ──
    let rows = [];

    function buildRows() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      rows = [];

      const numCols = Math.ceil(w / COLUMN_WIDTH);
      const totalRows = numCols * LINES_PER_COL;

      for (let i = 0; i < totalRows; i++) {
        const text = randomSnippet();
        rows.push({
          text,
          x: Math.random() * (w + 200) - 100,
          y: Math.random() * h,
          speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
          baseAlpha: 0.5 + Math.random() * 0.3,
          fadeAlpha: 1,
          fading: false,
          holdTimer: 0,
          bend: 0,
          col: 0,
          visibleChars: 0,
          typingSpeed: TYPING_SPEED_MIN + Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN),
          typingDelay: Math.random() * 200,
        });
      }
    }

    // ── CRT cached offscreen canvases ──
    let scanlineCanvas = null;
    let vignetteCanvas = null;
    let scanBeamY = 0;

    function buildScanlineCache(w, h) {
      scanlineCanvas = document.createElement('canvas');
      scanlineCanvas.width = w;
      scanlineCanvas.height = h;
      const sCtx = scanlineCanvas.getContext('2d');
      sCtx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let y = 0; y < h; y += SCANLINE_SPACING) {
        sCtx.fillRect(0, y, w, 1);
      }
    }

    function buildVignetteCache(w, h) {
      vignetteCanvas = document.createElement('canvas');
      vignetteCanvas.width = w;
      vignetteCanvas.height = h;
      const vCtx = vignetteCanvas.getContext('2d');
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.sqrt(cx * cx + cy * cy);
      const grad = vCtx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${VIGNETTE_EDGE_ALPHA})`);
      vCtx.fillStyle = grad;
      vCtx.fillRect(0, 0, w, h);
    }

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;
      buildScanlineCache(w, h);
      buildVignetteCache(w, h);

      buildRows();
    }

    resize();
    window.addEventListener('resize', resize);

    // ── Re-init canvas when returning from background (mobile GPU context loss) ──
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resize();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── Animation ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      mouseVelX *= 0.9;
      scrollBoost *= SCROLL_BOOST_DECAY;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // ── Update ripples ──
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].radius += RIPPLE_EXPAND_SPEED;
        ripples[i].age++;
        if (ripples[i].age > RIPPLE_MAX_AGE) {
          ripples.splice(i, 1);
        }
      }

      // ── Scroll-based color ──
      const clr = getScrollColor();

      // ── Clear canvas fully — no trail/ghosting ──
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(10, 10, 10, 1)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${FONT_SIZE}px 'Fira Code', monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // ── Typewriter: type → hold → fade out → new line ──
        if (row.typingDelay > 0) {
          row.typingDelay--;
        } else if (row.fading) {
          // Fading out
          row.fadeAlpha -= FADE_OUT_SPEED;
          if (row.fadeAlpha <= 0) {
            // Gone — spawn new snippet, start typing fresh
            row.text = randomSnippet();
            row.visibleChars = 0;
            row.fadeAlpha = 1;
            row.fading = false;
            row.holdTimer = 0;
            row.typingSpeed = TYPING_SPEED_MIN + Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN);
            row.typingDelay = Math.random() * 30;
          }
        } else if (row.visibleChars < row.text.length) {
          // Still typing
          row.visibleChars = Math.min(
            row.text.length,
            row.visibleChars + row.typingSpeed
          );
        } else {
          // Fully typed — hold then start fading
          row.holdTimer++;
          if (row.holdTimer > HOLD_FRAMES_MIN + Math.random() * (HOLD_FRAMES_MAX - HOLD_FRAMES_MIN)) {
            row.fading = true;
          }
        }

        // ── Wind-bend from mouse horizontal velocity ──
        const rowCenterY = row.y;
        const distY = Math.abs(rowCenterY - mouseY);
        if (distY < BEND_RADIUS) {
          const textWidth = row.text.length * FONT_SIZE * 0.6;
          const rowCenterX = row.x + textWidth / 2;
          const distX = Math.abs(rowCenterX - mouseX);
          if (distX < BEND_RADIUS + textWidth / 2) {
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < BEND_RADIUS) {
              const proximity = Math.pow(1 - dist / BEND_RADIUS, 2);
              row.bend += mouseVelX * proximity * BEND_STRENGTH;
            }
          }
        }

        // ── Ripple push ──
        for (let ri = 0; ri < ripples.length; ri++) {
          const rip = ripples[ri];
          const rdx = (row.x + 100) - rip.x;
          const rdy = row.y - rip.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const ringDist = Math.abs(rDist - rip.radius);
          if (ringDist < RIPPLE_RING_WIDTH && rDist > 1) {
            const fade = 1 - rip.age / RIPPLE_MAX_AGE;
            const proximity = (1 - ringDist / RIPPLE_RING_WIDTH) * fade;
            row.bend += (rdx / rDist) * proximity * RIPPLE_PUSH_STRENGTH;
          }
        }

        // Decay bend
        row.bend *= BEND_DECAY;
        if (row.bend > 80) row.bend = 80;
        if (row.bend < -80) row.bend = -80;

        const drawX = row.x + row.bend;
        const drawY = row.y;

        // ── Ripple brightness boost ──
        let rippleBrightness = 0;
        for (let ri = 0; ri < ripples.length; ri++) {
          const rip = ripples[ri];
          const rdx = drawX - rip.x;
          const rdy = drawY - rip.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const ringDist = Math.abs(rDist - rip.radius);
          if (ringDist < RIPPLE_RING_WIDTH) {
            const fade = 1 - rip.age / RIPPLE_MAX_AGE;
            const bright = (1 - ringDist / RIPPLE_RING_WIDTH) * fade * RIPPLE_BRIGHTNESS;
            rippleBrightness = Math.max(rippleBrightness, bright);
          }
        }

        // Glow when bending or ripple
        const bendAbs = Math.abs(row.bend);
        const isBending = bendAbs > 3;

        let alpha = row.baseAlpha * row.fadeAlpha;
        let r = clr.r, g = clr.g, b = clr.b;

        if (rippleBrightness > 0.05) {
          alpha = Math.min(alpha + rippleBrightness * 0.6, 0.9);
          g = Math.min(255, g + Math.round(100 * rippleBrightness));
          r = Math.min(255, r + Math.round(40 * rippleBrightness));
        } else if (isBending) {
          alpha = Math.min(alpha * 1.5, 0.6);
          g = Math.min(255, g + 25);
        }

        // ── Draw only visible characters (typewriter) with chromatic aberration ──
        const displayText = row.text.substring(0, Math.floor(row.visibleChars));
        if (displayText.length > 0) {
          // Main text
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillText(displayText, drawX, drawY);

          // Chromatic aberration: red channel offset right, blue offset left
          const chromaAlpha = Math.max(CHROMATIC_ALPHA * alpha, 0.12);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(255, 40, 40, ${chromaAlpha})`;
          ctx.fillText(displayText, drawX + CHROMATIC_OFFSET, drawY);
          ctx.fillStyle = `rgba(40, 40, 255, ${chromaAlpha})`;
          ctx.fillText(displayText, drawX - CHROMATIC_OFFSET, drawY);
          ctx.restore();
        }

        // ── Advance (fall) with scroll boost ──
        row.y += row.speed * (1 + scrollBoost);

        // Reset when past bottom
        if (row.y > h + LINE_HEIGHT) {
          row.text = randomSnippet();
          row.y = -(LINE_HEIGHT + Math.random() * 40);
          row.x = Math.random() * (w + 200) - 100;
          row.speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
          row.baseAlpha = 0.5 + Math.random() * 0.3;
          row.fadeAlpha = 1;
          row.fading = false;
          row.holdTimer = 0;
          row.bend = 0;
          row.visibleChars = 0;
          row.typingSpeed = TYPING_SPEED_MIN + Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN);
          row.typingDelay = Math.random() * 60;
        }
      }

      // ── CRT Post-processing effects ──

      // 3. Phosphor glow (subtle center brightness)
      const pgCx = w / 2;
      const pgCy = h / 2;
      const pgRadius = Math.max(w, h) * 0.7;
      const phosphorGrad = ctx.createRadialGradient(pgCx, pgCy, 0, pgCx, pgCy, pgRadius);
      phosphorGrad.addColorStop(0, `rgba(0, 232, 162, ${PHOSPHOR_ALPHA})`);
      phosphorGrad.addColorStop(1, 'rgba(0, 232, 162, 0)');
      ctx.fillStyle = phosphorGrad;
      ctx.fillRect(0, 0, w, h);

      // 4. Scan beam (sweeping horizontal line)
      scanBeamY += SCAN_BEAM_SPEED;
      if (scanBeamY > h) scanBeamY = 0;
      const beamGrad = ctx.createLinearGradient(0, scanBeamY - 10, 0, scanBeamY + SCAN_BEAM_HEIGHT + 10);
      beamGrad.addColorStop(0, 'rgba(0, 232, 162, 0)');
      beamGrad.addColorStop(0.4, `rgba(0, 232, 162, ${SCAN_BEAM_ALPHA})`);
      beamGrad.addColorStop(0.6, `rgba(0, 232, 162, ${SCAN_BEAM_ALPHA})`);
      beamGrad.addColorStop(1, 'rgba(0, 232, 162, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanBeamY - 10, w, SCAN_BEAM_HEIGHT + 20);

      // 5. Random glitch strip (~2% chance)
      if (Math.random() < GLITCH_CHANCE) {
        const glitchH = GLITCH_MIN_H + Math.random() * (GLITCH_MAX_H - GLITCH_MIN_H);
        const glitchY = Math.floor(Math.random() * (h - glitchH));
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (GLITCH_MIN_OFFSET + Math.random() * (GLITCH_MAX_OFFSET - GLITCH_MIN_OFFSET));
        // Use drawImage self-copy — works with the ctx transform, more reliable than getImageData
        ctx.drawImage(
          canvas,
          0, glitchY * dpr, canvas.width, Math.ceil(glitchH * dpr),       // source rect (in canvas pixels)
          offsetX, glitchY, w, glitchH                                     // dest rect (in CSS pixels, transformed)
        );
      }

      // 6. Scanline overlay (cached blit)
      if (scanlineCanvas) {
        ctx.drawImage(scanlineCanvas, 0, 0);
      }

      // 7. Vignette (cached blit)
      if (vignetteCanvas) {
        ctx.drawImage(vignetteCanvas, 0, 0);
      }

      // 8. Subtle screen flicker (~2% chance)
      if (Math.random() < FLICKER_CHANCE) {
        ctx.fillStyle = `rgba(0, 0, 0, ${FLICKER_ALPHA})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <RainContainer>
      <canvas ref={canvasRef} />
    </RainContainer>
  );
};

const RainContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  canvas { display: block; }
`;

export default MatrixRain;
