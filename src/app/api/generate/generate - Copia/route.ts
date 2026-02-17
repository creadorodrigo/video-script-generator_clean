import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
  analyzePatterns,
  generateScripts,
  extractYouTubeTranscription,
  identifyPlatform,
} from '@/lib/claude-service';

const MAX_GENERATIONS = parseInt(process.env.MAX_GENERATIONS_PER_USER_MONTH || '4');

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 2. Verificar limite mensal
    if (user.generationsUsed >= MAX_GENERATIONS) {
      const resetDate = new Date(user.lastReset);
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);

      return NextResponse.json(
        {
          error: 'Limite de gerações atingido',
          details: {
            generationsUsed: user.generationsUsed,
            limit: MAX_GENERATIONS,
            resetDate: resetDate.toISOString(),
          },
        },
        { status: 429 }
      );
    }

    // 3. Ler dados da requisição
    const body = await request.json();
    const { videos_referencia, novo_tema, configuracoes } = body;

    // 4. Validações básicas
    if (!novo_tema?.conteudo || novo_tema.conteudo.length < 20) {
      return NextResponse.json(
        { error: 'Descreva o tema com pelo menos 20 caracteres' },
        { status: 400 }
      );
    }

    if (!videos_referencia || videos_referencia.length === 0) {
      return NextResponse.json(
        { error: 'Adicione pelo menos 1 vídeo de referência' },
        { status: 400 }
      );
    }

    // 5. Extrair transcrições
    const transcriptions = await Promise.all(
      videos_referencia.map(async (video: { url: string; platform?: string }) => {
        const platform = video.platform || identifyPlatform(video.url);
        let text = '';

        if (platform === 'youtube') {
          text = await extractYouTubeTranscription(video.url);
        } else {
          // Mock para Instagram/TikTok (implementar Whisper futuramente)
          text = `Conteúdo de vídeo ${platform}: Este vídeo mostra estratégias de marketing digital com alto engajamento. O criador usa técnicas de storytelling, prova social e urgência para converter a audiência.`;
        }

        return { platform, text };
      })
    );

    // 6. Analisar padrões com Claude
    const analysis = await analyzePatterns(transcriptions);

    // 7. Gerar roteiros com Claude
    const scripts = await generateScripts(analysis, novo_tema, configuracoes);

    // 8. Salvar no banco
    const savedResult = await prisma.generatedScript.create({
      data: {
        userId: user.id,
        newTheme: novo_tema,
        settings: configuracoes,
        scripts: scripts,
        consolidatedAnalysis: analysis,
      },
    });

    // 9. Incrementar contador
    await prisma.user.update({
      where: { id: user.id },
      data: { generationsUsed: { increment: 1 } },
    });

    // 10. Retornar resultado
    return NextResponse.json({
      request_id: savedResult.id,
      timestamp: new Date().toISOString(),
      analise_consolidada: analysis,
      roteiros_gerados: scripts,
      uso: {
        geracoes_usadas: user.generationsUsed + 1,
        limite_mensal: MAX_GENERATIONS,
        restantes: MAX_GENERATIONS - user.generationsUsed - 1,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar roteiros:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao processar',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
