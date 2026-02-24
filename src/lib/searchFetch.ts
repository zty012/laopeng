/**
 * 使用 search 模型（如 perplexity/sonar）发起一次性联网查询，返回原始文本。
 * 通过 VITE_OPENROUTER_SEARCH_MODEL 配置模型，默认 perplexity/sonar。
 */
export async function searchQuery(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string;
  const model =
    (import.meta.env.VITE_OPENROUTER_SEARCH_MODEL as string) || 'perplexity/sonar';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Laopeng Chat',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content;
}
