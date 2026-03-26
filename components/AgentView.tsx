'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { fetchClientData, saveClientData } from '@/lib/clients-api';
import { ArrowLeft, Send, Trash2, StopCircle, ImageIcon, X, Lightbulb, Volume2, Check, CheckCircle2, History, Plus, MessageSquare, Keyboard, Sparkles, PlayCircle, ThumbsUp, ThumbsDown, UserPlus, UserCircle, ChevronRight, Mic, Loader2, Maximize2, Minimize2, Clock, Copy, ExternalLink, Wand2, Monitor, Zap, ListChecks, Palette, Printer, Upload, Play, Layers, Film, Pause, Music, FolderInput } from 'lucide-react';
import { AgentConfig, AgentId, Message, StylePreset, ChatSession, InstagramProfile, ShotList, ShotItem, BrandKit, Client, StudioProfile } from '@/types';
import { sendMessageToAgent, transcribeAudio, LimitReachedData } from '@/lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import CreatorStockView from './CreatorStockView';
import ProposalWizard from './ProposalWizard';

// --- DATA STRUCTURE FOR EDITING HUB ---
const SOFTWARE_DATA = [
  {
    id: 'premiere',
    name: 'Adobe Premiere Pro',
    description: 'O padrão da indústria. Versátil, integrado à Creative Cloud e perfeito para qualquer fluxo de trabalho.',
    color: '#9999FF', // Brand Color-ish
    bgGradient: 'from-blue-900/50 to-purple-900/50',
    shortcuts: [
      { action: 'Selection Tool (Seta)', win: 'V', mac: 'V' },
      { action: 'Razor Tool (Cortar)', win: 'C', mac: 'C' },
      { action: 'Ripple Delete (Excluir e Juntar)', win: 'Shift + Del', mac: 'Shift + Del' },
      { action: 'Add Edit (Corte no Cursor)', win: 'Ctrl + K', mac: 'Cmd + K' },
      { action: 'Track Select Forward', win: 'A', mac: 'A' },
      { action: 'Pen Tool (Keyframes)', win: 'P', mac: 'P' },
      { action: 'Speed/Duration', win: 'Ctrl + R', mac: 'Cmd + R' },
      { action: 'Export Media', win: 'Ctrl + M', mac: 'Cmd + M' },
      { action: 'Render In to Out', win: 'Enter', mac: 'Enter' },
      { action: 'Nest Sequence', win: 'Right Click > Nest', mac: 'Right Click > Nest' },
    ],
    tutorials: [
      {
        title: 'Workflow Leve com Proxies',
        description: 'Aprenda a editar vídeos em 4K/8K em qualquer computador criando arquivos Proxy leves.',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Domine a Remix Tool',
        description: 'Ajuste a duração de qualquer música para caber perfeitamente no seu vídeo com IA.',
        thumbnail: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Edição Baseada em Texto',
        description: 'Edite o vídeo apenas apagando o texto da transcrição automática. Novo recurso!',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve',
    description: 'Poderoso para Color Grading e edição gratuita robusta. O favorito de Hollywood.',
    color: '#FF6B6B',
    bgGradient: 'from-orange-900/50 to-red-900/50',
    shortcuts: [
      { action: 'Blade Mode (Lâmina)', win: 'B', mac: 'B' },
      { action: 'Selection Mode', win: 'A', mac: 'A' },
      { action: 'Ripple Delete Start', win: 'Ctrl + Shift + [', mac: 'Cmd + Shift + [' },
      { action: 'Ripple Delete End', win: 'Ctrl + Shift + ]', mac: 'Cmd + Shift + ]' },
      { action: 'Zoom to Fit', win: 'Shift + Z', mac: 'Shift + Z' },
      { action: 'Disable/Enable Clip', win: 'D', mac: 'D' },
      { action: 'Snapping On/Off', win: 'N', mac: 'N' },
      { action: 'Insert Clip', win: 'F9', mac: 'F9' },
      { action: 'Overwrite Clip', win: 'F10', mac: 'F10' },
      { action: 'Dynamic Zoom', win: 'Inspector Panel', mac: 'Inspector Panel' },
    ],
    tutorials: [
      {
        title: 'Color Grading: Nodes Básicos',
        description: 'Entenda a estrutura de nós (Nodes) para correção de cor primária e secundária.',
        thumbnail: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Magic Mask (IA)',
        description: 'Isole pessoas e objetos automaticamente para tratar a cor separadamente.',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Estabilização de Imagem',
        description: 'Salve takes tremidos usando o poderoso estabilizador na aba Edit ou Color.',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'finalcut',
    name: 'Final Cut Pro',
    description: 'Exclusivo para Mac. Velocidade incomparável com a Magnetic Timeline.',
    color: '#EAB308',
    bgGradient: 'from-yellow-900/50 to-amber-900/50',
    shortcuts: [
      { action: 'Blade (Cortar)', win: 'N/A', mac: 'Cmd + B' },
      { action: 'Select Tool', win: 'N/A', mac: 'A' },
      { action: 'Connect to Primary Storyline', win: 'N/A', mac: 'Q' },
      { action: 'Insert', win: 'N/A', mac: 'W' },
      { action: 'Append to End', win: 'N/A', mac: 'E' },
      { action: 'Range Selection', win: 'N/A', mac: 'R' },
      { action: 'Zoom to Fit', win: 'N/A', mac: 'Shift + Z' },
      { action: 'Enable/Disable Clip', win: 'N/A', mac: 'V' },
      { action: 'Show/Hide Inspector', win: 'N/A', mac: 'Cmd + 4' },
      { action: 'Render Selection', win: 'N/A', mac: 'Ctrl + R' },
    ],
    tutorials: [
      {
        title: 'Magnetic Timeline',
        description: 'Como funciona a timeline magnética e como evitar "quebrar" seu sync.',
        thumbnail: 'https://images.unsplash.com/photo-1531297461136-82lw8z9a?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Object Tracker Simples',
        description: 'Cole títulos ou efeitos em objetos em movimento com 2 cliques.',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Exportação Otimizada',
        description: 'Configurações de compressor para YouTube e Instagram sem perder qualidade.',
        thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'capcut',
    name: 'CapCut PC',
    description: 'O rei da velocidade para vídeos curtos. Legendas automáticas e efeitos virais.',
    color: '#000000',
    bgGradient: 'from-zinc-800 to-zinc-900',
    shortcuts: [
      { action: 'Split (Cortar)', win: 'Ctrl + B', mac: 'Cmd + B' },
      { action: 'Copy', win: 'Ctrl + C', mac: 'Cmd + C' },
      { action: 'Paste', win: 'Ctrl + V', mac: 'Cmd + V' },
      { action: 'Undo', win: 'Ctrl + Z', mac: 'Cmd + Z' },
      { action: 'Delete', win: 'Backspace', mac: 'Delete' },
      { action: 'Play/Pause', win: 'Space', mac: 'Space' },
      { action: 'Zoom In Timeline', win: 'Ctrl +', mac: 'Cmd +' },
      { action: 'Zoom Out Timeline', win: 'Ctrl -', mac: 'Cmd -' },
      { action: 'Export', win: 'Ctrl + E', mac: 'Cmd + E' },
      { action: 'Full Screen', win: 'Ctrl + F', mac: 'Cmd + F' },
    ],
    tutorials: [
      {
        title: 'Legendas Automáticas',
        description: 'Gere legendas animadas (estilo Hormozi) em segundos e customize as cores.',
        thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Curve de Velocidade (Velocity)',
        description: 'Faça aquele efeito de câmera lenta suave para edits de produtos.',
        thumbnail: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=400&auto=format&fit=crop'
      },
      {
        title: 'Remover Fundo (Sem Chroma)',
        description: 'Use a IA do CapCut para remover o fundo de qualquer vídeo sem tela verde.',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop'
      }
    ]
  }
];

// --- DATA STRUCTURE FOR FAMOUS TECHNIQUES ---
const TECHNIQUES_DATA = [
  {
    id: 'match-cut',
    title: 'Match Cut',
    category: 'Transição Criativa',
    difficulty: 'Intermediário',
    description: 'Corte que conecta duas cenas diferentes através de uma semelhança visual, de movimento ou sonora.',
    previewImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', // Abstract similarity
    tutorialLink: 'https://www.youtube.com/results?search_query=how+to+do+match+cut+editing'
  },
  {
    id: 'j-cut-l-cut',
    title: 'J-Cut / L-Cut',
    category: 'Narrativa & Áudio',
    difficulty: 'Iniciante',
    description: 'Técnica onde o áudio da próxima cena começa antes do vídeo (J) ou continua na próxima cena (L).',
    previewImage: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop', // Sound waves/Mixing
    tutorialLink: 'https://www.youtube.com/results?search_query=j+cut+l+cut+tutorial'
  },
  {
    id: 'speed-ramping',
    title: 'Speed Ramping',
    category: 'Efeitos Visuais',
    difficulty: 'Intermediário',
    description: 'Alternância suave entre câmera lenta e velocidade normal para dar ênfase a uma ação.',
    previewImage: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b1c?q=80&w=800&auto=format&fit=crop', // Motion blur/Action
    tutorialLink: 'https://www.youtube.com/results?search_query=speed+ramping+premiere+davinci'
  },
  {
    id: 'dolly-zoom',
    title: 'Dolly Zoom (Vertigo)',
    category: 'Cinematografia',
    difficulty: 'Avançado',
    description: 'Efeito onde a câmera se move para frente enquanto dá zoom out (ou vice-versa), distorcendo o fundo.',
    previewImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=800&auto=format&fit=crop', // Tunnel/Depth effect
    tutorialLink: 'https://www.youtube.com/results?search_query=dolly+zoom+effect+editing'
  }
];

// --- DATA STRUCTURE FOR LIGHTING EDUCATION HUB ---
const LIGHTING_DATA = [
  {
    id: 'rembrandt',
    title: 'Rembrandt',
    description: 'O clássico dramático com o triângulo de luz na bochecha sombreada.',
    tags: ['Dramático', 'Retrato', 'Clássico'],
    resultImage: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1623945202685-64d1f2747161?q=80&w=800&auto=format&fit=crop', // Placeholder for blueprint
    setupDetails: 'Posicione sua luz principal (Key Light) a 45º do eixo da câmera e ligeiramente acima da linha dos olhos do sujeito. O objetivo é criar um pequeno triângulo de luz na bochecha oposta à fonte de luz (o lado que está na sombra). Use um rebatedor do lado oposto se quiser suavizar o contraste.',
    videoUrl: 'https://www.youtube.com/embed/J73s72X7q68' // Generic lighting tutorial embed
  },
  {
    id: 'butterfly',
    title: 'Butterfly / Paramount',
    description: 'Luz frontal alta que favorece a beleza e destaca as maçãs do rosto.',
    tags: ['Beleza', 'Moda', 'Feminino'],
    resultImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=800&auto=format&fit=crop',
    setupDetails: 'Coloque a fonte de luz diretamente acima e à frente do sujeito (no eixo da câmera). A luz deve estar alta o suficiente para criar uma pequena sombra em forma de borboleta logo abaixo do nariz. Frequentemente usada com um rebatedor embaixo do rosto (Clamshell) para preencher sombras no pescoço.',
    videoUrl: 'https://www.youtube.com/embed/snQ7q_qFvTQ'
  },
  {
    id: 'split',
    title: 'Split / Lateral',
    description: 'Alto contraste, dividindo o rosto exatamente em metade luz e metade sombra.',
    tags: ['Mistério', 'Vilão', 'Intenso'],
    resultImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1550926715-e8d904b39b34?q=80&w=800&auto=format&fit=crop',
    setupDetails: 'Posicione a luz principal a 90º do sujeito, exatamente ao lado. Isso iluminará apenas uma metade do rosto, deixando a outra na escuridão total. É um setup muito simples (apenas 1 luz) mas com impacto visual fortíssimo para cenas de suspense.',
    videoUrl: 'https://www.youtube.com/embed/j1hG6_VjE5g'
  },
  {
    id: 'checkerboard',
    title: 'Checkerboard',
    description: 'Luz de fundo oposta à luz principal para criar profundidade e volume.',
    tags: ['Profundidade', 'Entrevista', 'Cinema'],
    resultImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1588615419955-de747c0b0c67?q=80&w=800&auto=format&fit=crop',
    setupDetails: 'Ilumine o lado "A" do rosto do sujeito. No fundo (background), ilumine a área atrás do lado "B" (sombreado) do rosto e deixe escura a área atrás do lado "A". Esse contraste cruzado (Luz/Sombra - Sombra/Luz) cria uma separação incrível entre o sujeito e o cenário.',
    videoUrl: 'https://www.youtube.com/embed/3Q6qX9z5Q2A'
  },
  {
    id: 'teal_orange',
    title: 'Teal & Orange',
    description: 'Contraste cromático moderno: Sombras frias (azul) e pele quente (laranja).',
    tags: ['Moderno', 'Youtube', 'Vibrante'],
    resultImage: 'https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=800&auto=format&fit=crop',
    setupDetails: 'Use uma luz quente (3200K ou gelatina CTO) como principal para iluminar a pele (Laranja). Use uma luz fria (5600K+ ou gelatina Azul/Teal) para o preenchimento ou para iluminar o fundo. O contraste entre cores complementares destaca o sujeito e dá um look de blockbuster.',
    videoUrl: 'https://www.youtube.com/embed/LxO-6rlihSg'
  },
  {
    id: 'film_noir',
    title: 'Film Noir',
    description: 'Sombras duras, persianas, silhuetas e alto contraste em Preto e Branco.',
    tags: ['Retro', 'Crime', 'Estilizado'],
    resultImage: 'https://images.unsplash.com/photo-1595232731805-4c605ad98274?q=80&w=800&auto=format&fit=crop',
    diagramImage: 'https://images.unsplash.com/photo-1616164230109-84724806a666?q=80&w=800&auto=format&fit=crop',
    setupDetails: 'Use fontes de luz pequenas e duras (sem softbox) para criar sombras bem definidas. Use persianas ou objetos na frente da luz (Gobos) para projetar padrões no cenário. A exposição deve ser baixa (Low Key) para manter a atmosfera de mistério.',
    videoUrl: 'https://www.youtube.com/embed/q4X1X1X1X1X' // Placeholder ID
  }
];

// --- DATA STRUCTURE FOR SFX LIBRARY ---
const SFX_DATA = [
  {
    id: 'cinematic_boom',
    title: 'Cinematic Hit / Boom',
    category: 'Impacto',
    description: 'Explosão grave de baixa frequência. Essencial para trailers.',
    usageTip: 'Use em cortes secos para preto ou na revelação de títulos importantes.',
    searchKeywords: 'Cinematic Boom, Deep Impact, Trailer Hit, Bass Drop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_55a6d51451.mp3', // Boom sound
    waveformImage: 'https://images.unsplash.com/photo-1516223725307-6f76b9182f7c?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'whoosh',
    title: 'Whoosh / Swish',
    category: 'Transição',
    description: 'Som de ar cortado em alta velocidade.',
    usageTip: 'Sincronize com movimentos rápidos de câmera (Whip Pan) ou objetos passando na tela.',
    searchKeywords: 'Fast Whoosh, Air Swish, Transition Sound, Whip Pan Audio',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_8275553658.mp3', // Whoosh sound
    waveformImage: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'riser',
    title: 'Riser / Build-up',
    category: 'Tensão',
    description: 'Som que sobe de tom (pitch) gradualmente.',
    usageTip: 'Use antes de um clímax ou revelação. Corte abruptamente quando o evento acontecer.',
    searchKeywords: 'Cinematic Riser, Tension Builder, Pitch Rise, Uplifter',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', // Riser sound
    waveformImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'glitch',
    title: 'Digital Glitch',
    category: 'Tech / Moderno',
    description: 'Ruído digital, interferência e falha de sinal.',
    usageTip: 'Ótimo para vídeos de tecnologia, transições modernas ou para simular erro de sistema.',
    searchKeywords: 'Data Glitch, Digital Noise, Static, Distortion',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1067035728.mp3', // Glitch sound
    waveformImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'wilhelm',
    title: 'Wilhelm Scream',
    category: 'Easter Egg',
    description: 'O grito mais famoso da história do cinema.',
    usageTip: 'Use com moderação como piada interna quando alguém cai ou é arremessado.',
    searchKeywords: 'Wilhelm Scream, Classic Movie Scream, Falling Scream',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg', // Wilhelm public domain
    waveformImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop'
  }
];

// --- EDITING KNOWLEDGE HUB COMPONENT ---

const EditingKnowledgeHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedSoftware, setSelectedSoftware] = useState<typeof SOFTWARE_DATA[0] | null>(null);
    const [activeTab, setActiveTab] = useState<'shortcuts' | 'tutorials'>('shortcuts');

    if (selectedSoftware) {
        // DETAIL VIEW (Drill-down)
        return (
            <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300">
                {/* Header */}
                <header className={`p-6 md:p-10 text-white relative overflow-hidden bg-gradient-to-br ${selectedSoftware.bgGradient}`}>
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="space-y-4">
                            <button onClick={() => setSelectedSoftware(null)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                <ArrowLeft className="w-4 h-4" /> Voltar para Softwares
                            </button>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{selectedSoftware.name}</h1>
                            <p className="text-white/80 max-w-2xl text-lg leading-relaxed">{selectedSoftware.description}</p>
                        </div>
                        {/* Fake Icon Box */}
                        <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                            <span className="text-3xl font-black text-white">{selectedSoftware.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                {/* Tabs & Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4 md:p-8">
                        {/* Tab Navigation */}
                        <div className="flex gap-4 border-b border-zinc-800 mb-8">
                            <button 
                                onClick={() => setActiveTab('shortcuts')} 
                                className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'shortcuts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-400 hover:text-zinc-300'}`}
                            >
                                <div className="flex items-center gap-2"><Keyboard className="w-4 h-4"/> Atalhos Essenciais</div>
                            </button>
                            <div className="pb-3 px-2 text-sm font-bold uppercase tracking-widest text-zinc-600 cursor-not-allowed pointer-events-none opacity-60 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4"/> Tutoriais e Técnicas
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-zinc-700/40 text-zinc-500 border border-zinc-700/40 uppercase tracking-widest normal-case">Em breve</span>
                            </div>
                        </div>

                        {/* Shortcuts Table View */}
                        {activeTab === 'shortcuts' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-950 border-b border-zinc-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest w-1/2">Ação / Função</th>
                                            <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Windows</th>
                                            <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Mac OS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {selectedSoftware.shortcuts.map((shortcut, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-zinc-200">{shortcut.action}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-900/20 text-blue-300 text-xs font-mono font-bold border border-blue-900/30">
                                                        {shortcut.win}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-900/20 text-purple-300 text-xs font-mono font-bold border border-purple-900/30">
                                                        {shortcut.mac}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tutorials Grid View */}
                        {activeTab === 'tutorials' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                {selectedSoftware.tutorials.map((tutorial, idx) => (
                                    <div key={idx} className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="relative h-48 overflow-hidden">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                                            <img src={tutorial.thumbnail} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute bottom-3 right-3 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-white mb-2 leading-tight">{tutorial.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">{tutorial.description}</p>
                                            <button className="mt-auto w-full py-2.5 rounded-xl border border-zinc-700 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:text-indigo-400 transition-colors">
                                                Assistir Aula
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW (Main Hub)
    return (
        <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300">
            <header className="p-6 md:p-10 border-b border-zinc-800 bg-zinc-900">
                <div className="max-w-5xl mx-auto w-full">
                    <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Hub de Edição</h1>
                    <p className="text-zinc-400 max-w-2xl text-lg">Selecione seu software para acessar atalhos profissionais e técnicas avançadas de workflow.</p>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SOFTWARE_DATA.map((soft) => (
                        <button 
                            key={soft.id}
                            onClick={() => setSelectedSoftware(soft)}
                            className="group relative flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-indigo-500 transition-all duration-300 text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Decorative Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${soft.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="p-4 rounded-2xl bg-zinc-800 group-hover:scale-110 transition-transform duration-300">
                                    <Layers className="w-8 h-8 text-zinc-300" style={{ color: soft.color }} />
                                </div>
                                <div className="p-2 rounded-full bg-zinc-800 text-zinc-300 group-hover:text-indigo-500 transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-2">{soft.name}</h2>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-2">{soft.description}</p>
                                
                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                    <span className="flex items-center gap-1.5"><Keyboard className="w-3 h-3" /> {soft.shortcuts.length} Atalhos</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span className="flex items-center gap-1.5"><PlayCircle className="w-3 h-3" /> {soft.tutorials.length} Técnicas</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

// --- NEW COMPONENT: EDITING TECHNIQUES GALLERY ---
const EditingTechniquesGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300">
            <header className="p-6 md:p-10 border-b border-zinc-800 bg-zinc-900">
                <div className="max-w-6xl mx-auto w-full">
                    <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-indigo-900/20 text-indigo-400 rounded-xl">
                            <Film className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Técnicas Famosas</h1>
                    </div>
                    <p className="text-zinc-400 max-w-2xl text-lg">Galeria visual de conceitos de edição para elevar a narrativa dos seus vídeos.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TECHNIQUES_DATA.map((technique) => (
                        <div key={technique.id} className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {/* Preview Image Area */}
                            <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                                <img 
                                    src={technique.previewImage} 
                                    alt={technique.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg border border-white/30">
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </div>
                                </div>
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="px-2 py-1 bg-indigo-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm backdrop-blur-sm">
                                        {technique.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-white leading-tight">{technique.title}</h3>
                                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-zinc-700">
                                        {technique.difficulty}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                                    {technique.description}
                                </p>
                                
                                <a 
                                    href={technique.tutorialLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 text-zinc-300 font-bold text-sm rounded-xl transition-all"
                                >
                                    <span>Ver Tutorial</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: LIGHTING EDUCATION HUB ---
const LightingEducationHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedTechnique, setSelectedTechnique] = useState<typeof LIGHTING_DATA[0] | null>(null);

    return (
        <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300 relative">
            <header className="p-6 md:p-10 border-b border-zinc-800 bg-zinc-900">
                <div className="max-w-6xl mx-auto w-full">
                    <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-orange-900/20 text-orange-400 rounded-xl">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Iluminações Famosas</h1>
                    </div>
                    <p className="text-zinc-400 max-w-2xl text-lg">Enciclopédia visual de setups de luz. Clique para ver diagramas técnicos.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {LIGHTING_DATA.map((tech) => (
                        <div 
                            key={tech.id} 
                            onClick={() => setSelectedTechnique(tech)}
                            className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
                                <img 
                                    src={tech.resultImage} 
                                    alt={tech.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Ver Diagrama
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tech.tags.slice(0,2).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-orange-900/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-2">{tech.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FULL SCREEN MODAL */}
            {selectedTechnique && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
                    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center">
                        <div className="w-full max-w-6xl bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden relative animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                                <div className="pointer-events-auto">
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedTechnique.title}</h2>
                                    <div className="flex gap-2">
                                        {selectedTechnique.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedTechnique(null)}
                                    className="pointer-events-auto p-2 bg-black/40 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Result Image */}
                                <div className="aspect-square md:aspect-auto h-[400px] md:h-[600px] relative">
                                    <img src={selectedTechnique.resultImage} className="w-full h-full object-cover" alt="Resultado" />
                                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-bold uppercase">Resultado Final</div>
                                </div>
                                {/* Diagram Image */}
                                <div className="aspect-square md:aspect-auto h-[400px] md:h-[600px] relative bg-zinc-900 border-l border-zinc-800">
                                    <img src={selectedTechnique.diagramImage} className="w-full h-full object-cover p-8" alt="Diagrama" />
                                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-zinc-800 rounded text-white text-xs font-bold uppercase">Diagrama Técnico</div>
                                </div>
                            </div>

                            {/* Details & Video */}
                            <div className="p-8 md:p-12 space-y-10">
                                <div className="max-w-3xl mx-auto text-center">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                        Como Montar
                                    </h3>
                                    <p className="text-lg text-zinc-300 leading-relaxed">
                                        {selectedTechnique.setupDetails}
                                    </p>
                                </div>

                                <div className="max-w-4xl mx-auto">
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={selectedTechnique.videoUrl} 
                                            title="YouTube video player" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NEW COMPONENT: SFX LIBRARY HUB ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SfxLibraryHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio object once
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingId(null);
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = (sfx: typeof SFX_DATA[0]) => {
        if (!audioRef.current) return;

        if (playingId === sfx.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            audioRef.current.src = sfx.audioUrl;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            setPlayingId(sfx.id);
        }
    };

    const copyKeywords = (keywords: string, id: string) => {
        navigator.clipboard.writeText(keywords);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300">
            <header className="p-6 md:p-10 border-b border-zinc-800 bg-zinc-900">
                <div className="max-w-6xl mx-auto w-full">
                    <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-rose-900/20 text-rose-400 rounded-xl">
                            <Music className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Biblioteca SFX Pro</h1>
                    </div>
                    <p className="text-zinc-400 max-w-2xl text-lg">Sampler educacional: Aprenda os efeitos sonoros essenciais e copie as palavras-chave para encontrar os melhores sons.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SFX_DATA.map((sfx) => (
                        <div key={sfx.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            
                            {/* Waveform / Player Area */}
                            <div className="relative h-40 bg-zinc-950 flex items-center justify-center group overflow-hidden border-b border-zinc-800">
                                <img 
                                    src={sfx.waveformImage} 
                                    alt="Waveform" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity grayscale hover:grayscale-0"
                                    style={{ filter: playingId === sfx.id ? 'none' : 'grayscale(100%)' }}
                                />
                                {playingId === sfx.id && (
                                    <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                                )}
                                <button 
                                    onClick={() => togglePlay(sfx)}
                                    className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl ${
                                        playingId === sfx.id 
                                        ? 'bg-rose-500 text-white' 
                                        : 'bg-white/10 hover:bg-white text-white hover:text-rose-600 backdrop-blur-md border border-white/20'
                                    }`}
                                >
                                    {playingId === sfx.id ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-500/20">
                                        {sfx.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{sfx.title}</h3>
                                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{sfx.description}</p>
                                
                                <div className="mt-auto space-y-4">
                                    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                        <p className="text-xs text-zinc-300">
                                            <span className="text-rose-400 font-bold uppercase tracking-wide mr-1">Dica:</span>
                                            {sfx.usageTip}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => copyKeywords(sfx.searchKeywords, sfx.id)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700"
                                    >
                                        {copiedId === sfx.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copiedId === sfx.id ? 'Copiado!' : 'Copiar Keywords'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Fix: Remove conflicting global declaration of aistudio and use type assertion
// as per environment guidelines to avoid "identical modifiers" error.

interface AgentViewProps {
  agent: AgentConfig;
  onBack: () => void;
  sessions: ChatSession[];
  onSaveSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  instagramProfiles?: InstagramProfile[];
  onSaveIGProfile?: (profile: InstagramProfile) => void;
  onDeleteIGProfile?: (profileId: string) => void;
  onSaveShotList?: (list: ShotList) => void; 
  brandKits?: BrandKit[];
  onSaveBrandKit?: (kit: BrandKit) => void;
  onDeleteBrandKit?: (id: string) => void;
  navigationContext?: { prompt: string } | null;
  onNavigateToAgent?: (id: AgentId, prompt: string) => void;
  clients?: Client[];
  studioProfile?: StudioProfile;
}

// Brand Kit Form Modal
const BrandKitModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (kit: BrandKit) => void; existingKits: BrandKit[]; onDelete: (id: string) => void }> = ({ isOpen, onClose, onSave, existingKits, onDelete }) => {
    const [name, setName] = useState('');
    const [tone, setTone] = useState<'Formal' | 'Criativo'>('Formal');
    const [color, setColor] = useState('#4f46e5'); // Default indigo
    const [logo, setLogo] = useState<string | null>(null);
    const [footerText, setFooterText] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (!name || !footerText) return;
        onSave({
            id: editId || crypto.randomUUID(),
            name,
            tone,
            color,
            logo: logo || undefined,
            footerText,
            createdAt: Date.now()
        });
        resetForm();
    };

    const loadKit = (kit: BrandKit) => {
        setName(kit.name);
        setTone(kit.tone);
        setColor(kit.color);
        setLogo(kit.logo || null);
        setFooterText(kit.footerText);
        setEditId(kit.id);
    };

    const resetForm = () => {
        setName('');
        setTone('Formal');
        setColor('#4f46e5');
        setLogo(null);
        setFooterText('');
        setEditId(null);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-500" /> 
                        Gerenciar Brand Kits
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full"><X className="w-5 h-5 text-zinc-500" /></button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="space-y-5">
                        <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider border-b border-zinc-800 pb-2">{editId ? 'Editar Marca' : 'Nova Marca'}</h3>
                        
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 font-bold">Nome da Marca</label>
                            <input type="text" placeholder="Nome da Empresa/Projeto" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl" />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 font-bold">Tom de Voz</label>
                            <div className="flex gap-2">
                                {(['Formal', 'Criativo'] as const).map(t => (
                                    <button key={t} onClick={() => setTone(t)} className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold border transition-all ${tone === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-transparent text-zinc-500 border-zinc-700 hover:bg-zinc-800'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone Preview Mockup */}
                        <div className={`p-3 border rounded-xl transition-all duration-500 ${tone === 'Formal' ? 'bg-stone-50 border-stone-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2 text-center">Preview do Estilo</p>
                            {tone === 'Formal' ? (
                                <div className="bg-white p-3 shadow-sm border border-stone-200 max-w-[200px] mx-auto min-h-[80px] flex flex-col gap-2">
                                    <div className="h-1 w-full bg-stone-900" style={{ backgroundColor: color }}></div>
                                    <div className="space-y-1">
                                        <div className="h-2 w-3/4 bg-stone-300 rounded-sm"></div>
                                        <div className="h-2 w-1/2 bg-stone-200 rounded-sm"></div>
                                    </div>
                                    <p className="text-[8px] font-serif text-stone-600 mt-auto leading-tight">"Apresentamos a proposta formal com seriedade."</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg shadow-indigo-500/10 border border-zinc-100 p-3 max-w-[200px] mx-auto min-h-[80px] flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: color }}></div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-4 h-4 rounded-full bg-zinc-100"></div>
                                        <div className="h-2 w-16 bg-zinc-100 rounded-full"></div>
                                    </div>
                                    <p className="text-[8px] font-sans font-bold text-zinc-500 mt-auto">🚀 "Olha que proposta incrível pra você!"</p>
                                </div>
                            )}
                        </div>

                        {/* Logo Upload Section */}
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 font-bold flex justify-between">Logotipo (Opcional) <span className="font-normal opacity-50">PNG/JPG</span></label>
                            <div 
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-full p-3 border-2 border-dashed border-zinc-800 rounded-xl hover:border-indigo-500 hover:bg-zinc-800/50 transition-all cursor-pointer flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                {logo ? (
                                    <>
                                        <img src={logo} alt="Logo Preview" className="h-8 w-auto object-contain z-10" />
                                        <div className="text-xs text-zinc-500 font-medium z-10">Trocar Logo</div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:text-indigo-500 transition-colors">
                                            <Upload className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <span className="text-sm text-zinc-500 group-hover:text-zinc-300">Carregar imagem</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 font-bold">Cor Primária (Hex)</label>
                            <div className="flex gap-2">
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0 shadow-sm" />
                                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 p-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-sm uppercase" />
                            </div>
                        </div>

                        <textarea placeholder="Texto de Rodapé (Endereço, CNPJ, Site...)" value={footerText} onChange={e => setFooterText(e.target.value)} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl h-20 resize-none text-sm" />

                        <div className="flex gap-2 pt-2">
                            {editId && <button onClick={resetForm} className="px-4 py-2 text-zinc-500 font-bold text-sm">Cancelar</button>}
                            <button onClick={handleSubmit} disabled={!name || !footerText} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg transition-all">
                                {editId ? 'Atualizar Marca' : 'Salvar Marca'}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-6">
                        <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">Marcas Salvas</h3>
                        {existingKits.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Palette className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                                <p className="text-sm text-zinc-400 italic">Nenhum kit cadastrado.</p>
                            </div>
                        ) : (
                            existingKits.map(kit => (
                                <div key={kit.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex justify-between items-center group hover:border-indigo-300 transition-all">
                                    <div className="cursor-pointer flex-1" onClick={() => loadKit(kit)}>
                                        <div className="flex items-center gap-3 mb-1">
                                            {kit.logo ? (
                                                <img src={kit.logo} alt="Logo" className="w-6 h-6 object-contain rounded-sm" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white uppercase" style={{ backgroundColor: kit.color }}>{kit.name.substring(0, 1)}</div>
                                            )}
                                            <span className="font-bold text-white truncate">{kit.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{kit.tone}</span>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: kit.color }}></div>
                                        </div>
                                    </div>
                                    <button onClick={() => { if(confirm('Excluir?')) onDelete(kit.id) }} className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-900/20 rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// IG Quiz Component
const InstagramQuiz: React.FC<{ onFinish: (p: InstagramProfile) => void, onCancel: () => void }> = ({ onFinish, onCancel }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        name: '', niche: '', audience: '', tone: '', goal: '', hashtags: ''
    });

    const questions = [
        { label: "Qual o nome do perfil/cliente?", field: 'name', placeholder: "Ex: @creatorflow_ai", type: 'text' },
        { label: "Qual o nicho de atuação?", field: 'niche', placeholder: "Ex: Marketing, Gastronomia, Moda...", type: 'text' },
        { label: "Quem é o público-alvo ideal?", field: 'audience', placeholder: "Ex: Mulheres 25-40 anos interessadas em...", type: 'textarea' },
        { label: "Qual o tom de voz do perfil?", field: 'tone', placeholder: "Ex: Inspirador, Engraçado, Sarcástico, Sério...", type: 'text' },
        { label: "Qual o objetivo principal das postagens?", field: 'goal', placeholder: "Ex: Vender cursos, Gerar engajamento, Autoridade...", type: 'text' },
        { label: "Alguma hashtag ou palavra-chave fixa?", field: 'hashtags', placeholder: "Ex: #vibe #marketingdigital...", type: 'text' },
    ];

    const isCurrentStepValid = data[questions[step].field as keyof typeof data].length > 2;

    const handleNext = () => {
        if (step < questions.length - 1) setStep(step + 1);
        else onFinish({ ...data, id: crypto.randomUUID(), createdAt: Date.now() } as InstagramProfile);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 h-full animate-in fade-in duration-300">
            <div className="w-full max-w-lg">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-500"/></button>
                    <div className="flex gap-1">
                        {questions.map((_, i) => (
                            <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= step ? 'bg-indigo-600' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col gap-2">
                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Passo {step + 1} de {questions.length}</span>
                        <h2 className="text-2xl font-bold text-white leading-tight">{questions[step].label}</h2>
                    </div>

                    {questions[step].type === 'textarea' ? (
                        <textarea
                            autoFocus
                            value={data[questions[step].field as keyof typeof data]}
                            onChange={(e) => setData({ ...data, [questions[step].field]: e.target.value })}
                            placeholder={questions[step].placeholder}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-600 h-32 resize-none text-lg"
                        />
                    ) : (
                        <input
                            autoFocus
                            type="text"
                            value={data[questions[step].field as keyof typeof data]}
                            onChange={(e) => setData({ ...data, [questions[step].field]: e.target.value })}
                            placeholder={questions[step].placeholder}
                            onKeyDown={(e) => e.key === 'Enter' && isCurrentStepValid && handleNext()}
                            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-600 text-lg"
                        />
                    )}

                    <button
                        onClick={handleNext}
                        disabled={!isCurrentStepValid}
                        className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/20"
                    >
                        {step === questions.length - 1 ? 'Finalizar Configuração' : 'Continuar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeedbackModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: 'good' | 'bad', comment: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState<'good' | 'bad' | null>(null);
    const [comment, setComment] = useState('');
    if (!isOpen) return null;
    const handleSubmit = () => { if (rating) { onSubmit(rating, comment); setRating(null); setComment(''); } };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-zinc-800 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Avaliar Resposta</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setRating('good')} className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${rating === 'good' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'border-zinc-700 hover:border-emerald-800'}`}><ThumbsUp className="w-6 h-6" /><span className="font-medium text-sm">Útil</span></button>
                    <button onClick={() => setRating('bad')} className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${rating === 'bad' ? 'bg-rose-900/20 border-rose-500 text-rose-400' : 'border-zinc-700 hover:border-rose-800'}`}><ThumbsDown className="w-6 h-6" /><span className="font-medium text-sm">Ruim</span></button>
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Algum detalhe?" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm mb-6 h-24 text-white" />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-zinc-400 text-sm font-medium">Cancelar</button>
                    <button onClick={handleSubmit} disabled={!rating} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Enviar Feedback</button>
                </div>
            </div>
        </div>
    );
};

const PresetCard: React.FC<{ preset: StylePreset; onClick: () => void }> = ({ preset, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => { if (preset.audioUrl) { audioRef.current = new Audio(preset.audioUrl); audioRef.current.volume = 0.5; } return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } } }, [preset.audioUrl]);
    const handleMouseEnter = () => { setIsHovered(true); if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); } };
    const handleMouseLeave = () => { setIsHovered(false); if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } };
    const displayImage = (isHovered && preset.gifUrl) ? preset.gifUrl : preset.thumbnail;
    return (
        <button onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="flex flex-col text-left bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
            {displayImage && (<div className="w-full h-32 bg-zinc-800 overflow-hidden relative"><img src={displayImage} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>{preset.audioUrl && (<div className={`absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}><Volume2 className="w-4 h-4" /></div>)}</div>)}
            <div className="p-4"><span className="font-semibold text-zinc-200 group-hover:text-indigo-600 transition-colors leading-tight">{preset.title}</span><p className="text-xs text-zinc-400 line-clamp-2">{preset.description}</p></div>
        </button>
    );
};

const DetailView: React.FC<{ preset: StylePreset; onBack: () => void; agentId: AgentId }> = ({ preset, onBack, agentId }) => {
    if (!preset.details) return null;
    const isShortcuts = agentId === AgentId.EDITING_SHORTCUTS;
    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-y-auto animate-in fade-in duration-300">
            <div className="relative w-full h-64 md:h-80 flex-shrink-0"><img src={preset.thumbnail} alt={preset.title} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"></div><button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-md text-white"><ArrowLeft className="w-6 h-6" /></button><div className="absolute bottom-6 left-6 md:left-10"><h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{preset.title}</h1><p className="text-zinc-200 text-lg md:text-xl max-w-2xl">{preset.description}</p></div></div>
            <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-10"><section><h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">{isShortcuts ? <CheckCircle2 className="w-5 h-5"/> : <Lightbulb className="w-5 h-5"/>} {isShortcuts ? "Foco do Software" : "Quando Usar"}</h2><p className="text-zinc-300 leading-relaxed text-lg">{preset.details.usage}</p></section><div className="h-px bg-zinc-800 w-full" /><section><h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Keyboard className="w-5 h-5 text-zinc-500"/> {isShortcuts ? "Atalhos Essenciais" : "Passo a Passo"}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{preset.details.steps.map((step, idx) => { const parts = step.split(':'); return (<div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">{isShortcuts ? (<><span className="text-zinc-300 font-medium">{parts[0]}</span>{parts[1] && (<span className="px-3 py-1 bg-zinc-800 rounded-lg font-mono text-sm font-bold text-indigo-600 border border-zinc-700 shadow-sm">{parts[1].trim()}</span>)}</>) : (<div className="flex gap-4"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mt-0.5">{idx + 1}</span><p className="text-zinc-300 leading-relaxed">{step}</p></div>)}</div>);})}</div></section></div>
        </div>
    );
};

const AgentView: React.FC<AgentViewProps> = ({ agent, onBack, sessions, onSaveSession, onDeleteSession, instagramProfiles = [], onSaveIGProfile, onDeleteIGProfile, onSaveShotList, brandKits = [], onSaveBrandKit, onDeleteBrandKit, navigationContext, onNavigateToAgent, clients = [], studioProfile }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState<LimitReachedData | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingPreset, setViewingPreset] = useState<StylePreset | null>(null); 
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Equipment-aware script generation toggle
  const [useEquipment, setUseEquipment] = useState(false);

  // Brand Kit State
  const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>(null);
  const [isBrandKitModalOpen, setIsBrandKitModalOpen] = useState(false);
  
  const activeBrandKit = activeBrandKitId ? brandKits.find(k => k.id === activeBrandKitId) : null;

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeProfile, setActiveProfile] = useState<InstagramProfile | null>(null);
  
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeFeedbackMessageIndex, setActiveFeedbackMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProAgent = agent.id === AgentId.STORYBOARD_GENERATOR || agent.id === AgentId.IMAGE_GENERATOR;
  const isBudgetAgent = agent.id === AgentId.BUDGET_SHEET;

  // Detect agent switch and reset internal state (without remounting)
  const prevAgentIdRef = useRef(agent.id);
  useEffect(() => {
    if (prevAgentIdRef.current !== agent.id) {
      prevAgentIdRef.current = agent.id;
      setCurrentSessionId(null);
      setLoading(false);
      setSelectedImage(null);
      setInput('');
      const initial: Message[] = [];
      if (agent.initialMessage && agent.id !== AgentId.INSTAGRAM_CAPTIONS) {
        initial.push({ role: 'model', text: agent.initialMessage, timestamp: Date.now() });
      }
      setMessages(initial);
    }
  }, [agent.id, agent.initialMessage]);

  useEffect(() => {
    if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session) {
            setMessages(session.messages);
            if (session.profileId) {
                const profile = instagramProfiles.find(p => p.id === session.profileId);
                if (profile) setActiveProfile(profile);
            }
            if (session.brandKitId) {
                setActiveBrandKitId(session.brandKitId);
            }
        }
    } else if (prevAgentIdRef.current === agent.id) {
        const initial: Message[] = [];
        if (agent.initialMessage && agent.id !== AgentId.INSTAGRAM_CAPTIONS) {
            initial.push({ role: 'model', text: agent.initialMessage, timestamp: Date.now() });
        }
        setMessages(initial);
    }
  }, [currentSessionId, sessions, agent.initialMessage, agent.id, instagramProfiles]);

  useEffect(() => { if (!viewingPreset) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, transcribing, selectedImage, viewingPreset]);
  useEffect(() => { if (!isQuizMode && !activeProfile && agent.id !== AgentId.INSTAGRAM_CAPTIONS) inputRef.current?.focus(); }, [isQuizMode, activeProfile, agent.id]);

  // Handle cross-agent prompt transfer
  const processedNavRef = useRef<string | null>(null);
  useEffect(() => {
    if (navigationContext?.prompt && processedNavRef.current !== navigationContext.prompt) {
        processedNavRef.current = navigationContext.prompt;
        setCurrentSessionId(null);
        // Small delay to let agent-change state reset complete
        setTimeout(() => doSendMessage(navigationContext.prompt), 50);
    }
  }, [navigationContext]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Audio Recording Logic (Speech-to-Text)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setTranscribing(true);
          try {
            const transcribedText = await transcribeAudio(base64Audio);
            if (transcribedText) {
                setInput(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
                if (inputRef.current) {
                    setTimeout(() => {
                        inputRef.current!.style.height = 'auto';
                        inputRef.current!.style.height = `${inputRef.current!.scrollHeight}px`;
                    }, 0);
                }
            }
          } catch (err) {
            console.error("Erro na transcrição automática:", err);
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleProfileSelect = (profile: InstagramProfile) => {
      setActiveProfile(profile);
      startNewSession(profile);
  };

  const startNewSession = (profile?: InstagramProfile) => {
      setCurrentSessionId(null);
      const initial: Message[] = [];
      const msg = profile 
        ? `Olá! Estou pronto para criar legendas para o perfil **${profile.name}**. Me mande uma imagem do post ou descreva o conteúdo que vamos postar!`
        : (agent.initialMessage || '');
      
      if (msg) initial.push({ role: 'model', text: msg, timestamp: Date.now() });
      setMessages(initial);
      setShowHistory(false);
      if (profile) setActiveProfile(profile);
  };

  const loadSession = (sessionId: string) => {
      setCurrentSessionId(sessionId);
      setShowHistory(false);
  };

  const handlePrint = () => {
      setTimeout(() => {
          window.print();
      }, 100);
  };

  const doSendMessage = async (text: string, img: string | null = null, audio: string | null = null) => {
    if (isProAgent && typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    const userMsg: Message = { 
        role: 'user', 
        text: text || (audio ? "🎤 Áudio enviado" : ""), 
        image: img || undefined, 
        audio: audio || undefined,
        timestamp: Date.now() 
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    let activeSessionId = currentSessionId;
    let sessionTitle = 'Nova Conversa';

    if (!activeSessionId) {
        activeSessionId = crypto.randomUUID();
        setCurrentSessionId(activeSessionId);
        sessionTitle = text ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : "Conversa por Áudio";
    } else {
        const existingSession = sessions.find(s => s.id === activeSessionId);
        if (existingSession) sessionTitle = existingSession.title;
    }

    onSaveSession({
        id: activeSessionId,
        agentId: agent.id,
        profileId: activeProfile?.id,
        brandKitId: activeBrandKitId || undefined,
        title: sessionTitle,
        messages: newMessages,
        createdAt: Date.now(),
        lastUpdated: Date.now()
    });

    setInput('');
    setSelectedImage(null);
    setLoading(true);
    setIsInputExpanded(false);

    try {
      let customInstruction = agent.systemInstruction;
      if (activeProfile) {
          customInstruction = `${agent.systemInstruction}\n\nCONTEXTO DO CLIENTE ATUAL:
          - Nome do Perfil: ${activeProfile.name}
          - Nicho: ${activeProfile.niche}
          - Público-Alvo: ${activeProfile.audience}
          - Tom de Voz: ${activeProfile.tone}
          - Objetivo Principal: ${activeProfile.goal}
          - Hashtags/Keywords: ${activeProfile.hashtags}`;
      }

      if (agent.id === AgentId.SCRIPT_GENERATOR && useEquipment && studioProfile) {
          const eq = studioProfile.equipment;
          const lines: string[] = [];
          if (eq.cameras?.length)  lines.push(`- Câmeras: ${eq.cameras.join(', ')}`);
          if (eq.lenses?.length)   lines.push(`- Lentes: ${eq.lenses.join(', ')}`);
          if (eq.audio?.length)    lines.push(`- Áudio: ${eq.audio.join(', ')}`);
          if (eq.lighting?.length) lines.push(`- Iluminação: ${eq.lighting.join(', ')}`);
          if (eq.others?.length)   lines.push(`- Outros: ${eq.others.join(', ')}`);
          if (lines.length > 0) {
              customInstruction = `${customInstruction}\n\n⚠️ ATENÇÃO — LIMITAÇÕES TÉCNICAS DO USUÁRIO:\nO inventário atual do criador é:\n${lines.join('\n')}\nVocê DEVE adaptar TODAS as sugestões de gravação, iluminação, ângulos de câmera e complexidade das cenas EXCLUSIVAMENTE para o que é possível realizar com este equipamento. Se ele não tem drone, NÃO sugira cenas aéreas. Se não tem iluminação artificial, sugira luz natural. Se usa celular, adapte para ângulos simples e montagem leve. Mantenha as cenas realizáveis dentro deste kit.`;
          }
      }

      if (isBudgetAgent && activeBrandKit) {
          customInstruction = `${agent.systemInstruction}\n\n⚠️ USER SELECTED BRAND KIT CONTEXT:
          - Company Name: ${activeBrandKit.name}
          - Tone of Voice: ${activeBrandKit.tone} (Adapt the text style accordingly)
          - Footer Text (Required in output): ${activeBrandKit.footerText}
          - Primary Color: ${activeBrandKit.color}`;
      }

      const { text: responseText, generatedImage, limitReached: limitData } = await sendMessageToAgent(
        agent.id, userMsg.text, userMsg.image || null, newMessages, customInstruction, audio, imageSize
      );

      // Handle plan limit reached
      if (limitData) {
          setLimitReached(limitData);
          // Remove the user message since it wasn't processed
          setMessages(messages);
          setLoading(false);
          return;
      }

      // Tratar erro de Key se retornado pelo serviço
      if (responseText.includes("ERRO_KEY")) {
          alert("Por favor, selecione uma API Key com faturamento ativo para usar este recurso de IA de imagem avançada.");
          if (typeof (window as any).aistudio?.openSelectKey === 'function') {
            await (window as any).aistudio.openSelectKey();
          }
          setLoading(false);
          return;
      }

      const aiMsg: Message = { role: 'model', text: responseText, image: generatedImage, timestamp: Date.now() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      onSaveSession({
        id: activeSessionId, agentId: agent.id, profileId: activeProfile?.id, brandKitId: activeBrandKitId || undefined, title: sessionTitle, messages: finalMessages, createdAt: Date.now(), lastUpdated: Date.now()
      });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSend = () => { if ((!input.trim() && !selectedImage) || loading) return; doSendMessage(input, selectedImage); };

  const copyToClipboard = (text: string, msgIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgIdx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTransferToStoryboard = (text: string) => {
    localStorage.setItem('pendingStoryboardScript', text);
    if (onNavigateToAgent) {
        onNavigateToAgent(AgentId.STORYBOARD_GENERATOR, `Aqui está meu roteiro para transformar em Storyboard cinematográfico 9:16:\n\n${text}`);
    }
  };

  const handleImportToShotList = (text: string) => {
      if (!onSaveShotList) return;
      
      const lines = text.split('\n');
      const tableLines = lines.filter(l => l.trim().startsWith('|') && !l.includes('---'));
      
      if (tableLines.length < 2) {
          alert("Nenhuma tabela de roteiro/shotlist encontrada no texto para importar.");
          return;
      }

      // Skip the header and map to items
      const items: ShotItem[] = tableLines.slice(1).map(line => {
          const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
          return {
              id: crypto.randomUUID(),
              scene: cells[0] || 'Shot',
              description: cells[1] || cells[2] || '',
              isCompleted: false
          };
      });

      const newList: ShotList = {
          id: crypto.randomUUID(),
          title: `Importado de ${agent.title} (${new Date().toLocaleDateString()})`,
          items: items,
          createdAt: Date.now()
      };

      onSaveShotList(newList);
      if (onNavigateToAgent) onNavigateToAgent(AgentId.SHOT_LIST, "");
  };

  // ── Vincular roteiro a cliente ──────────────────────────────────────────
  const [linkTarget,    setLinkTarget]    = useState<{ idx: number; text: string } | null>(null);
  const [linkClientId,  setLinkClientId]  = useState('');
  const [linkToast,     setLinkToast]     = useState<string | null>(null);

  const handleLinkToClient = () => {
    if (!linkTarget || !linkClientId) return;
    const text = linkTarget.text;

    // Parse markdown table into scenes
    const tableLines = text.split('\n').filter(l => l.trim().startsWith('|') && !l.includes('---'));
    const scenes = tableLines.slice(1).map((line, i) => {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      return {
        id: Date.now().toString(36) + i + Math.random().toString(36).slice(2),
        visual:    cells[1] || '',
        audio:     cells[2] || cells[1] || '',
        isChecked: false,
      };
    });

    // Try to extract a title from the first non-table, non-empty line
    const titleLine = text.split('\n').find(l => !l.trim().startsWith('|') && l.trim().length > 5);
    const title = titleLine?.replace(/^#+\s*/, '').trim()
      || `Roteiro — ${new Date().toLocaleDateString('pt-BR')}`;
    const gancho = scenes.length > 0 ? scenes[0].audio : '';

    const newScript = {
      id:            Date.now().toString(36) + Math.random().toString(36).slice(2),
      title,
      status:        'Rascunho',
      referenceLink: '',
      gancho,
      scenes,
      createdAt:     Date.now(),
    };

    // Save script to client's roteiros via API
    (async () => {
      try {
        const existing = await fetchClientData<{ id: string; title: string; scripts: typeof newScript[]; createdAt: number }[]>(linkClientId, 'roteiros');
        const pkgs = Array.isArray(existing) ? existing : [];

        const globalPkgIdx = pkgs.findIndex(p => p.title === 'Gerado Globalmente');
        if (globalPkgIdx >= 0) {
          pkgs[globalPkgIdx] = { ...pkgs[globalPkgIdx], scripts: [newScript, ...pkgs[globalPkgIdx].scripts] };
        } else {
          pkgs.unshift({
            id:        Date.now().toString(36) + Math.random().toString(36).slice(2),
            title:     'Gerado Globalmente',
            scripts:   [newScript],
            createdAt: Date.now(),
          });
        }
        await saveClientData(linkClientId, 'roteiros', pkgs);
      } catch { /* ignore */ }
    })();

    const clientName = clients.find(c => c.id === linkClientId)?.brandName || 'Cliente';
    setLinkToast(`✅ Roteiro enviado para a Sala de Roteiros de ${clientName}!`);
    setLinkTarget(null);
    setLinkClientId('');
    setTimeout(() => setLinkToast(null), 4000);
  };

  // --- NEW: INTERCEPT EDITING SHORTCUTS VIEW ---
  if (agent.id === AgentId.EDITING_SHORTCUTS) {
      return <EditingKnowledgeHub onBack={onBack} />;
  }

  // --- NEW: INTERCEPT EDITING TECHNIQUES VIEW ---
  if (agent.id === AgentId.EDITING_TECHNIQUES) {
      return <EditingTechniquesGallery onBack={onBack} />;
  }

  // --- NEW: INTERCEPT LIGHTING STYLES VIEW ---
  if (agent.id === AgentId.LIGHTING_STYLES) {
      return <LightingEducationHub onBack={onBack} />;
  }

  // --- NEW: INTERCEPT SFX LIBRARY VIEW ---
  if (agent.id === AgentId.SFX_LIBRARY) {
      return <CreatorStockView onBack={onBack} />;
  }

  // --- NEW: INTERCEPT BUDGET SHEET (PROPOSAL WIZARD) ---
  if (isBudgetAgent) {
      return <ProposalWizard onBack={onBack} />;
  }

  if (viewingPreset) return <DetailView preset={viewingPreset} onBack={() => setViewingPreset(null)} agentId={agent.id} />;
  
  if (isQuizMode && onSaveIGProfile) {
      return <InstagramQuiz onCancel={() => setIsQuizMode(false)} onFinish={(p) => { onSaveIGProfile(p); setIsQuizMode(false); setActiveProfile(p); startNewSession(p); }} />;
  }

  if (agent.id === AgentId.INSTAGRAM_CAPTIONS && !activeProfile) {
      return (
          <div className="flex flex-col h-full bg-zinc-950 animate-in fade-in duration-300">
              {/* Instagram Profile Selection UI (kept as is) */}
              <header className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 shadow-sm">
                  <div className="flex items-center gap-4">
                      <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                      <div>
                          <h1 className="text-xl font-bold text-white">Seus Perfis do Instagram</h1>
                          <p className="text-sm text-zinc-500">Selecione um cliente para começar</p>
                      </div>
                  </div>
              </header>
              <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <button 
                        onClick={() => setIsQuizMode(true)}
                        className="flex flex-col items-center justify-center p-8 bg-dashed bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-3xl hover:border-indigo-400 group transition-all"
                      >
                          <div className="p-4 rounded-2xl bg-indigo-900/30 text-indigo-600 mb-4 group-hover:scale-110 transition-transform"><UserPlus className="w-8 h-8"/></div>
                          <h3 className="font-bold text-white">Novo Perfil</h3>
                          <p className="text-xs text-zinc-500 text-center mt-2">Configure o nicho e público do seu cliente</p>
                      </button>

                      {instagramProfiles.map(p => (
                          <div key={p.id} className="relative group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all">
                              <button onClick={() => handleProfileSelect(p)} className="flex flex-col w-full text-left">
                                  <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 w-fit mb-4"><UserCircle className="w-8 h-8"/></div>
                                  <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                                  <p className="text-xs text-zinc-500 uppercase tracking-tighter mb-4">{p.niche}</p>
                                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                                      Abrir Painel <ChevronRight className="w-4 h-4"/>
                                  </div>
                              </button>
                              <button 
                                onClick={() => { if(confirm("Excluir perfil?")) onDeleteIGProfile?.(p.id) }}
                                className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                  <Trash2 className="w-4 h-4"/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  const Icon = agent.icon;
  const recentSessions = sessions.filter(s => !activeProfile || s.profileId === activeProfile.id).slice(0, 3);

  return (
    <div className={`flex flex-col bg-zinc-950 transition-colors duration-300 relative overflow-hidden ${isFocusMode ? 'fixed inset-0 z-[70] h-screen' : 'min-h-screen h-full'}`}>
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onSubmit={(r, c) => { if (activeFeedbackMessageIndex !== null && currentSessionId) { const updated = [...messages]; updated[activeFeedbackMessageIndex] = { ...updated[activeFeedbackMessageIndex], feedback: { rating: r, comment: c, timestamp: Date.now() } }; setMessages(updated); onSaveSession({ ...sessions.find(s => s.id === currentSessionId)!, messages: updated, lastUpdated: Date.now() }); setIsFeedbackModalOpen(false); } }} />
      {onSaveBrandKit && onDeleteBrandKit && brandKits && (
          <BrandKitModal 
            isOpen={isBrandKitModalOpen} 
            onClose={() => setIsBrandKitModalOpen(false)} 
            onSave={onSaveBrandKit}
            onDelete={onDeleteBrandKit}
            existingKits={brandKits}
          />
      )}
      {/* Limit Reached Banner */}
      {limitReached && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-zinc-800">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Zap className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Limite atingido</h3>
              <p className="text-sm text-zinc-400">{limitReached.message}</p>
            </div>
            <div className="mb-6 rounded-xl bg-zinc-800 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-500">Usado</span>
                <span className="font-bold text-white">{limitReached.used.toLocaleString('pt-BR')} / {limitReached.limit.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLimitReached(null)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Fechar
              </button>
              <a
                href={limitReached.upgradeUrl}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white text-center hover:opacity-90 transition-opacity"
              >
                Fazer Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,rgba(120,120,120,0.4)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>
      
      {/* Sidebar Histórico */}
      {showHistory && (<div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div><div className="relative w-4/5 max-w-xs h-full bg-zinc-900 border-r border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 print:hidden"><div className="p-4 border-b border-zinc-800 flex items-center justify-between"><h2 className="font-bold text-white">Histórico</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X className="w-5 h-5 text-zinc-500" /></button></div><div className="p-4"><button onClick={() => startNewSession(activeProfile || undefined)} className="w-full flex items-center gap-3 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"><Plus className="w-5 h-5" /><span className="font-medium">Nova Conversa</span></button></div><div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">{sessions.filter(s => !activeProfile || s.profileId === activeProfile.id).length === 0 ? (<p className="text-center text-zinc-400 text-sm mt-4">Vazio.</p>) : (sessions.filter(s => !activeProfile || s.profileId === activeProfile.id).map(session => (<div key={session.id} onClick={() => loadSession(session.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${currentSessionId === session.id ? 'bg-zinc-800 border-zinc-300' : 'hover:bg-zinc-800/50 border-transparent'}`}><div className="flex items-center gap-3 overflow-hidden"><MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-indigo-500' : 'text-zinc-400'}`} /><div className="flex flex-col min-w-0"><span className="text-sm font-medium truncate">{session.title}</span><span className="text-xs text-zinc-400">{new Date(session.lastUpdated).toLocaleDateString()}</span></div></div><button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir?")) { onDeleteSession(session.id); if (currentSessionId === session.id) startNewSession(activeProfile || undefined); } }} className="p-1.5 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button></div>)))}</div></div></div>)}

      <header className="flex flex-col md:flex-row md:items-center justify-between px-4 py-4 border-b border-zinc-800/70 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-10 print:hidden shadow-sm">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <button onClick={activeProfile ? () => setActiveProfile(null) : onBack} className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-800 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div className={`p-2 rounded-lg bg-zinc-800/50 ${agent.color}`}><Icon className="w-6 h-6" /></div>
          <div>
            <h1 className="font-bold text-lg leading-none text-white">{activeProfile ? activeProfile.name : agent.title}</h1>
            <p className="text-xs text-zinc-500 mt-1">{activeProfile ? 'Agente de Captions Ativo' : (currentSessionId ? 'Conversa Ativa' : 'Nova Conversa')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isFocusMode && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 text-[10px] font-black uppercase tracking-tighter">
                    Modo Foco
                </div>
            )}
            {/* Brand Kit Selector for Budget Agent */}
            {isBudgetAgent && (
                <div className="flex items-center gap-2">
                    <select 
                        value={activeBrandKitId || ''} 
                        onChange={(e) => setActiveBrandKitId(e.target.value === '' ? null : e.target.value)}
                        className="text-xs p-2 rounded-xl bg-zinc-800 border border-zinc-700 focus:ring-2 focus:ring-indigo-500 max-w-[120px]"
                    >
                        <option value="">Sem Marca</option>
                        {brandKits?.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                    <button onClick={() => setIsBrandKitModalOpen(true)} className="p-2 bg-indigo-900/20 text-indigo-400 rounded-xl hover:bg-indigo-900/40" title="Configurar Brand Kit">
                        <Palette className="w-4 h-4" />
                    </button>
                </div>
            )}

            {isProAgent && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-900/20 text-indigo-400 border border-indigo-900/30 text-[10px] font-black uppercase tracking-tighter">
                    <Zap className="w-3 h-3 fill-current" />
                    Nano Banana Pro Active
                </div>
            )}
            <button 
                onClick={() => setIsFocusMode(prev => !prev)} 
                className="flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-xl transition-all border border-transparent hover:border-emerald-900/40"
                title={isFocusMode ? "Sair da tela cheia" : "Modo tela cheia"}
            >
                {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                <span className="text-sm font-bold hidden sm:inline">{isFocusMode ? 'Sair' : 'Tela cheia'}</span>
            </button>
            <button 
                onClick={() => setShowHistory(true)} 
                className="flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-900/40"
            >
                <History className="w-5 h-5" />
                <span className="text-sm font-bold hidden sm:inline">Histórico da Conversa</span>
                <span className="text-sm font-bold sm:hidden">Histórico</span>
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-zinc-700 relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-900/40 via-transparent to-zinc-900/40" />
        <div className="relative max-w-5xl mx-auto w-full space-y-6">
        {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full py-10 max-w-5xl mx-auto w-full">
                <div className="text-zinc-600 opacity-60 mb-8 flex flex-col items-center"><Icon className="w-16 h-16 mb-4 opacity-20" /><p className="text-sm font-medium tracking-wide uppercase">Selecione uma ação ou retome o histórico</p></div>
                
                {/* Seção de Histórico Recente diretamente na Landing Page do Agente */}
                {recentSessions.length > 0 && (
                    <div className="w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Conversas Recentes
                            </h2>
                            <button onClick={() => setShowHistory(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-widest">Ver tudo</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recentSessions.map(session => (
                                <button key={session.id} onClick={() => loadSession(session.id)} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-indigo-500 transition-all text-left shadow-sm group">
                                    <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-indigo-500 transition-colors"><MessageSquare className="w-5 h-5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-zinc-200 truncate">{session.title}</h3>
                                        <p className="text-xs text-zinc-500">{new Date(session.lastUpdated).toLocaleDateString()} • {session.messages.length} mensagens</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Presets */}
                {agent.stylePresets && (
                    <div className="w-full">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Comandos Rápidos
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{agent.stylePresets.map((preset) => (<PresetCard key={preset.id} preset={preset} onClick={() => { if (agent.id === AgentId.LIGHTING_STYLES || agent.id === AgentId.EDITING_SHORTCUTS) setViewingPreset(preset); else doSendMessage(preset.prompt); }} />))}</div>
                    </div>
                )}
            </div>
        ) : (messages.map((msg, idx) => {
          const isScriptTable = msg.role === 'model' && (agent.id === AgentId.SCRIPT_GENERATOR || agent.id === AgentId.STORYBOARD_GENERATOR) && msg.text.includes('|');
          const isProposal = msg.role === 'model' && isBudgetAgent && msg.text.includes('|') && activeBrandKitId;
          const brandColor = isProposal && activeBrandKit ? activeBrandKit.color : undefined;

          return (
          <div key={idx} className={`flex w-full flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 ${isProposal ? 'printable-proposal' : ''}`}>
            <div 
                className={`max-w-[88%] md:max-w-[72%] rounded-3xl p-5 shadow-xl flex flex-col gap-3 relative ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white rounded-tr-none ring-1 ring-white/20' : 'bg-zinc-900/70 border border-zinc-800/80 text-zinc-200 rounded-tl-none backdrop-blur'} ${isProposal ? 'border-t-8' : ''}`}
                style={brandColor ? { borderTopColor: brandColor } : {}}
            >
              {isProposal && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm print:hidden">
                      Proposta: {activeBrandKit?.name}
                  </div>
              )}

              {msg.image && (
                <div className="mb-2 relative group">
                    <img src={msg.image} alt="Media" className="max-w-full h-auto rounded-lg max-h-[600px] object-cover border border-zinc-700 shadow-md" />
                    <button 
                        onClick={() => window.open(msg.image, '_blank')}
                        className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Abrir em tamanho real"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
              )}
              {msg.audio && (
                <div className="mb-2 p-2 bg-zinc-950/20 rounded-lg flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-white/80" />
                  <span className="text-xs font-medium opacity-80 uppercase tracking-widest">Áudio transcrito</span>
                </div>
              )}
              {msg.role === 'model' ? (<MarkdownRenderer content={msg.text} />) : (<p className="whitespace-pre-wrap">{msg.text}</p>)}
              
              {isProposal && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end print:hidden">
                      <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors">
                          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                      </button>
                  </div>
              )}

              {isScriptTable && !isProposal && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleImportToShotList(msg.text)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all group"
                      >
                          <ListChecks className="w-3.5 h-3.5" /> 
                          🚀 Gerar Lista de Gravação
                      </button>
                      <button 
                        onClick={() => copyToClipboard(msg.text, idx)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          copiedId === idx 
                          ? 'bg-emerald-900/20 text-emerald-600 border-emerald-200' 
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                          {copiedId === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === idx ? 'Copiado!' : 'Copiar Roteiro'}
                      </button>
                      {agent.id === AgentId.SCRIPT_GENERATOR && (
                        <>
                          <button
                            onClick={() => handleTransferToStoryboard(msg.text)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all group"
                          >
                              <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                              Transformar em Storyboard
                          </button>
                          {clients.length > 0 && (
                            <button
                              onClick={() => { setLinkTarget({ idx, text: msg.text }); setLinkClientId(''); }}
                              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all"
                            >
                              <FolderInput className="w-3.5 h-3.5" /> 👤 Vincular a Cliente
                            </button>
                          )}
                        </>
                      )}
                  </div>
              )}
            </div>
            {msg.role === 'model' && (
              <div className="mt-2 flex items-center gap-2 max-w-[85%] md:max-w-[70%] print:hidden">
                {msg.feedback ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-500">
                    <ThumbsUp className="w-3 h-3 text-emerald-500" />
                    <span>Feedback enviado</span>
                  </div>
                ) : (
                  <button onClick={() => { setActiveFeedbackMessageIndex(idx); setIsFeedbackModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 text-xs font-medium transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Avaliar</span>
                  </button>
                )}
              </div>
            )}
          </div>
          )
        }))}
        {loading && (
            <div className="flex justify-start w-full">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-4 flex flex-col gap-3 max-w-[300px]">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        {isProAgent ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>}
                        <span>{isProAgent ? "Gerando visual 4K..." : "IA pensando..."}</span>
                    </div>
                    {isProAgent && (
                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-[loading_30s_ease-in-out_infinite]" />
                        </div>
                    )}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 z-40 bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150" />
            <div className="relative p-8 bg-white text-indigo-600 rounded-full shadow-2xl">
              <Mic className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ouvindo você...</h2>
          <p className="text-white/70 mb-10">Fale agora e eu transcreverei no seu campo de texto.</p>
          <button onClick={stopRecording} className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"><StopCircle className="w-6 h-6" /> Parar e Transcrever</button>
        </div>
      )}

      {/* Input Area com melhorias de scroll e expansão */}
      <div className={`p-4 border-t border-zinc-800/70 bg-zinc-900/80 backdrop-blur-xl transition-all duration-500 ease-in-out print:hidden ${isInputExpanded ? 'h-[450px]' : 'h-auto'} ${isFocusMode ? 'shadow-2xl' : ''}`}>
        <div className="max-w-5xl mx-auto relative h-full flex flex-col gap-2">
          
          {/* Seletor de Qualidade Nano Banana Pro */}
          {isProAgent && !isInputExpanded && (
            <div className="flex items-center justify-between mb-2 animate-in fade-in slide-in-from-bottom-1 duration-500">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <Monitor className="w-3 h-3" /> Resolução de Saída
                </div>
                <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
                    {(["1K", "2K", "4K"] as const).map(size => (
                        <button 
                            key={size}
                            onClick={() => setImageSize(size)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${imageSize === size ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
          )}

          {agent.id === AgentId.SCRIPT_GENERATOR && !isInputExpanded && (
            <div className="flex items-center justify-between px-1 mb-1 animate-in fade-in duration-300">
              <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="use-equipment-toggle">
                <div
                  id="use-equipment-toggle"
                  role="switch"
                  aria-checked={useEquipment}
                  onClick={() => setUseEquipment(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${useEquipment ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${useEquipment ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-bold transition-colors ${useEquipment ? 'text-indigo-300' : 'text-zinc-500'}`}>
                  Adaptar roteiro para os meus equipamentos
                </span>
              </label>
              {useEquipment && studioProfile && (
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-900/20 border border-indigo-800/40 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                  Kit ativo
                </span>
              )}
              {useEquipment && !studioProfile && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-900/20 border border-amber-800/40 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                  Configure o Estúdio primeiro
                </span>
              )}
            </div>
          )}

          {selectedImage && (<div className="relative w-fit"><img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-zinc-300 shadow-sm" /><button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button></div>)}
          
          {transcribing && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-400 animate-pulse bg-indigo-900/20 rounded-lg w-fit">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>IA Transcrevendo seu áudio...</span>
              </div>
          )}

          <div className={`relative flex-1 flex flex-col gap-2 transition-all duration-300 ${isInputExpanded ? 'h-full' : ''}`}>
            
            {/* Input Wrapper Unificado Flexbox */}
            <div className={`group flex items-end gap-2 w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-2 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm ${isInputExpanded ? 'h-full' : ''}`}>
              
              {/* Botão de Upload */}
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-zinc-400 hover:text-indigo-500 transition-colors rounded-xl hover:bg-zinc-800 flex-shrink-0 mb-0.5" title="Anexar Imagem">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              
              {/* Textarea Transparente */}
              <textarea 
                ref={inputRef} 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isInputExpanded) { e.preventDefault(); handleSend(); } }} 
                placeholder={transcribing ? "Transcrevendo..." : agent.placeholder} 
                disabled={transcribing}
                className={`flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder-zinc-400 resize-none overflow-y-auto py-3 px-2 leading-relaxed ${isInputExpanded ? 'h-full' : 'max-h-[160px]'}`} 
                style={{ minHeight: '48px', height: isInputExpanded ? '100%' : 'auto' }}
                onInput={(e) => { 
                    const target = e.target as HTMLTextAreaElement; 
                    if (!isInputExpanded) {
                        target.style.height = 'auto'; 
                        target.style.height = `${target.scrollHeight}px`; 
                    }
                }} 
              />

              {/* Botões de Ação (Direita) */}
              <div className="flex items-center gap-1 flex-shrink-0 mb-0.5">
                  <button 
                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                    className={`p-2 transition-all rounded-xl ${isInputExpanded ? 'text-indigo-600 bg-indigo-900/30' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-800'}`}
                    title={isInputExpanded ? "Recolher campo" : "Expandir para escrita longa"}
                  >
                    {isInputExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={handleSend} 
                    disabled={(!input.trim() && !selectedImage) || loading || transcribing} 
                    className={`p-2 rounded-xl transition-all ${(!input.trim() && !selectedImage) || loading ? 'bg-zinc-800 text-zinc-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'}`}
                  >
                    {loading ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
                  </button>
              </div>
            </div>
            
            {/* Desktop Mic Button (Mantido fora do wrapper) */}
            <button 
              onClick={startRecording}
              disabled={loading || transcribing}
              className={`p-3.5 rounded-2xl transition-all shadow-lg flex-shrink-0 disabled:opacity-50 absolute -right-16 bottom-1 ${
                isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } hidden md:flex`}
              title="Gravar áudio"
            >
              <Mic className="w-6 h-6" />
            </button>
            
            {/* Mobile Mic Button */}
            <button 
              onClick={startRecording}
              disabled={loading || transcribing}
              className={`p-3 rounded-2xl transition-all shadow-md flex-shrink-0 md:hidden self-end ${
                isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
        {!isInputExpanded && (
            <p className="text-center text-zinc-400 text-[10px] uppercase tracking-widest font-bold mt-3 animate-in fade-in duration-700">
                Pressione <span className="text-indigo-500">SHIFT + ENTER</span> para pular linha ou use o botão de expansão
            </p>
        )}
      </div>
      
      {/* Styles */}
      <style>{`
        @keyframes loading {
            0% { width: 0%; }
            100% { width: 95%; }
        }
        @media print {
            body > *:not(.printable-proposal), 
            body > *:not(.printable-proposal) * {
                visibility: hidden;
            }
            body {
                background: white !important;
                color: black !important;
            }
            .printable-proposal {
                visibility: visible;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 40px !important;
                background: white !important;
                color: black !important;
                border: none !important;
                box-shadow: none !important;
            }
            .printable-proposal * {
                visibility: visible;
                color: black !important;
            }
            /* Reset markdown styles for print */
            table { width: 100% !important; border-collapse: collapse; margin-top: 20px; }
            th { background: #f3f4f6 !important; border-bottom: 2px solid #000 !important; }
            td { border-bottom: 1px solid #ddd !important; }
        }
      `}</style>

      {/* ── Vincular a Cliente modal ── */}
      {linkTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderInput className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-black text-white">Vincular a Cliente</h3>
              </div>
              <button onClick={() => setLinkTarget(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Selecione o cliente para enviar este roteiro à Sala de Roteiros dele.
            </p>
            <select
              value={linkClientId}
              onChange={e => setLinkClientId(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
            >
              <option value="">Selecionar cliente…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.brandName}</option>
              ))}
            </select>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setLinkTarget(null)} className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-black hover:bg-zinc-800 transition-all">
                Cancelar
              </button>
              <button
                onClick={handleLinkToClient}
                disabled={!linkClientId}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar para Sala de Roteiros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast de sucesso ── */}
      {linkToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-2xl text-sm font-bold text-emerald-300 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {linkToast}
        </div>
      )}
    </div>
  );
};

export default AgentView;
