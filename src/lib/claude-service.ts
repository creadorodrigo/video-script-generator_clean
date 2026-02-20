import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';

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
        content: `Você é um estrategista de conteúdo viral com expertise em análise de padrões comportamentais e de produção em vídeos de alta performance. Sua análise deve ser cirúrgica e acionável — identifique apenas o que realmente faz esses vídeos converterem, incluindo elementos visuais, sonoros e de direção.

VÍDEOS DE REFERÊNCIA:
${videosText}

Analise esses ${transcriptions.length} vídeos e extraia os padrões vencedores com precisão estratégica, incluindo padrões de produção (ângulos, iluminação, ambiente e tom de voz) inferidos a partir do conteúdo e contexto dos vídeos.

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
  },
  "padroes_visuais": {
    "angulos_camera": ["close-up frontal", "plano americano"],
    "iluminacao": "natural suave com reflector lateral",
    "ambiente": "home office minimalista com fundo neutro",
    "tom_voz": "energético e urgente, ritmo acelerado"
  }
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Resposta inválida');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON não encontrado na resposta');

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return JSON.parse(jsonrepair(jsonMatch[0]));
  }
}

export async function generateScripts(
  analysis: any | null,
  theme: { tipo: string; conteudo: string; publico_alvo?: string; objetivo?: string },
  settings: { num_variacoes: number; duracao_video: string; plataforma_principal: string },
  restricoes_producao?: string,
  inteligencia?: { total_geracoes: number; roteiros_excelentes: any[] } | null
) {
  const restricoesSection = restricoes_producao?.trim()
    ? `\n[RESTRIÇÕES DE PRODUÇÃO — OBRIGATÓRIO RESPEITAR EM TODOS OS ROTEIROS]
${restricoes_producao.trim()}
Cada roteiro gerado DEVE ser 100% executável dentro dessas restrições. Não crie roteiros que as violem.\n`
    : '';

  const inteligenciaSection = inteligencia && inteligencia.roteiros_excelentes.length > 0
    ? `\n[INTELIGÊNCIA ACUMULADA — ${inteligencia.total_geracoes} gerações anteriores deste usuário]
Os roteiros abaixo já provaram ter alta performance (score ≥ 8.0). Use-os como referência de qualidade e padrão de excelência — não os copie, mas absorva o que os fez funcionar:
${JSON.stringify(inteligencia.roteiros_excelentes, null, 2)}\n`
    : '';

  const padraoSection = analysis
    ? `[PADRÕES VENCEDORES IDENTIFICADOS NOS VÍDEOS DE REFERÊNCIA]
${JSON.stringify(analysis, null, 2)}`
    : `[MODO SEM VÍDEOS DE REFERÊNCIA]
Nenhum vídeo de referência foi fornecido. Use seu conhecimento como copywriter de elite e as melhores práticas consolidadas para ${settings.plataforma_principal === 'todas' ? 'todas as plataformas' : settings.plataforma_principal}: ganchos que param o scroll nos primeiros 3 segundos, estrutura problema-agitação-solução ou storytelling, CTAs diretos e urgentes.${inteligencia ? ' Priorize a inteligência acumulada do usuário como principal referência de estilo.' : ''}`;

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: `Você é um copywriter de elite com 15 anos de experiência criando roteiros de vídeos de alta conversão para as principais plataformas digitais. Você domina neuromarketing, storytelling estratégico e psicologia do consumidor. Cada palavra que você escreve é calculada para maximizar retenção e conversão. Você não cria conteúdo genérico — você cria roteiros que param o scroll e convertem.

${padraoSection}

[PRODUTO/TEMA]
${theme.tipo === 'descricao' ? theme.conteudo : `Link do produto: ${theme.conteudo}`}
${theme.publico_alvo ? `Público-alvo: ${theme.publico_alvo}` : ''}
${theme.objetivo ? `Objetivo principal: ${theme.objetivo}` : ''}

[CONFIGURAÇÕES DE PRODUÇÃO]
- Duração: ${settings.duracao_video}
- Plataforma: ${settings.plataforma_principal}
- Variações solicitadas: ${settings.num_variacoes}
${restricoesSection}${inteligenciaSection}
[MISSÃO]
Crie ${settings.num_variacoes} roteiros DISTINTOS — cada um com uma abordagem, gancho e estrutura narrativa diferente. Cada roteiro deve ser pronto para gravar, com linguagem natural e fluida. Para cada roteiro, inclua obrigatoriamente a seção "direcao_producao" com orientações específicas de ângulos de câmera para cada parte do vídeo, setup de iluminação, ambiente/cenário recomendado e tom de voz para entrega — tornando o roteiro um guia completo de gravação.

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
    "direcao_producao": {
      "angulos_recomendados": {
        "gancho": "Close-up extremo, câmera ao nível dos olhos, direto para a lente",
        "corpo": "Plano americano ou busto, leve movimentação lateral para dinamismo",
        "cta": "Close-up, olho direto na câmera, tom de proximidade"
      },
      "iluminacao": "Ring light frontal suave ou luz natural pela janela lateral sem sombras duras",
      "ambiente": "Fundo neutro ou ambiente organizado relevante ao tema, sem distrações visuais",
      "tom_voz": "Gancho energético e direto, corpo didático e confiante, CTA urgente e pessoal"
    },
    "notas_criacao": "Explicação estratégica de por que este roteiro converte"
  }
]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Resposta inválida');

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Array JSON não encontrado');

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return JSON.parse(jsonrepair(jsonMatch[0]));
  }
}

async function getYouTubeMetadata(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return '';
    const data = await res.json();
    return `Vídeo do YouTube: "${data.title}" por ${data.author_name}. Legenda indisponível — análise baseada no título do vídeo.`;
  } catch {
    return '';
  }
}

export async function extractYouTubeTranscription(
  url: string
): Promise<{ text: string; fallback: boolean }> {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
    /m\.youtube\.com\/watch\?v=([^&\n?#]+)/,
  ];

  let videoId = '';
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) { videoId = match[1]; break; }
  }

  if (!videoId) {
    console.warn(`[youtube] URL não reconhecida: ${url}`);
    return { text: '', fallback: true };
  }

  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return { text: transcript.map((item: any) => item.text).join(' '), fallback: false };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'erro desconhecido';
    console.warn(`[youtube-transcript] Vídeo ${videoId}: transcrição indisponível (${reason}). Buscando metadados...`);
    const metadata = await getYouTubeMetadata(videoId);
    return { text: metadata, fallback: true };
  }
}

export function identifyPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  throw new Error('Plataforma não reconhecida');
}
