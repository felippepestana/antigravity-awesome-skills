const fs = require('fs');
const path = require('path');
const skillsDir = 'C:\\\\Users\\\\felip\\\\.gemini\\\\antigravity\\\\skills';
const outputMd = 'C:\\\\Antygravit\\\\antigravity-awesome-skills\\\\GLOSSARIO_INICIANTES.md';

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { description: '' };

    const frontmatter = match[1];
    const descriptionMatch = frontmatter.match(/description:\s*(.*)/);
    return {
        description: descriptionMatch ? descriptionMatch[1].trim() : ''
    };
}

try {
    const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const skillName = dirent.name;
            const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
            let description = 'Habilidade sem descrição.';

            if (fs.existsSync(skillPath)) {
                const content = fs.readFileSync(skillPath, 'utf8');
                const meta = parseFrontmatter(content);
                if (meta.description) description = meta.description;
            }

            return { name: skillName, description };
        });

    const grouped = skills.reduce((acc, skill) => {
        const firstLetter = skill.name.charAt(0).toUpperCase();
        const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(skill);
        return acc;
    }, {});

    let mdContent = '# 📘 Glossário de Habilidades (Skills) para Iniciantes\n\n';
    mdContent += '> *Um catálogo interativo e amigável para você entender o que cada assistente ou ferramenta (Skill) faz. Nenhuma experiência prévia de programação é necessária! Basta ler e encontrar o assistente ideal.*\n\n';
    mdContent += '## 🧭 Índice Alfabético\n\n';

    const sortedKeys = Object.keys(grouped).sort();

    mdContent += sortedKeys.map(k => '[`' + k + '`](#' + k.toLowerCase() + ')').join(' | ') + '\n\n';
    mdContent += '---\n\n';

    sortedKeys.forEach(letter => {
        mdContent += `### ${letter}\n\n`;
        grouped[letter].sort((a, b) => a.name.localeCompare(b.name)).forEach(skill => {
            mdContent += `<details>\n<summary><strong>${skill.name}</strong></summary>\n\n`;
            mdContent += `> ${skill.description}\n\n`;
            mdContent += `*Caminho local: \`C:\\Users\\felip\\.gemini\\antigravity\\skills\\${skill.name}\`*\n\n`;
            mdContent += `</details>\n\n`;
        });
        mdContent += '[⬆️ Voltar ao Índice](#-índice-alfabético)\n\n---\n\n';
    });

    fs.writeFileSync(outputMd, mdContent, 'utf8');
    console.log('✅ Glossário criado em:', outputMd);
} catch (error) {
    console.error('Erro:', error);
}
