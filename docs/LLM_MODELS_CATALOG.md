# Catálogo de Modelos LLM y Reglas de Naming — TariffOS v3

> Verificado contra `https://openrouter.ai/api/v1/models` el 2026-11-26. Todos los modelos listados soportan `tools` (function calling), requerido por el agente Eve y por el pipeline RGI.

## 1. Diferencia crítica de IDs entre proveedores

Los IDs de modelo **no son idénticos** entre NVIDIA Build, OpenRouter y Google AI directo. Usar el ID de un proveedor en otro produce `HTTP 400: <id> is not a valid model ID`.

| Modelo | NVIDIA Build (`nvidia:...`) | OpenRouter (`openrouter:...`) | Google AI (`google:...`) |
| --- | --- | --- | --- |
| Nemotron 3.5 Super VL | `nvidia/nemotron-3.5-super-vl-120b-a12b` | `nvidia/nemotron-3.5-super-vl` *(sin `-120b-a12b`)* | — |
| Nemotron 3.5 Super VL (Free) | — | `nvidia/nemotron-3.5-super-vl:free` | — |
| Nemotron 3 Ultra 550B | `nvidia/nemotron-3-ultra-550b-a55b` | `nvidia/nemotron-3-ultra-550b-a55b` *(o `:free`)* | — |
| Gemini 2.5 Flash | — | `google/gemini-2.5-flash` | `gemini-2.5-flash` |
| Gemini 2.5 Pro | — | `google/gemini-2.5-pro` | `gemini-2.5-pro` |

## 2. Cómo se configura el modelo activo

1. **Agente Eve (`agent/agent.ts` + `agent/model-resolver.ts`):**
   - Lee primero el override dinámico de administración (`SystemSetting` key `ai.runtime_config` configurable en `/admin`, memorizado por turno vía `ctx.memo`).
   - Si no hay override o falta credencial, usa `EVE_MODEL` con formato `<provider>:<modelId>` (`openrouter:`, `nvidia:`, `google:`, `anthropic:`, `openai:`, `openai-compatible:`) o `<provider>/<model>` para Vercel AI Gateway.
2. **Pipeline de clasificación (`classify-stream` / Inngest):**
   - Usa `ai.runtime_config` si existe; si no, `LLM_PROVIDER`, `RGI_MODEL` y `RGI_DEEP_MODEL`.
3. **Embeddings (`TariffNodeEmbedding`):**
   - Mantener en `768` dimensiones (`EMBEDDING_MODEL="nvidia/nemotron-3.5-embed-1b"`, `EMBEDDING_DIMS="768"`).

## 3. Catálogo de modelos candidatos (OpenRouter)

### A. NVIDIA Nemotron (Standard / Multimodal / Free Dev)

| Model ID (OpenRouter) | Contexto | Input / 1M | Output / 1M | Uso recomendado en TariffOS |
| --- | ---: | ---: | ---: | --- |
| `nvidia/nemotron-3.5-super-vl` | 1,048,576 | \$0.15 | \$0.47 | **Default Eve / estándar multimodal** (facturas, imágenes, tools) |
| `nvidia/nemotron-3.5-super-vl:free` | 1,000,000 | \$0.00 | \$0.00 | Pruebas y desarrollo sin costo (sujeto a rate limits) |
| `nvidia/nemotron-3.5-lightning` | 1,048,576 | \$0.07 | \$0.20 | Lotes de alto volumen y triaje rápido |
| `nvidia/nemotron-3.5-lightning:free` | 1,000,000 | \$0.00 | \$0.00 | Pruebas rápidas de lotes sin costo |
| `nvidia/nemotron-3-ultra-550b-a55b` | 262,144 | \$0.50 | \$2.20 | **Deep RGI** (casos ambiguos, notas de sección/capítulo) |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | 1,000,000 | \$0.00 | \$0.00 | Pruebas de razonamiento profundo sin costo |
| `nvidia/nemotron-3-super-120b-a12b` | 262,144 | \$0.07 | \$0.40 | Alternativa económica de texto puro |

### B. Google Gemini (Estabilidad JSON y notas legales)

| Model ID (OpenRouter) | Contexto | Input / 1M | Output / 1M | Uso recomendado en TariffOS |
| --- | ---: | ---: | ---: | --- |
| `google/gemini-2.5-flash` | 1,048,576 | \$0.30 | \$2.50 | Fallback estándar muy estable en JSON estructurado y tools |
| `google/gemini-2.5-flash-lite` | 1,048,576 | \$0.10 | \$0.40 | Pre-clasificación y extracción ligera de facturas |
| `google/gemini-2.5-pro` | 1,048,576 | \$1.25 | \$10.00 | **Deep RGI** de alta precisión legal |
| `google/gemini-3-flash-preview` | 1,048,576 | \$0.50 | \$3.00 | Candidato estándar de nueva generación |
| `google/gemini-3.1-pro-preview` | 1,048,576 | \$2.00 | \$12.00 | Auditoría jurídica y casos de alta complejidad |

### C. Open-Weights de alta relación calidad/precio (DeepSeek, Qwen 3, Kimi, MiniMax)

| Model ID (OpenRouter) | Contexto | Input / 1M | Output / 1M | Uso recomendado en TariffOS |
| --- | ---: | ---: | ---: | --- |
| `deepseek/deepseek-v3.2` | 163,840 | \$0.26 | \$0.38 | Clasificación estándar de muy bajo costo en output |
| `deepseek/deepseek-r1-0528` | 163,840 | \$0.57 | \$2.29 | Razonamiento paso a paso RGI 1→6 |
| `qwen/qwen3-235b-a22b-2507` | 262,144 | \$0.14 | \$0.80 | Excelente español técnico y tool calling económico |
| `qwen/qwen3-235b-a22b-thinking-2507` | 128,000 | \$0.45 | \$3.50 | Razonamiento extendido open-weights |
| `qwen/qwen3-30b-a3b-instruct-2507` | 262,144 | \$0.10 | \$0.30 | Alto volumen / baja latencia |
| `moonshotai/kimi-k2.5` | 262,144 | \$0.50 | \$2.50 | Flujos agénticos multi-paso con múltiples tools |
| `minimax/minimax-m3.1-flash` | 1,048,576 | \$0.15 | \$0.60 | Contexto largo (1M) económico para dossiers extensos |

### D. Frontera / Benchmark de auditoría (Anthropic & OpenAI)

| Model ID (OpenRouter) | Contexto | Input / 1M | Output / 1M | Uso recomendado en TariffOS |
| --- | ---: | ---: | ---: | --- |
| `anthropic/claude-sonnet-4.6` | 1,000,000 | \$3.00 | \$15.00 | Benchmark de calidad RGI y redacción jurídica |
| `anthropic/claude-sonnet-5` | 1,000,000 | \$2.00 | \$10.00 | Agente Eve premium y resolución de disputas |
| `openai/gpt-4.1-mini` | 1,047,576 | \$0.40 | \$1.60 | Tool calling muy predecible a costo medio-bajo |
| `openai/gpt-4.1` | 1,047,576 | \$2.00 | \$8.00 | Benchmark técnico/legal |
| `openai/gpt-5-mini` | 400,000 | \$0.25 | \$2.00 | Razonamiento moderno a costo contenido |

## 4. Herramienta de inspección de modelos y cuota

Usa la CLI del repo para consultar en vivo los modelos disponibles, filtrar los **gratuitos** de OpenRouter y revisar la **cuota/saldo** de tu `OPENROUTER_API_KEY`:

```bash
# Ver cuota y estado de la API key de OpenRouter + resumen de modelos
pnpm llm:models --quota

# Listar todos los modelos gratuitos en OpenRouter (con soporte de tools)
pnpm llm:models --free --tools

# Buscar por familia (ej. nemotron, qwen, deepseek, gemini)
pnpm llm:models --search nemotron

# Consultar modelos de NVIDIA Build o Google AI
pnpm llm:models --provider nvidia --search nemotron
pnpm llm:models --provider google --search gemini

# Salida JSON para scripts o auditoría
pnpm llm:models --free --quota --json
```

También está disponible el endpoint autenticado de administración:
- `GET /api/admin/settings/llm/models?provider=openrouter&free=true&tools=true&quota=true` (requiere rol admin `settings:manage`).

## 5. Recetas rápidas de cambio

```bash
# Cambiar EVE_MODEL en Vercel (Production y Preview)
printf 'openrouter:nvidia/nemotron-3.5-super-vl' | vercel env add EVE_MODEL production --force
printf 'openrouter:nvidia/nemotron-3.5-super-vl' | vercel env add EVE_MODEL preview --force

# Redesplegar para aplicar la variable de entorno
vercel deploy --prod --yes
```
