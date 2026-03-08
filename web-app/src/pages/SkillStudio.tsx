import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, Copy, AlertTriangle, AlertCircle, FileText, CheckCircle2, Search, Filter, ChevronRight, Zap } from 'lucide-react';
import debounce from 'lodash.debounce';

interface Skill {
    name: string;
    description: string;
    isValid: boolean;
    l1: string;
    l2: string;
    l3: string;
}

interface Taxonomy {
    [layer1: string]: {
        [layer2: string]: string[];
    };
}

export function SkillStudio() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [taxonomy, setTaxonomy] = useState<Taxonomy>({});

    // Estados de Busca e Filtro
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<{ l1: string, l2: string, l3: string }>({ l1: '', l2: '', l3: '' });
    const [smartSuggestion, setSmartSuggestion] = useState<string | null>(null);

    // Estados de Edição
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [originalContent, setOriginalContent] = useState<string>('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
    const [cloneName, setCloneName] = useState('');
    const [showCloneModal, setShowCloneModal] = useState(false);

    const showNotification = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 6000);
    }, []);

    const fetchInitialData = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/skills');
            if (!res.ok) throw new Error('Falha ao conectar ao servidor local da API (Porta 3001).');
            const data = await res.json();
            setSkills(data.skills || []);
            setTaxonomy(data.taxonomy || {});
        } catch (err: any) {
            showNotification('error', err.message);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const executeSearch = useCallback(async (query: string, filters: typeof activeFilters) => {
        try {
            const payload: any = { query };
            const apiFilters: any = {};

            if (filters.l1) apiFilters.l1 = filters.l1;
            if (filters.l2) apiFilters.l2 = filters.l2;
            if (filters.l3) apiFilters.l3 = filters.l3;

            if (Object.keys(apiFilters).length > 0) payload.filters = apiFilters;

            const res = await fetch('http://localhost:3001/api/skills/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Erro na busca.');
            const data = await res.json();
            setSkills(data.skills || []);
        } catch (err: any) {
            console.error(err);
        }
    }, []);

    const debouncedSearch = useMemo(() => debounce(executeSearch, 300), [executeSearch]);

    // Inteligência contextual (UI-side) baseada na busca
    const analyzeUserPattern = useCallback((query: string, f: typeof activeFilters) => {
        const q = query.toLowerCase();
        if (q.includes("erro") || q.includes("debug") || q.includes("fix")) {
            setSmartSuggestion("Parece que você precisa arrumar um problema. Tentar categoria: Segurança > Testes?");
        } else if ((q.includes("aws") || q.includes("azure")) && !f.l1) {
            setSmartSuggestion("Sugestão: Filtrar por DevOps e Nuvem");
        } else if (f.l1 === 'Dados e IA' && !f.l2) {
            setSmartSuggestion("Para IA generativa, refine para 'Inteligência Artificial > LLMs & RAG'");
        } else {
            setSmartSuggestion(null);
        }
    }, []);

    // Monitora interações no input e aciona a busca do backend (que traduz automaticamente)
    useEffect(() => {
        analyzeUserPattern(searchQuery, activeFilters);
        debouncedSearch(searchQuery, activeFilters);
    }, [searchQuery, activeFilters, debouncedSearch, analyzeUserPattern]);

    const handleApplySuggestion = () => {
        if (smartSuggestion?.includes("Testes")) {
            setActiveFilters({ l1: 'Segurança', l2: 'Testes (Pentest)', l3: '' });
        } else if (smartSuggestion?.includes("DevOps")) {
            setActiveFilters({ l1: 'DevOps e Nuvem', l2: '', l3: '' });
        } else if (smartSuggestion?.includes("Inteligência")) {
            setActiveFilters({ l1: 'Dados e IA', l2: 'Inteligência Artificial', l3: 'LLMs & RAG' });
        }
        setSearchQuery('');
    };

    const loadSkillContent = async (name: string) => {
        setNotification(null);
        try {
            const res = await fetch(`http://localhost:3001/api/skills/${name}`);
            if (!res.ok) throw new Error('Não foi possível carregar a skill.');
            const data = await res.json();
            setFileContent(data.content);
            setOriginalContent(data.content);
            setSelectedSkill(name);
        } catch (err: any) {
            showNotification('error', err.message);
        }
    };

    const handleSave = async () => {
        if (!selectedSkill) return;

        if (fileContent !== originalContent && Math.abs(fileContent.length - originalContent.length) > 500) {
            const userWantsToSave = window.confirm(
                "Atenção: Você fez uma alteração muito grande nesta skill. Isso pode alterar o propósito original dela.\n\nDeseja sobrescrever a skill atual (OK) ou cancelar e tentar Clonar a skill em vez disso (Cancelar)?"
            );
            if (!userWantsToSave) return;
        }

        try {
            const res = await fetch(`http://localhost:3001/api/skills/${selectedSkill}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: fileContent })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setOriginalContent(fileContent);
            showNotification('success', data.message);
        } catch (err: any) {
            showNotification('error', err.message);
        }
    };

    const handleClone = async () => {
        if (!selectedSkill || !cloneName.trim()) return;

        try {
            const res = await fetch('http://localhost:3001/api/skills/duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalName: selectedSkill,
                    newName: cloneName.trim().toLowerCase().replace(/\s+/g, '-'),
                    content: fileContent
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showNotification('success', data.message);
            setShowCloneModal(false);
            setCloneName('');
            executeSearch(searchQuery, activeFilters);
        } catch (err: any) {
            showNotification('error', err.message);
        }
    };

    const hasChanges = fileContent !== originalContent;

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">

            {/* Sidebar: Filtros e Busca */}
            <div className="w-[380px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">

                {/* Caixa de Busca Inteligente (PT -> EN automática via Backend) */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            title="Buscar skills"
                            placeholder="Ex: banco de dados, react, security..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>

                    {/* Alerta de Probabilidade e Contexto */}
                    {smartSuggestion && (
                        <div className="flex items-start space-x-2 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={handleApplySuggestion}>
                            <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0 animate-pulse text-amber-500" />
                            <span>{smartSuggestion} <strong className="underline decoration-indigo-300">Aplicar filtro</strong></span>
                        </div>
                    )}

                    {/* Filtros em Camadas (Cascading Selects) */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            <Filter className="w-3 h-3 mr-1" /> Filtros Hierárquicos
                        </div>

                        {/* Camada 1 */}
                        <select
                            title="Filtro Nível 1"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm"
                            value={activeFilters.l1}
                            onChange={e => setActiveFilters({ l1: e.target.value, l2: '', l3: '' })}
                        >
                            <option value="">Nível 1: Geral (Todos)</option>
                            {Object.keys(taxonomy).map(level1 => <option key={level1} value={level1}>{level1}</option>)}
                        </select>

                        {/* Camada 2 (Visível apenas se houver Camada 1 selecionada) */}
                        <div className={`transition-all duration-300 overflow-hidden ${activeFilters.l1 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex ml-2 border-l-2 border-indigo-200 dark:border-indigo-900 pl-2">
                                <select
                                    title="Filtro Nível 2"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300"
                                    value={activeFilters.l2}
                                    onChange={e => setActiveFilters({ ...activeFilters, l2: e.target.value, l3: '' })}
                                >
                                    <option value="">Nível 2: Área (Todas)</option>
                                    {activeFilters.l1 && Object.keys(taxonomy[activeFilters.l1] || {}).map(level2 => (
                                        <option key={level2} value={level2}>{level2}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Camada 3 (Visível apenas se houver Camada 2 selecionada) */}
                        <div className={`transition-all duration-300 overflow-hidden ${activeFilters.l2 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex ml-6 border-l-2 border-indigo-300 dark:border-indigo-700 pl-2">
                                <select
                                    title="Filtro Nível 3"
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200"
                                    value={activeFilters.l3}
                                    onChange={e => setActiveFilters({ ...activeFilters, l3: e.target.value })}
                                >
                                    <option value="">Nível 3: Específico (Todos)</option>
                                    {activeFilters.l1 && activeFilters.l2 && (taxonomy[activeFilters.l1]?.[activeFilters.l2] || []).map(level3 => (
                                        <option key={level3} value={level3}>{level3}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Resultado: Lista de Skills Filtradas */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="text-xs text-slate-400 mb-3 px-1">{skills.length} skills encontradas</div>
                    {skills.length === 0 ? (
                        <div className="text-center text-sm text-slate-400 py-8">
                            Nenhuma skill encontrada para estes parâmetros. Tente buscar algo diferente.
                        </div>
                    ) : (
                        skills.map(skill => (
                            <button
                                key={skill.name}
                                onClick={() => loadSkillContent(skill.name)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1.5 text-sm transition-all border ${selectedSkill === skill.name
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700/50 shadow-sm'
                                    : 'bg-white border-transparent hover:border-slate-200 dark:bg-transparent dark:hover:bg-slate-800/50 dark:hover:border-slate-700/50'
                                    }`}
                            >
                                <div className={`font-medium truncate ${selectedSkill === skill.name ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {skill.name}
                                </div>
                                {/* Badges do caminho taxonômico (Pílulas minúsculas) */}
                                <div className="flex items-center space-x-1 mt-1.5 opacity-80 h-4 truncate">
                                    {skill.l1 && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 rounded">{skill.l1}</span>}
                                    {skill.l2 && <><ChevronRight className="w-2 h-2 text-slate-400" /> <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 rounded truncate max-w-[80px]">{skill.l2}</span></>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            {/* ... [Mesmo Componente do Editor mantido, apenas atualizando estilos se necessário] ... */}
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#020617] relative border-l border-slate-200 dark:border-slate-800">
                {notification && (
                    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm text-white ${notification.type === 'success' ? 'bg-emerald-600' : notification.type === 'error' ? 'bg-rose-600' : 'bg-amber-600'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>{notification.message}</span>
                    </div>
                )}

                {selectedSkill ? (
                    <>
                        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-[#020617] shadow-sm z-10">
                            <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800">
                                    {selectedSkill}/<span className="text-slate-900 dark:text-white font-semibold">SKILL.md</span>
                                </span>
                                {hasChanges && (
                                    <span className="flex items-center text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full animate-pulse border border-amber-200 dark:border-amber-800">
                                        <AlertCircle className="w-3 h-3 mr-1" /> Editado (Não salvo)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowCloneModal(true)}
                                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 dark:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Clonar Skill</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                    className={`flex items-center space-x-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${hasChanges
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                                        }`}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Salvar Original</span>
                                </button>
                            </div>
                        </div>

                        {/* Syntax textarea */}
                        <div className="flex-1 p-0 m-0 overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 w-8 bg-slate-100 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 z-0 flex flex-col items-center py-6 text-xs text-slate-400 font-mono select-none">
                                {/* Linhas falsas visuais para dar ambiente de IDE */}
                                {[...Array(50)].map((_, i) => <div key={i} className="h-[23px]">{i + 1}</div>)}
                            </div>

                            <textarea
                                value={fileContent}
                                onChange={(e) => setFileContent(e.target.value)}
                                className="w-full h-full pl-12 pr-6 py-6 bg-white dark:bg-[#020617] bg-opacity-[0.98] border-none resize-none outline-none font-mono text-sm leading-[23px] text-slate-800 dark:text-slate-300 relative z-10"
                                spellCheck={false}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-[#020617]">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center max-w-sm text-center">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/50">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Editor Local Ativado</h3>
                            <p className="text-sm">Selecione, pesquise ou filtre alguma habilidade no menu lateral para visualizar ou editar seu núcleo nativo.</p>
                        </div>
                    </div>
                )}

                {/* Modal para Clonar */}
                {showCloneModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                                    <Copy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Duplicar Skill</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Criaremos uma cópia inteligente 1:1 dessa skill. Como você pretende mudar a finalidade, alterar o nome garantirá a integridade do seu banco de dados global.
                                </p>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Nome da nova ferramenta (ID)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cloneName}
                                        onChange={(e) => setCloneName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                        placeholder={`ex: ${selectedSkill}-custom`}
                                        className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono text-sm transition-shadow"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">*Somente letras minúsculas e hífens permitidos.</p>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setShowCloneModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleClone}
                                    disabled={!cloneName.trim()}
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-colors"
                                >
                                    Confirmar e Clonar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
