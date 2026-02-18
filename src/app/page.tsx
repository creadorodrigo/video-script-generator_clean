'use client';

import { useState } from 'react';

type Platform = 'instagram' | 'tiktok' | 'youtube';
type DuracaoVideo = '15-30s' | '30-60s' | '60-90s' | '90s+';
type PlataformaPrincipal = 'instagram' | 'tiktok' | 'youtube' | 'todas';

interface VideoInput { url: string; platform: Platform; }
interface Roteiro {
  id: string; numero: number; titulo: string; score_aderencia: number;
  duracao_estimada_segundos: number; plataformas_recomendadas: string[];
  gancho: { texto: string; timing: string; tipo?: string };
  corpo: { texto: string; timing: string; estrutura?: string; pontos_principais?: string[] };
  cta: { texto: string; timing: string; tipo?: string };
  notas_criacao: string;
}

export default function Home() {
  // ✅ REMOVIDO: useSession, useRouter, verificação de autenticação
  
  const [videos, setVideos] = useState<VideoInput[]>([{ url: '', platform: 'youtube' }]);
  const [tema, setTema] = useState({ tipo: 'descricao', conteudo: '', publico_alvo: '', objetivo: '' });
  const [config, setConfig] = useState({ num_variacoes: 7, duracao_video: '60-90s' as DuracaoVideo, plataforma_principal: 'todas' as PlataformaPrincipal });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState<{ analise_consolidada: any; roteiros_gerados: Roteiro[]; uso: any; avisos?: string[] } | null>(null);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // ✅ REMOVIDO: useEffect que redireciona para /login
  // ✅ REMOVIDO: verificações de status de autenticação

  const updateVideoUrl = (index: number, url: string) => {
    const newVideos = [...videos];
    let platform: Platform = 'youtube';
    if (url.includes('instagram.com')) platform = 'instagram';
    else if (url.includes('tiktok.com')) platform = 'tiktok';
    newVideos[index] = { url, platform };
    setVideos(newVideos);
  };

  const canGenerate = () => videos.some(v => v.url.length > 0) && tema.conteudo.length >= 20;

  const handleGenerate = async () => {
    if (!canGenerate()) return;
    setError('');
    setResults(null);
    setWarnings([]);
    setLoading(true);

    try {
      setLoadingStep('Extraindo transcrições dos vídeos...');
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStep('Analisando padrões vencedores com IA...');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos_referencia: videos.filter(v => v.url.length > 0),
          novo_tema: tema,
          configuracoes: config,
        }),
      });

      setLoadingStep(`Gerando ${config.num_variacoes} variações de roteiros...`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao gerar roteiros');

      if (data.avisos?.length) setWarnings(data.avisos);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const copyScript = (roteiro: Roteiro) => {
    const text = `ROTEIRO #${roteiro.numero} - ${roteiro.titulo}\n\nGANCHO (${roteiro.gancho.timing}):\n${roteiro.gancho.texto}\n\nCORPO (${roteiro.corpo.timing}):\n${roteiro.corpo.texto}\n\nCTA (${roteiro.cta.timing}):\n${roteiro.cta.texto}`;
    navigator.clipboard.writeText(text);
    alert('Roteiro copiado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold mb-4">Processando...</h2>
          <p className="text-gray-600 mb-4">{loadingStep}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-sm text-gray-500 mt-4">Isso pode levar 30-60 segundos</p>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-1">✨ {results.roteiros_gerados.length} Roteiros Gerados!</h1>
                <p className="text-gray-600">Baseados nos padrões vencedores identificados</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Gerações usadas: {results.uso?.geracoes_usadas}/{results.uso?.limite_mensal}</p>
                <p>Restantes: {results.uso?.restantes}</p>
              </div>
            </div>
            <button onClick={() => { setResults(null); setVideos([{ url: '', platform: 'youtube' }]); setTema({ tipo: 'descricao', conteudo: '', publico_alvo: '', objetivo: '' }); }}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              🔄 Gerar Novos Roteiros
            </button>
          </div>

          {/* Avisos de transcrição */}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ Atenção</p>
              {warnings.map((w, i) => (
                <p key={i} className="text-sm text-yellow-700">{w}</p>
              ))}
              <p className="text-xs text-yellow-600 mt-2">Para melhor qualidade, use vídeos com legendas ativadas no YouTube.</p>
            </div>
          )}

          {/* Análise */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Padrões Identificados</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-700 mb-2">🎣 Ganchos</h3>
                {results.analise_consolidada?.padroes_ganchos?.map((g: any, i: number) => (
                  <p key={i} className="text-sm text-gray-700">• {g.tipo} ({g.frequencia})</p>
                ))}
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-purple-700 mb-2">📝 Estrutura</h3>
                <p className="text-sm text-gray-700">• {results.analise_consolidada?.padroes_corpo?.estrutura_dominante}</p>
                <p className="text-sm text-gray-700">• {results.analise_consolidada?.padroes_corpo?.num_pontos_medio} pontos médios</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-orange-700 mb-2">🎯 CTAs</h3>
                <p className="text-sm text-gray-700">• {results.analise_consolidada?.padroes_cta?.tipo_dominante}</p>
                <p className="text-sm text-gray-700">• {results.analise_consolidada?.padroes_cta?.posicionamento_medio}</p>
              </div>
            </div>
          </div>

          {/* Roteiros */}
          <div className="space-y-4">
            {results.roteiros_gerados.map((roteiro) => (
              <div key={roteiro.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">#{roteiro.numero} - {roteiro.titulo}</h3>
                    <div className="flex gap-3 mt-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Score: {roteiro.score_aderencia}/10</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{roteiro.duracao_estimada_segundos}s</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{roteiro.plataformas_recomendadas.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-blue-700">🎣 GANCHO</h4>
                      <span className="text-xs text-gray-500">{roteiro.gancho.timing}</span>
                    </div>
                    <p className="text-gray-700">{roteiro.gancho.texto}</p>
                    {roteiro.gancho.tipo && <p className="text-xs text-gray-500 mt-1">Tipo: {roteiro.gancho.tipo}</p>}
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-purple-700">📝 CORPO</h4>
                      <span className="text-xs text-gray-500">{roteiro.corpo.timing}</span>
                    </div>
                    <p className="text-gray-700">{roteiro.corpo.texto}</p>
                    {roteiro.corpo.estrutura && <p className="text-xs text-gray-500 mt-1">Estrutura: {roteiro.corpo.estrutura}</p>}
                    {roteiro.corpo.pontos_principais && (
                      <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                        {roteiro.corpo.pontos_principais.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    )}
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-orange-700">🎯 CTA</h4>
                      <span className="text-xs text-gray-500">{roteiro.cta.timing}</span>
                    </div>
                    <p className="text-gray-700">{roteiro.cta.texto}</p>
                    {roteiro.cta.tipo && <p className="text-xs text-gray-500 mt-1">Tipo: {roteiro.cta.tipo}</p>}
                  </div>
                </div>

                {roteiro.notas_criacao && (
                  <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300 mb-4">
                    <p className="text-sm text-gray-700"><strong>💡 Por que funciona:</strong> {roteiro.notas_criacao}</p>
                  </div>
                )}

                <button onClick={() => copyScript(roteiro)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  📋 Copiar Roteiro
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📹 Gerador de Roteiros</h1>
            <p className="text-gray-600">Sistema aberto para testes</p>
          </div>
          {/* ✅ REMOVIDO: Botão de Sair */}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Vídeos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📹 Vídeos de Referência</h2>
            <p className="text-gray-600 mb-4">Cole até 5 links (YouTube, Instagram, TikTok):</p>
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                  <input type="url" value={video.url} onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {video.url && <span className={`text-xs px-2 py-1 rounded ${video.platform === 'youtube' ? 'bg-red-100 text-red-700' : video.platform === 'instagram' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>{video.platform}</span>}
                  {videos.length > 1 && (
                    <button onClick={() => setVideos(videos.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              ))}
              {videos.length < 5 && (
                <button onClick={() => setVideos([...videos, { url: '', platform: 'youtube' }])}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  + Adicionar link
                </button>
              )}
            </div>
          </div>

          {/* Tema */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Novo Tema/Produto</h2>
            <div className="flex gap-4 mb-4">
              {['descricao', 'link'].map(tipo => (
                <label key={tipo} className="flex items-center cursor-pointer">
                  <input type="radio" checked={tema.tipo === tipo} onChange={() => setTema({ ...tema, tipo })} className="mr-2" />
                  <span>{tipo === 'descricao' ? 'Descrição manual' : 'Link do produto'}</span>
                </label>
              ))}
            </div>
            {tema.tipo === 'descricao' ? (
              <div>
                <textarea value={tema.conteudo} onChange={(e) => setTema({ ...tema, conteudo: e.target.value })}
                  placeholder="Descreva seu produto/tema com detalhes (mínimo 20 caracteres)..."
                  rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <p className="text-sm text-gray-500 mt-1">{tema.conteudo.length} caracteres</p>
              </div>
            ) : (
              <input type="url" value={tema.conteudo} onChange={(e) => setTema({ ...tema, conteudo: e.target.value })}
                placeholder="https://seuproduto.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            )}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Público-alvo (opcional)</label>
                <input type="text" value={tema.publico_alvo} onChange={(e) => setTema({ ...tema, publico_alvo: e.target.value })}
                  placeholder="Ex: Empreendedores 25-40 anos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Objetivo (opcional)</label>
                <select value={tema.objetivo} onChange={(e) => setTema({ ...tema, objetivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Selecione...</option>
                  <option value="leads">Gerar Leads</option>
                  <option value="venda">Venda Direta</option>
                  <option value="engajamento">Engajamento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚙️ Configurações</h2>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Número de variações: <strong className="text-blue-600">{config.num_variacoes}</strong></label>
              <input type="range" min="5" max="10" value={config.num_variacoes}
                onChange={(e) => setConfig({ ...config, num_variacoes: parseInt(e.target.value) })}
                className="w-full" />
              <div className="flex justify-between text-sm text-gray-500"><span>5</span><span>10</span></div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Duração do vídeo:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['15-30s', '30-60s', '60-90s', '90s+'] as DuracaoVideo[]).map(dur => (
                  <label key={dur} className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer text-sm ${config.duracao_video === dur ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300'}`}>
                    <input type="radio" checked={config.duracao_video === dur} onChange={() => setConfig({ ...config, duracao_video: dur })} className="sr-only" />
                    {dur}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Plataforma principal:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['instagram', 'tiktok', 'youtube', 'todas'] as PlataformaPrincipal[]).map(plat => (
                  <label key={plat} className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer text-sm capitalize ${config.plataforma_principal === plat ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300'}`}>
                    <input type="radio" checked={config.plataforma_principal === plat} onChange={() => setConfig({ ...config, plataforma_principal: plat })} className="sr-only" />
                    {plat}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Botão */}
          <div className="flex justify-center pb-8">
            <button onClick={handleGenerate} disabled={!canGenerate()}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${canGenerate() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              🚀 GERAR ROTEIROS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
