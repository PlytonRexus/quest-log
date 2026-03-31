// Model configuration constants for all AI pipelines

export const EMBEDDING_MODEL = {
  id: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  sizeBytes: 23_000_000,
  label: 'Embeddings (all-MiniLM-L6-v2)',
} as const

export const CLASSIFIER_MODEL = {
  id: 'Xenova/mobilebert-uncased-mnli',
  sizeBytes: 25_000_000,
  label: 'Zero-Shot Classifier (MobileBERT)',
} as const

export const LLM_MODELS = {
  small: {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    sizeBytes: 700_000_000,
    label: '1B (fast, ~700MB)',
  },
  medium: {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    sizeBytes: 1_800_000_000,
    label: '3B (balanced, ~1.8GB)',
  },
} as const

export type LlmSize = keyof typeof LLM_MODELS
