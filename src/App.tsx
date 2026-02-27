import { Suspense, lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const StudyPage = lazy(() => import('./pages/StudyPage').then((module) => ({ default: module.StudyPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then((module) => ({ default: module.QuizPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((module) => ({ default: module.ReviewPage })));
const LookupPage = lazy(() => import('./pages/LookupPage').then((module) => ({ default: module.LookupPage })));
const PlacementPage = lazy(() => import('./pages/PlacementPage').then((module) => ({ default: module.PlacementPage })));
const CharListPage = lazy(() => import('./pages/CharListPage').then((module) => ({ default: module.CharListPage })));
const VocabularyDictionaryPage = lazy(() =>
  import('./pages/VocabularyDictionaryPage').then((module) => ({ default: module.VocabularyDictionaryPage }))
);
const ResultPage = lazy(() => import('./pages/ResultPage').then((module) => ({ default: module.ResultPage })));

export default function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
            <section className="surface-card p-6">
              <p className="text-sm text-slate-500">페이지를 불러오는 중...</p>
            </section>
          </main>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/lookup" element={<LookupPage />} />
            <Route path="/placement" element={<PlacementPage />} />
            <Route path="/chars" element={<CharListPage />} />
            <Route path="/vocabulary" element={<VocabularyDictionaryPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
