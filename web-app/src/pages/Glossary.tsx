import { useState, useMemo } from 'react';
import { useSkills } from '../context/SkillContext';
import { CATEGORIES } from '../constants';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, AlertCircle, Info, Ban, Lightbulb } from 'lucide-react';

export function Glossary(): React.ReactElement {
    const { skills, loading } = useSkills();
    const [searchTerm, setSearchTerm] = useState('');

    const groupedSkills = useMemo(() => {
        const groups: Record<string, any[]> = {};

        // Initialize groups in order
        CATEGORIES.forEach(cat => {
            groups[cat.id] = [];
        });

        skills.forEach(skill => {
            const cat = skill.category || 'uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(skill);
        });

        // Sort alphabetically within groups and filter out empty groups
        const result: Record<string, any[]> = {};
        CATEGORIES.forEach(cat => {
            if (groups[cat.id] && groups[cat.id].length > 0) {
                result[cat.id] = groups[cat.id].sort((a, b) => a.name.localeCompare(b.name));
            }
        });

        return result;
    }, [skills]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedSkills;

        const term = searchTerm.toLowerCase();
        const result: Record<string, any[]> = {};

        Object.entries(groupedSkills).forEach(([cat, list]) => {
            const filtered = list.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.description.toLowerCase().includes(term)
            );
            if (filtered.length > 0) {
                result[cat] = filtered;
            }
        });

        return result;
    }, [groupedSkills, searchTerm]);

    const totalFiltered = Object.values(filteredGroups).reduce((acc, curr) => acc + curr.length, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative mb-12 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-blue-900/40" />
                    {/* Placeholder for the banner image - we'll try to load the generated one in CSS or img */}
                    <div className="w-full h-full bg-[url('/assets/glossary_banner_1772877348816.png')] bg-cover bg-center opacity-30 grayscale" />
                </div>
                <div className="relative px-8 py-16 md:py-24 flex flex-col items-center text-center">
                    <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                        <Icons.Sparkles className="w-4 h-4 mr-2" />
                        Central de Inteligência Antigravity
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Glossário de Habilidades <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Agentic</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                        Seu guia interativo para dominar as 1000+ capacidades instaladas.
                        Aprenda quando usar, como usar e o que evitar.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link to="/learn" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg transition-all flex items-center">
                            <Icons.GraduationCap className="w-5 h-5 mr-2" />
                            Guia de Aprendizado
                        </Link>
                        <a href="#architecture-planning" className="px-6 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 border border-white/20 transition-all flex items-center">
                            Começar a Explorar
                        </a>
                    </div>

                    <div className="mt-10 w-full max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar especialidade (ex: react, seo, segurança)..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Summary / Sidebar Layout */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Navigation Sidebar (Desktop) */}
                <aside className="lg:w-72 shrink-0 hidden lg:block">
                    <div className="sticky top-24 space-y-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Sumário</h3>
                        {CATEGORIES.map(cat => {
                            if (!filteredGroups[cat.id]) return null;
                            const IconComp = (Icons as any)[cat.icon] || Icons.Book;
                            return (
                                <a
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors group"
                                >
                                    <IconComp className="w-4 h-4 mr-3" />
                                    {cat.name}
                                    <span className="ml-auto text-xs opacity-50 group-hover:opacity-100">
                                        {filteredGroups[cat.id].length}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </aside>

                {/* Categories and Skills List */}
                <div className="flex-1 space-y-16">
                    {totalFiltered === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-xl">Nenhuma habilidade encontrada para sua pesquisa.</p>
                        </div>
                    ) : (
                        CATEGORIES.map(cat => {
                            const skillsInCat = filteredGroups[cat.id];
                            if (!skillsInCat || skillsInCat.length === 0) return null;

                            const IconComp = (Icons as any)[cat.icon] || Icons.Book;

                            return (
                                <section key={cat.id} id={cat.id} className="scroll-mt-24">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`p-3 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400`}>
                                            <IconComp className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{cat.name}</h2>
                                            <p className="text-slate-500 dark:text-slate-400">Explore as ferramentas de {cat.name.toLowerCase()}.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillsInCat.map(skill => (
                                            <Link
                                                to={`/skill/${skill.id}`}
                                                key={skill.id}
                                                className="group relative p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        @{skill.name}
                                                    </h4>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {skill.description}
                                                </p>

                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                                                        {skill.risk === 'safe' ? 'CONFIÁVEL' : 'AVANÇADO'}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Educational Footer Table */}
            <div className="mt-32 p-8 rounded-3xl bg-indigo-900/5 dark:bg-indigo-400/5 border border-indigo-200/50 dark:border-indigo-500/10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                    <Info className="w-6 h-6 mr-3 text-indigo-500" />
                    Guia Rápido de Utilização
                    <Link to="/learn" className="ml-auto text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                        Ver Guia Completo <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-indigo-200 dark:border-indigo-900/50">
                                <th className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Sinal</th>
                                <th className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Significado</th>
                                <th className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Ação Recomendada</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-600 dark:text-slate-400">
                            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white/40 transition-colors">
                                <td className="py-4 px-4"><Lightbulb className="w-5 h-5 text-yellow-500" /></td>
                                <td className="py-4 px-4 font-medium">Habilidade de Planejamento</td>
                                <td className="py-4 px-4">Use no início do chat para definir o rumo.</td>
                            </tr>
                            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white/40 transition-colors">
                                <td className="py-4 px-4"><Icons.Terminal className="w-5 h-5 text-blue-500" /></td>
                                <td className="py-4 px-4 font-medium">Habilidade de Execução</td>
                                <td className="py-4 px-4">Use quando quiser que a IA escreva código ou configure algo.</td>
                            </tr>
                            <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white/40 transition-colors">
                                <td className="py-4 px-4"><Ban className="w-5 h-5 text-red-500" /></td>
                                <td className="py-4 px-4 font-medium">Restrição Ativa</td>
                                <td className="py-4 px-4">Algumas habilidades impedem a IA de codar para focar no design.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
