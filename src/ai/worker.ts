// Transformers.js Web Worker for embedding and zero-shot classification
// Runs in a separate thread to avoid blocking the UI

import { pipeline, type FeatureExtractionPipeline, type ZeroShotClassificationPipeline } from '@huggingface/transformers'
import { EMBEDDING_MODEL, CLASSIFIER_MODEL } from './models'
import type { TfWorkerRequest, TfWorkerResponse } from './protocol'

let embedder: FeatureExtractionPipeline | null = null
let classifier: ZeroShotClassificationPipeline | null = null

function postResponse(response: TfWorkerResponse) {
  self.postMessage(response)
}

async function handleInit(requestId: string) {
  try {
    postResponse({ type: 'status', status: 'loading', progress: 0, message: 'Loading embedding model...' })

    embedder = await pipeline('feature-extraction', EMBEDDING_MODEL.id, {
      dtype: 'q8',
    }) as FeatureExtractionPipeline

    postResponse({ type: 'status', status: 'loading', progress: 50, message: 'Loading classifier model...' })

    classifier = await pipeline('zero-shot-classification', CLASSIFIER_MODEL.id, {
      dtype: 'q8',
    }) as ZeroShotClassificationPipeline

    postResponse({ type: 'status', status: 'ready', progress: 100, message: 'Models ready' })
    postResponse({ type: 'initResult', requestId, success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    postResponse({ type: 'status', status: 'error', message })
    postResponse({ type: 'initResult', requestId, success: false, error: message })
  }
}

async function handleEmbed(requestId: string, text: string) {
  if (!embedder) {
    postResponse({ type: 'error', requestId, message: 'Embedding model not loaded' })
    return
  }

  try {
    const output = await embedder(text, { pooling: 'mean', normalize: true })
    const vector = Array.from(output.data as Float32Array)
    postResponse({ type: 'embedResult', requestId, vector })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    postResponse({ type: 'error', requestId, message })
  }
}

async function handleClassify(requestId: string, text: string, labels: string[]) {
  if (!classifier) {
    postResponse({ type: 'error', requestId, message: 'Classifier model not loaded' })
    return
  }

  try {
    const result = await classifier(text, labels, { multi_label: true })
    const resultObj = result as { labels: string[]; scores: number[] }
    const scores = resultObj.labels.map((label: string, i: number) => ({
      label,
      score: resultObj.scores[i],
    }))
    scores.sort((a, b) => b.score - a.score)
    postResponse({ type: 'classifyResult', requestId, scores })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    postResponse({ type: 'error', requestId, message })
  }
}

async function handleClassifyBatch(
  requestId: string,
  items: { id: string; text: string }[],
  labels: string[],
) {
  if (!classifier) {
    postResponse({ type: 'error', requestId, message: 'Classifier model not loaded' })
    return
  }

  try {
    const results: { id: string; scores: { label: string; score: number }[] }[] = []

    for (const item of items) {
      const result = await classifier(item.text, labels, { multi_label: true })
      const resultObj = result as { labels: string[]; scores: number[] }
      const scores = resultObj.labels.map((label: string, i: number) => ({
        label,
        score: resultObj.scores[i],
      }))
      scores.sort((a, b) => b.score - a.score)
      results.push({ id: item.id, scores })
    }

    postResponse({ type: 'classifyBatchResult', requestId, results })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    postResponse({ type: 'error', requestId, message })
  }
}

self.onmessage = async (e: MessageEvent<TfWorkerRequest>) => {
  const msg = e.data
  switch (msg.type) {
    case 'init':
      await handleInit(msg.requestId)
      break
    case 'embed':
      await handleEmbed(msg.requestId, msg.text)
      break
    case 'classify':
      await handleClassify(msg.requestId, msg.text, msg.labels)
      break
    case 'classifyBatch':
      await handleClassifyBatch(msg.requestId, msg.items, msg.labels)
      break
  }
}
