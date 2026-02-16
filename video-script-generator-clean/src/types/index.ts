export type Platform = 'instagram' | 'tiktok' | 'youtube';
export type ThemeType = 'descricao' | 'link';
export type Objetivo = 'leads' | 'venda' | 'engajamento';
export type DuracaoVideo = '15-30s' | '30-60s' | '60-90s' | '90s+';
export type PlataformaPrincipal = 'instagram' | 'tiktok' | 'youtube' | 'todas';

export interface VideoInput {
  url: string;
  platform: Platform;
}

export interface NovoTema {
  tipo: ThemeType;
  conteudo: string;
  publico_alvo?: string;
  objetivo?: Objetivo;
}

export interface ConfiguracoesGeracao {
  num_variacoes: number;
  duracao_video: DuracaoVideo;
  plataforma_principal: PlataformaPrincipal;
}
