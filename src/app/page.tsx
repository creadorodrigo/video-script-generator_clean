'use client';

import { useState } from 'react';
import { VideoInput, NovoTema, ConfiguracoesGeracao } from '@/types';

export default function Home() {
  const [videos, setVideos] = useState<VideoInput[]>([
    { url: '', platform: 'youtube' }
  ]);

  const [tema, setTema] = useState<NovoTema>({
    tipo: 'descricao',
    conteudo: '',
  });

  const [config, setConfig] = useState<ConfiguracoesGeracao>({
    num_variacoes: 7,
    duracao_video: '60-90s',
    plataforma_principal: 'todas',
  });

  const updateVideoUrl = (index: number, url: string) => {
    const newVideos = [...videos];
    let platform: 'youtube' | 'instagram' | 'tiktok' = 'youtube';
    
    if (url.includes('instagram.com')) platform = 'instagram';
    else if (url.includes('tiktok.com')) platform = 'tiktok';
    
    newVideos[index] = { url, platform };
    setVideos(newVideos);
  };

  const addVideo = () => {
    if (videos.length < 5) {
      setVideos([...videos, { url: '', platform: 'youtube' }]);
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const canGenerate = () => {
    const hasVideos = videos.some(v => v.url.length > 0);
    const hasTheme = tema.conteudo.length >= 20;
    return hasVideos && hasTheme;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Gerador de Roteiros Inteligentes
          </h1>
          <p className="text-gray-600">
            Analise vídeos vencedores e gere roteiros otimizados
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Videos Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Vídeos de Referência
            </h2>
            <p className="text-gray-600 mb-4">
              Cole até 5 links de vídeos:
            </p>
            
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {videos.length > 1 && (
                    <button
                      onClick={() => removeVideo(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
              
              {videos.length < 5 && (
                <button
                  onClick={addVideo}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Adicionar link
                </button>
              )}
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Novo Tema/Produto
            </h2>
            
            <div className="mb-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={tema.tipo === 'descricao'}
                    onChange={() => setTema({ ...tema, tipo: 'descricao' })}
                    className="mr-2"
                  />
                  <span>Descrição manual</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={tema.tipo === 'link'}
                    onChange={() => setTema({ ...tema, tipo: 'link' })}
                    className="mr-2"
                  />
                  <span>Link do produto</span>
                </label>
              </div>

              {tema.tipo === 'descricao' ? (
                <div>
                  <label className="block text-gray-700 mb-2">
                    Descreva seu produto/tema:
                  </label>
                  <textarea
                    value={tema.conteudo}
                    onChange={(e) => setTema({ ...tema, conteudo: e.target.value })}
                    placeholder="Ex: Curso de vendas B2B para iniciantes..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {tema.conteudo.length} caracteres (mínimo 20)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 mb-2">
                    Link do produto:
                  </label>
                  <input
                    type="url"
                    value={tema.conteudo}
                    onChange={(e) => setTema({ ...tema, conteudo: e.target.value })}
                    placeholder="https://seuproduto.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Configurações de Geração
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-3">
                Quantas variações de roteiro você precisa?
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {config.num_variacoes}
                  </span>
                  <span className="text-gray-600 ml-2">variações</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  value={config.num_variacoes}
                  onChange={(e) => setConfig({ ...config, num_variacoes: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Duração estimada do vídeo:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['15-30s', '30-60s', '60-90s', '90s+'] as const).map((dur) => (
                  <label
                    key={dur}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      config.duracao_video === dur
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={config.duracao_video === dur}
                      onChange={() => setConfig({ ...config, duracao_video: dur })}
                      className="sr-only"
                    />
                    <span>{dur}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Plataforma principal:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['instagram', 'tiktok', 'youtube', 'todas'] as const).map((plat) => (
                  <label
                    key={plat}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      config.plataforma_principal === plat
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={config.plataforma_principal === plat}
                      onChange={() => setConfig({ ...config, plataforma_principal: plat })}
                      className="sr-only"
                    />
                    <span className="capitalize">{plat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => alert('Em breve! Backend será implementado no próximo passo.')}
              disabled={!canGenerate()}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                canGenerate()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              GERAR ROTEIROS
            </button>
          </div>

          {!canGenerate() && (
            <div className="text-center text-sm text-gray-500">
              Complete os campos para habilitar a geração
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
