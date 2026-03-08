import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Glossary } from './pages/Glossary';
import { SkillDetail } from './pages/SkillDetail';
import { Home as ExploreHome } from './pages/Home';
import { LearningGuide } from './pages/LearningGuide';
import { SkillStudio } from './pages/SkillStudio';
import { BookOpen, Github, LayoutGrid, GraduationCap, Edit3 } from 'lucide-react';

function App(): React.ReactElement {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 md:px-8">
            <Link to="/" className="mr-8 flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Antigravity<span className="text-indigo-600">Skills</span></span>
            </Link>

            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Glossário
                </Link>
                <Link to="/learn" className="flex items-center text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Aprender
                </Link>
                <Link to="/explore" className="flex items-center text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Explorar
                </Link>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <Link to="/studio" className="flex items-center text-indigo-600 font-medium hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Estúdio Local
                </Link>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <a
                  href="https://github.com/sickn33/antigravity-awesome-skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  title="GitHub Repository"
                >
                  <Github className="h-5 w-5" />
                </a>
              </nav>
            </div>
          </div>
        </header>

        <main className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-10">
          <Routes>
            <Route path="/" element={<Glossary />} />
            <Route path="/learn" element={<LearningGuide />} />
            <Route path="/explore" element={<ExploreHome />} />
            <Route path="/skill/:id" element={<SkillDetail />} />
            <Route path="/studio" element={<SkillStudio />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-[#020617]">
          <div className="container max-w-screen-2xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="font-bold">Antigravity Skills Hub</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 Antigravity Awesome Skills. Distribuído sob licença MIT.
            </p>
            <div className="flex space-x-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-indigo-600">Documentação</a>
              <a href="#" className="hover:text-indigo-600">Comunidade</a>
              <a href="#" className="hover:text-indigo-600">Suporte</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
