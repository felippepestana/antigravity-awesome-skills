import { GraduationCap, CheckCircle2, ChevronRight, Zap, Target, Terminal, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LearningGuide(): React.ReactElement {
    const phases = [
        {
            id: 'phase-1',
            title: '🟢 Fase 1: Fundamentos',
            goal: 'Entender o que são skills e como invocar seu primeiro especialista.',
            icon: <Zap className="w-8 h-8 text-green-500" />,
            steps: [
                { text: 'Conheça o conceito de "Especialista sob Demanda"', link: '/skill/brainstorming' },
                { text: 'Domine a sintaxe de invocação usando o símbolo @', isStatic: true },
                { text: 'Configure seu ambiente (.agent/skills ou .claude/skills)', isStatic: true },
                { text: 'Pratique com o @brainstorming para planejar uma nova ideia', link: '/skill/brainstorming' }
            ]
        },
        {
            id: 'phase-2',
            title: '🟡 Fase 2: O Canivete Suíço',
            goal: 'Integrar as 5 skills essenciais que todo dev usa diariamente.',
            icon: <Target className="w-8 h-8 text-yellow-500" />,
            steps: [
                { text: 'Use @brainstorming para alinhar expectativas antes de codar', link: '/skill/brainstorming' },
                { text: 'Converta ideias em tarefas com o @concise-planning', link: '/skill/concise-planning' },
                { text: 'Gire planos detalhados com o @writing-plans', link: '/skill/writing-plans' },
                { text: 'Mantenha o código impecável com o @lint-and-validate', link: '/skill/lint-and-validate' },
                { text: 'Investigue erros cientificamente com o @systematic-debugging', link: '/skill/systematic-debugging' }
            ]
        },
        {
            id: 'phase-3',
            title: '🟠 Fase 3: Especialização',
            goal: 'Domine o conjunto de ferramentas específico para sua área.',
            icon: <Layout className="w-8 h-8 text-orange-500" />,
            steps: [
                { text: 'Web: Foque em @react-best-practices e @tailwind-patterns', link: '/skill/react-best-practices' },
                { text: 'Segurança: Estude @api-security-best-practices', link: '/skill/api-security-best-practices' },
                { text: 'Negócios: Domine o @seo-audit e @copywriting', link: '/skill/seo-audit' }
            ]
        },
        {
            id: 'phase-4',
            title: '🔴 Fase 4: Orquestração',
            goal: 'Aprenda a encadear múltiplas skills e usar workflows completos.',
            icon: <Terminal className="w-8 h-8 text-red-500" />,
            steps: [
                { text: 'Pratique o encadeamento de prompts (Plan -> Build)', isStatic: true },
                { text: 'Execute o workflow "ship-saas-mvp" completo', isStatic: true },
                { text: 'Aprenda a dar contexto de arquivos específicos para as skills', isStatic: true }
            ]
        },
        {
            id: 'phase-5',
            title: '🟣 Fase 5: Alquimista de Skills',
            goal: 'Crie suas próprias ferramentas e contribua para a comunidade.',
            icon: <GraduationCap className="w-8 h-8 text-purple-500" />,
            steps: [
                { text: 'Construa sua primeira skill personalizada com o @skill-creator', link: '/skill/skill-creator' },
                { text: 'Estude o Guia Técnico (SKILL_ANATOMY.md)', isStatic: true },
                { text: 'Contribua com o repositório oficial no GitHub', isStatic: true }
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <header className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-sm font-medium">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Trilha de Aprendizado Profissional
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                    Mestrado em Antigravity <span className="text-indigo-600">Skills</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                    Siga este roteiro estruturado para transformar seu assistente de IA em um time completo de especialistas.
                </p>
            </header>

            <div className="space-y-12">
                {phases.map((phase, idx) => (
                    <div key={phase.id} className="relative">
                        {idx !== phases.length - 1 && (
                            <div className="absolute left-10 top-16 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                        )}
                        <div className="flex gap-8">
                            <div className="relative z-10 flex-shrink-0 w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center">
                                {phase.icon}
                            </div>
                            <div className="flex-1 pt-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{phase.title}</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium italic">
                                    "{phase.goal}"
                                </p>
                                <div className="grid gap-4">
                                    {phase.steps.map((step, sIdx) => (
                                        <div key={sIdx} className="group flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            {step.isStatic ? (
                                                <span className="text-slate-700 dark:text-slate-300 font-medium">{step.text}</span>
                                            ) : (
                                                <Link to={step.link!} className="text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center">
                                                    {step.text}
                                                    <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl shadow-indigo-500/20">
                <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
                <p className="text-indigo-100 text-lg mb-8 max-w-xl leading-relaxed">
                    A melhor forma de aprender é na prática. Escolha uma tarefa que você tem pendente hoje e tente resolvê-la usando apenas as skills da Fase 1 e 2.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link to="/" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 shadow-lg transition-all">
                        Explorar Catálogo
                    </Link>
                    <a href="https://github.com/sickn33/antigravity-awesome-skills" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-indigo-500/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-indigo-500/30 transition-all">
                        Ver no GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
