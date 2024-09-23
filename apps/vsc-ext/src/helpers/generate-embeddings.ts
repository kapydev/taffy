import { pipeline } from '@xenova/transformers';
const embedFuncPromise = pipeline('feature-extraction', 'Supabase/gte-small');

export async function generateEmbedding(data: string): Promise<Array<number>> {
  const embedFunc = await embedFuncPromise;
  const output = await embedFunc(data, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);
  return embedding;
}
