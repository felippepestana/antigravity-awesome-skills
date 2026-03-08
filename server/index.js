const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const skillsDir = path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'antigravity', 'skills');

// Dicionário de Sinônimos (PT -> EN) para tradução de busca local
const ptToEnMap = {
    "banco de dados": ["database", "sql", "nosql", "postgres", "mysql", "mongodb", "orm", "prisma"],
    "programação": ["programming", "code", "development", "developer", "software", "coder"],
    "segurança": ["security", "pentest", "auth", "vulnerability", "hack", "cyber", "authentication"],
    "nuvem": ["cloud", "aws", "azure", "gcp", "serverless", "lambda"],
    "inteligência artificial": ["ai ", " LLM", "machine learning", "agent", "prompt", "openai", "claude"],
    "ia": ["ai ", " LLM", "machine learning", "agent", "prompt", "openai", "claude"],
    "redes": ["network", "tcp", "http", "api", "rest", "graphql"],
    "testes": ["testing", "jest", "cypress", "playwright", "qa", "tdd"],
    "desempenho": ["performance", "optimization", "speed", "memory", "profiling"],
    "arquitetura": ["architecture", "system design", "microservices", "ddd", "solid"]
};

// Taxonomia: L1 -> L2 -> L3
const taxonomy = {
    "Programação": {
        "Front-end": ["React", "Vue", "Angular", "CSS/UI", "Mobile (React Native/Flutter)"],
        "Back-end": ["Node.js", "Python", "Java", "Go", "C#/.NET", "PHP/Ruby"],
        "Arquitetura": ["Microservices", "API Design", "DDD/Clean Arch"]
    },
    "Dados e IA": {
        "Banco de Dados": ["Relacional (SQL)", "NoSQL", "ORMs", "Analytics"],
        "Inteligência Artificial": ["LLMs & RAG", "Agentes", "Engenharia de Prompt", "Machine Learning"],
        "Data Engineering": ["Pipelines", "Scraping/Crawling"]
    },
    "DevOps e Nuvem": {
        "Cloud Providers": ["AWS", "Azure", "GCP"],
        "Containers & CI/CD": ["Docker/K8s", "GitHub Actions", "GitLab/CI", "Terraform/IaC"],
        "Observabilidade": ["Monitoramento", "Logs/Traces", "Performance"]
    },
    "Segurança": {
        "Testes (Pentest)": ["Web", "APIs", "Infraestrutura", "Cloud"],
        "Defesa & Cripto": ["Autenticação", "Criptografia", "DevSecOps"]
    },
    "Negócios & Operações": {
        "Gestão & Agile": ["Product Management", "Scrum/Kanban", "Análise de Negócios"],
        "Marketing & Vendas": ["SEO", "Automação", "Copywriting", "Analytics"]
    }
};

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { description: '' };

    const frontmatter = match[1];
    const descriptionMatch = frontmatter.match(/description:\s*(.*)/);
    return {
        description: descriptionMatch ? descriptionMatch[1].trim() : ''
    };
}

let cachedSkills = [];

// Função para categorizar uma skill baseada no conteúdo
function categorizeSkill(content, name) {
    const text = (content + " " + name).toLowerCase();

    let tags = [];

    // Regras de ML simples
    if (text.includes("react") || text.includes("next.js") || text.includes("frontend")) tags.push({ l1: "Programação", l2: "Front-end", l3: "React" });
    if (text.includes("vue") || text.includes("nuxt")) tags.push({ l1: "Programação", l2: "Front-end", l3: "Vue" });
    if (text.includes("css") || text.includes("tailwind") || text.includes("ui/ux")) tags.push({ l1: "Programação", l2: "Front-end", l3: "CSS/UI" });
    if (text.includes("node") || text.includes("express") || text.includes("nestjs")) tags.push({ l1: "Programação", l2: "Back-end", l3: "Node.js" });
    if (text.includes("python") || text.includes("django") || text.includes("fastapi")) tags.push({ l1: "Programação", l2: "Back-end", l3: "Python" });
    if (text.includes("java") || text.includes("spring")) tags.push({ l1: "Programação", l2: "Back-end", l3: "Java" });
    if (text.includes("c#") || text.includes(".net") || text.includes("dotnet")) tags.push({ l1: "Programação", l2: "Back-end", l3: "C#/.NET" });

    if (text.includes("sql") || text.includes("postgres") || text.includes("mysql")) tags.push({ l1: "Dados e IA", l2: "Banco de Dados", l3: "Relacional (SQL)" });
    if (text.includes("nosql") || text.includes("mongo") || text.includes("dynamo")) tags.push({ l1: "Dados e IA", l2: "Banco de Dados", l3: "NoSQL" });
    if (text.includes("prisma") || text.includes("drizzle") || text.includes("orm")) tags.push({ l1: "Dados e IA", l2: "Banco de Dados", l3: "ORMs" });

    if (text.includes("aws")) tags.push({ l1: "DevOps e Nuvem", l2: "Cloud Providers", l3: "AWS" });
    if (text.includes("azure")) tags.push({ l1: "DevOps e Nuvem", l2: "Cloud Providers", l3: "Azure" });
    if (text.includes("docker") || text.includes("kubernetes") || text.includes("k8s")) tags.push({ l1: "DevOps e Nuvem", l2: "Containers & CI/CD", l3: "Docker/K8s" });

    if (text.includes("security") || text.includes("pentest") || text.includes("vulnerab")) tags.push({ l1: "Segurança", l2: "Testes (Pentest)", l3: "Web" });
    if (text.includes("ai ") || text.includes(" LLM") || text.includes("agent") || text.includes("rag ")) tags.push({ l1: "Dados e IA", l2: "Inteligência Artificial", l3: "LLMs & RAG" });
    if (text.includes("seo") || text.includes("marketing")) tags.push({ l1: "Negócios & Operações", l2: "Marketing & Vendas", l3: "SEO" });

    // Padrão se não achar nada
    if (tags.length === 0) {
        tags.push({ l1: "Programação", l2: "Arquitetura", l3: "API Design" });
    }

    return tags[0]; // Pega a primeira match mais forte
}

// Carregar skills pre-processadas na memória
function loadSkillsIntoMemory() {
    if (!fs.existsSync(skillsDir)) return;

    const dirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
    cachedSkills = dirs.map(dirent => {
        const skillName = dirent.name;
        const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
        let description = 'Sem descrição';
        let content = '';

        if (fs.existsSync(skillPath)) {
            content = fs.readFileSync(skillPath, 'utf8');
            const meta = parseFrontmatter(content);
            if (meta.description) description = meta.description;
        }

        const categoryInfo = categorizeSkill(content, skillName);

        return {
            name: skillName,
            description,
            content,
            isValid: content.length > 0,
            l1: categoryInfo.l1,
            l2: categoryInfo.l2,
            l3: categoryInfo.l3
        };
    });
    console.log(`[Cache] Carregadas ${cachedSkills.length} skills na memória com taxonomia.`);
}

loadSkillsIntoMemory();

// Traduz e expande a query do usuário
function expandQueryTerm(query) {
    let terms = [query.toLowerCase()];
    Object.keys(ptToEnMap).forEach(key => {
        if (query.toLowerCase().includes(key)) {
            terms = terms.concat(ptToEnMap[key]);
        }
    });
    return terms;
}

// Retorna todas as skills, a taxonomia, e permite busca/filtros
app.get('/api/skills', (req, res) => {
    let result = cachedSkills;

    // Retira o content para não pesar o JSON inicial
    const lightweightSkills = result.map(s => ({
        name: s.name,
        description: s.description,
        isValid: s.isValid,
        l1: s.l1,
        l2: s.l2,
        l3: s.l3
    }));

    res.json({
        skills: lightweightSkills,
        taxonomy,
        total: lightweightSkills.length
    });
});

// Busca Inteligente com Filtros e Tradução Implícita
app.post('/api/skills/search', (req, res) => {
    const { query, filters } = req.body;
    let results = cachedSkills;

    // Aplica filtros hierárquicos (L1, L2, L3)
    if (filters) {
        if (filters.l1) results = results.filter(s => s.l1 === filters.l1);
        if (filters.l2) results = results.filter(s => s.l2 === filters.l2);
        if (filters.l3) results = results.filter(s => s.l3 === filters.l3);
    }

    // Aplica a busca com expansão de sinônimos/tradução
    if (query && query.trim() !== '') {
        const searchTerms = expandQueryTerm(query.trim());

        results = results.filter(s => {
            const targetText = (s.name + " " + s.description + " " + s.content).toLowerCase();
            // Se qualquer um dos termos traduzidos/originais bater, retorna a skill
            return searchTerms.some(term => targetText.includes(term));
        });
    }

    // Ordena por relevância básica (as menores strings que batem costumam ser o que a pessoa quer, ou alfabético)
    results.sort((a, b) => a.name.localeCompare(b.name));

    const lightweightSkills = results.map(s => ({
        name: s.name,
        description: s.description,
        isValid: s.isValid,
        l1: s.l1,
        l2: s.l2,
        l3: s.l3
    }));

    res.json({ skills: lightweightSkills, count: lightweightSkills.length });
});

// Buscar uma skill por nome
app.get('/api/skills/:name', (req, res) => {
    const skillName = req.params.name;
    const skill = cachedSkills.find(s => s.name === skillName);

    if (!skill) return res.status(404).json({ error: "Skill não encontrada no cache." });
    res.json({ name: skill.name, content: skill.content });
});

// Atualizar skill
app.put('/api/skills/:name', (req, res) => {
    const skillName = req.params.name;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Conteúdo vazio." });
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillPath)) return res.status(404).json({ error: "Skill não existe no disco." });

    try {
        fs.writeFileSync(skillPath, content, 'utf8');
        loadSkillsIntoMemory(); // Recarrega o cache
        res.json({ success: true, message: `Habilidade salva com sucesso!` });
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar o arquivo." });
    }
});

// Duplicar skill
app.post('/api/skills/duplicate', (req, res) => {
    const { originalName, newName, content } = req.body;
    if (!originalName || !newName || !content) return res.status(400).json({ error: "Faltam parâmetros." });

    const originalPath = path.join(skillsDir, originalName);
    const newPath = path.join(skillsDir, newName);

    if (!fs.existsSync(originalPath)) return res.status(404).json({ error: "Origem não encontrada." });
    if (fs.existsSync(newPath)) return res.status(400).json({ error: "Nome de skill já existe." });

    try {
        fs.mkdirSync(newPath, { recursive: true });
        fs.writeFileSync(path.join(newPath, 'SKILL.md'), content, 'utf8');
        loadSkillsIntoMemory(); // Recarrega cache
        res.json({ success: true, message: "Skill duplicada com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro crítico ao duplicar a skill." });
    }
});

app.listen(PORT, () => {
    console.log(`[🚀 Antigravity DB Engine rodando na Porta ${PORT}]`);
});
