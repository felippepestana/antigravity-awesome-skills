export const CATEGORIES = [
    { id: 'architecture-planning', name: 'Arquitetura e Planejamento', icon: 'Layout', color: 'indigo' },
    { id: 'development-frameworks', name: 'Desenvolvimento e Frameworks', icon: 'Code2', color: 'blue' },
    { id: 'security-privacy', name: 'Segurança e Privacidade', icon: 'ShieldCheck', color: 'red' },
    { id: 'devops-infrastructure', name: 'DevOps e Infraestrutura', icon: 'Container', color: 'orange' },
    { id: 'data-ai', name: 'Dados e Inteligência Artificial', icon: 'Brain', color: 'purple' },
    { id: 'automation-workflows', name: 'Automação e Workflows', icon: 'Zap', color: 'yellow' },
    { id: 'testing-qa', name: 'QA e Testes', icon: 'ClipboardCheck', color: 'green' },
    { id: 'business-content', name: 'Negócios e Conteúdo', icon: 'Briefcase', color: 'rose' },
    { id: 'andruia', name: 'Andru.ia (Maestro)', icon: 'Sparkles', color: 'amber' },
    { id: 'uncategorized', name: 'Geral e Outros', icon: 'Book', color: 'slate' }
];

export const CATEGORY_MAP: Record<string, string> = {
    'architecture-planning': 'Arquitetura e Planejamento',
    'development-frameworks': 'Desenvolvimento e Frameworks',
    'security-privacy': 'Segurança e Privacidade',
    'devops-infrastructure': 'DevOps e Infraestrutura',
    'data-ai': 'Dados e Inteligência Artificial',
    'automation-workflows': 'Automação e Workflows',
    'testing-qa': 'QA e Testes',
    'business-content': 'Negócios e Conteúdo',
    'andruia': 'Andru.ia (Maestro)',
    'uncategorized': 'Geral e Outros'
};
