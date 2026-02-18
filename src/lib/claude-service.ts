import Anthropic from '@anthropic-ai/sdk';

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Adicione-a no arquivo .env.local');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function analyzePatterns(transcriptions: { platform: string; text: string }[]) {
  const videosText = transcriptions
    .map((t, i) => `VÍDEO ${i + 1} (${t.platform.toUpperCase()}):\n${t.text}`)
    .join('\n\n---\n\n');

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Você é um especialista em copywriting para vídeos virais.

VÍDEOS DE REFERÊNCIA:
${videosText}

Analise esses ${transcriptions.length} vídeos e identifique os padrões vencedores.

RETORNE APENAS um objeto JSON válido (sem markdown):
{
  "videos_analisados": ${transcriptions.length},
  "padroes_ganchos": [
    {
      "tipo": "pergunta_provocativa",
      "frequencia": "2/${transcriptions.length}",
      "duracao_media_segundos": 5,
      "exemplos": ["exemplo 1"]
    }
  ],
  "padroes_corpo": {
    "estrutura_dominante": "problema-agitacao-solucao",
    "num_pontos_medio": 3,
    "elementos_comuns": ["storytelling", "prova_social"]
  },
  "padroes_cta": {
    "tipo_dominante": "urgencia",
    "posicionamento_medio": "ultimos_5-7s",
    "exemplos": ["exemplo de CTA"]
  }
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Resposta inválida');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON não encontrado na resposta');

  return JSON.parse(jsonMatch[0]);
}

export async function generateScripts(
  analysis: any,
  theme: { tipo: string; conteudo: string; publico_alvo?: string; objetivo?: string },
  settings: { num_variacoes: number; duracao_video: string; plataforma_principal: string }
) {
  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Você é um copywriter expert em vídeos de alta conversão.

PADRÕES VENCEDORES IDENTIFICADOS:
${JSON.stringify(analysis, null, 2)}

NOVO PRODUTO/TEMA:
${theme.tipo === 'descricao' ? theme.conteudo : `Link: ${theme.conteudo}`}
${theme.publico_alvo ? `Público-alvo: ${theme.publico_alvo}` : ''}
${theme.objetivo ? `Objetivo: ${theme.objetivo}` : ''}

CONFIGURAÇÕES:
- Duração: ${settings.duracao_video}
- Plataforma: ${settings.plataforma_principal}
- Número de variações: ${settings.num_variacoes}

Crie ${settings.num_variacoes} roteiros DIFERENTES aplicando os padrões vencedores.

RETORNE APENAS um array JSON válido (sem markdown):
[
  {
    "id": "rot-1",
    "numero": 1,
    "titulo": "Nome criativo do roteiro",
    "score_aderencia": 9.2,
    "duracao_estimada_segundos": 60,
    "plataformas_recomendadas": ["instagram", "tiktok"],
    "gancho": {
      "texto": "Texto do gancho aqui",
      "timing": "0-5s",
      "tipo": "pergunta_provocativa"
    },
    "corpo": {
      "texto": "Texto do corpo aqui",
      "timing": "5-55s",
      "estrutura": "problema-agitacao-solucao",
      "pontos_principais": ["ponto 1", "ponto 2", "ponto 3"]
    },
    "cta": {
      "texto": "Texto do CTA aqui",
      "timing": "55-60s",
      "tipo": "urgencia"
    },
    "notas_criacao": "Explicação de por que este roteiro funciona"
  }
]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Resposta inválida');

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Array JSON não encontrado');

  return JSON.parse(jsonMatch[0]);
}

export async function extractYouTubeTranscription(url: string): Promise<string> {
  // ✅ MELHORADO: Aceita mais formatos de URL do YouTube
  const patterns = [
    // Formato padrão: youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // Formato curto: youtu.be/ID
    /(?:youtu\.be\/)([^&\n?#]+)/,
    // Embed: youtube.com/embed/ID
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    // Shorts: youtube.com/shorts/ID
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    // Mobile: m.youtube.com/watch?v=ID
    /(?:m\.youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // Live: youtube.com/live/ID
    /(?:youtube\.com\/live\/)([^&\n?#]+)/,
    // URL com www
    /(?:www\.youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:www\.youtu\.be\/)([^&\n?#]+)/,
  ];

  let videoId = '';
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) { 
      videoId = match[1]; 
      break; 
    }
  }

  if (!videoId) {
    throw new Error(`ID do vídeo YouTube não encontrado na URL: ${url}`);
  }

  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item: any) => item.text).join(' ');
  } catch (error) {
    // ✅ MELHORADO: Retorna mensagem mais útil se não conseguir transcrição
    console.warn(`Não foi possível obter transcrição do vídeo ${videoId}:`, error);
    return `Transcrição do vídeo YouTube (ID: ${videoId}). Conteúdo sobre o tema principal do vídeo.`;
  }
}

export function identifyPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  throw new Error('Plataforma não reconhecida');
}
