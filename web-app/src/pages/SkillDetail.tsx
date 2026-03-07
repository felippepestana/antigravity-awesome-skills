import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, AlertTriangle, Loader2,
  Info, Sparkles, Ban, Calendar, Shield, Cpu
} from 'lucide-react';
import { SkillStarButton } from '../components/SkillStarButton';
import { useSkills } from '../context/SkillContext';
import { CATEGORY_MAP } from '../constants';

const Markdown = lazy(() => import('react-markdown'));

interface RouteParams {
  id: string;
  [key: string]: string | undefined;
}

export function SkillDetail(): React.ReactElement {
  const { id } = useParams<RouteParams>();
  const { skills, stars, loading: contextLoading } = useSkills();
  const [content, setContent] = useState('');
  const [contentLoading, setContentLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState('');

  const skill = useMemo(() => skills.find(s => s.id === id), [skills, id]);
  const starCount = useMemo(() => (id ? stars[id] || 0 : 0), [stars, id]);

  useEffect(() => {
    if (contextLoading || !skill) return;

    const loadMarkdown = async () => {
      setContentLoading(true);
      try {
        const cleanPath = skill.path.startsWith('skills/')
          ? skill.path.replace('skills/', '')
          : skill.path;

        const mdRes = await fetch(`/skills/${cleanPath}/SKILL.md`);
        if (!mdRes.ok) throw new Error('Skill file not found');

        const text = await mdRes.text();
        // Remove frontmatter for clean display
        const body = text.replace(/^---\s*\n(.*?)\n---\n*/s, '');
        setContent(body);
      } catch (err) {
        setError('O arquivo de documentação desta habilidade não pôde ser carregado.');
      } finally {
        setContentLoading(false);
      }
    };

    loadMarkdown();
    window.scrollTo(0, 0);
  }, [skill, contextLoading]);

  const copyPrompt = () => {
    if (!skill) return;
    const finalPrompt = customContext.trim()
      ? `Use @${skill.name}\n\nContexto adicional:\n${customContext}`
      : `Use @${skill.name}`;
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (contextLoading || (contentLoading && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
        <p className="text-slate-500 animate-pulse">Carregando conhecimento...</p>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Conhecimento Não Encontrado</h2>
        <p className="text-slate-500 mb-8">{error || 'Habilidade não disponível no momento.'}</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
          <ArrowLeft className="mr-2 h-5 w-5" /> Voltar ao Glossário
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            VOLTAR AO SUMÁRIO
          </Link>
        </div>

        {/* Skill Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 uppercase tracking-widest">
                {CATEGORY_MAP[skill.category] || skill.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-widest flex items-center">
                <Shield className="w-3 h-3 mr-1.5" />
                {skill.risk === 'low' ? 'CONFIÁVEL' : 'AVANÇADO'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  @{skill.name}
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {skill.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <SkillStarButton skillId={skill.id} initialCount={starCount} />
              </div>
            </div>

            {/* Prompt Builder Box */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Construtor de Prompt Interativo</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Quer adicionar detalhes específicos? Digite abaixo e o botão de cópia incluirá seu contexto automaticamente.
              </p>
              <div className="relative">
                <textarea
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] text-slate-900 dark:text-white"
                  placeholder="Ex: 'Utilize React 19, Tailwind e foco em acessibilidade...'"
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                />
                <button
                  onClick={copyPrompt}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'PROMPT COPIADO!' : 'COPIAR PROMPT PARA O CHAT'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Content */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 md:p-12">
          <div className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:font-black prose-h2:text-3xl prose-h2:border-b prose-h2:pb-4 prose-h2:border-slate-100 dark:prose-h2:border-slate-800
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-code:text-indigo-500 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:rounded prose-code:px-1
            ">
            <Suspense fallback={<div className="space-y-4"><div className="h-8 bg-slate-100 rounded w-1/2 animate-pulse" /><div className="h-4 bg-slate-100 rounded w-full animate-pulse" /><div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" /></div>}>
              <Markdown>{content}</Markdown>
            </Suspense>
          </div>
        </div>
      </div>

      {/* Quick Reference Sidebar (Desktop Only) */}
      <aside className="lg:w-80 shrink-0 sticky top-24 space-y-6 hidden lg:block">
        <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
          <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4 text-white">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-black mb-2">Referência de Uso</h4>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            Esta habilidade carrega o conhecimento técnico de um especialista para dentro da sessão de chat.
          </p>
          <div className="space-y-4 text-xs font-bold">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10">
              <Calendar className="w-4 h-4" />
              ADICIONADA EM: {skill.date_added || 'N/A'}
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 uppercase tracking-widest">
              <Cpu className="w-4 h-4" />
              FONTE: {skill.source || 'Curadoria Interna'}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
          <h4 className="text-white font-bold mb-4 flex items-center text-sm uppercase tracking-widest">
            <Ban className="w-4 h-4 mr-2 text-red-500" />
            Restrições
          </h4>
          <ul className="space-y-3 text-xs text-slate-400 leading-normal">
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1 shrink-0" />
              Não utilize se o contexto for simples demais para uma ferramenta dedicada.
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1 shrink-0" />
              Verifique se o risco é compatível com seu ambiente de produção.
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1 shrink-0" />
              Certifique-se de ter permissão para rodar comandos sugeridos pela habilidade.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default SkillDetail;
