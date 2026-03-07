import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const SKILLS_INDEX_PATH = path.join(ROOT_DIR, 'skills_index.json');

const CATEGORY_KEYWORDS = {
    'architecture-planning': [
        'architecture', 'planning', 'brainstorming', 'design', 'spec', 'adr',
        'specification', 'roadmap', 'c4', 'system design', 'diagram'
    ],
    'development-frameworks': [
        'react', 'vue', 'angular', 'svelte', 'nextjs', 'typescript', 'javascript',
        'frontend', 'backend', 'nodejs', 'express', 'fastapi', 'python', 'java',
        'rust', 'golang', 'ruby', 'laravel', 'framework', 'pattern'
    ],
    'security-privacy': [
        'security', 'audit', 'penetration', 'vulnerability', 'encryption',
        'auth', 'authentication', 'authorization', 'gdpr', 'privacy', 'owasp',
        'hacking', 'attacker', 'defense'
    ],
    'devops-infrastructure': [
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'deployment', 'ci/cd',
        'terraform', 'ansible', 'serverless', 'cloud', 'infrastructure',
        'orchestration', 'monitoring', 'logging'
    ],
    'data-ai': [
        'ai', 'llm', 'ml', 'machine learning', 'gpt', 'embedding', 'vector',
        'rag', 'prompt-engineer', 'nlp', 'data', 'analytics', 'science'
    ],
    'automation-workflows': [
        'automation', 'workflow', 'zapier', 'n8n', 'trigger', 'scheduled',
        'integration', 'scripting', 'process'
    ],
    'testing-qa': [
        'test', 'testing', 'qa', 'lint', 'validate', 'jest', 'cypress', 'e2e',
        'unit test', 'coverage', 'quality'
    ],
    'business-content': [
        'seo', 'marketing', 'copywriting', 'content', 'business', 'growth',
        'cro', 'product', 'strategy', 'documentation'
    ]
};

const CATEGORY_PRIORITY = [
    'architecture-planning',
    'development-frameworks',
    'security-privacy',
    'devops-infrastructure',
    'data-ai',
    'automation-workflows',
    'testing-qa',
    'business-content'
];

function categorize(name, desc) {
    const text = `${name} ${desc}`.toLowerCase();
    let bestCat = 'uncategorized';
    let maxMatches = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let matches = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) matches++;
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            bestCat = cat;
        }
    }
    return bestCat;
}

const skillsIndex = JSON.parse(fs.readFileSync(SKILLS_INDEX_PATH, 'utf8'));

const updatedIndex = skillsIndex.map(skill => {
    if (!skill.category || skill.category === 'uncategorized') {
        skill.category = categorize(skill.name || skill.id, skill.description || '');
    }
    return skill;
});

fs.writeFileSync(SKILLS_INDEX_PATH, JSON.stringify(updatedIndex, null, 2));
console.log('✅ Categorization fixed via JS');
