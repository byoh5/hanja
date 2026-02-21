import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CharListPage } from './pages/CharListPage';
import { HomePage } from './pages/HomePage';
import { LookupPage } from './pages/LookupPage';
import { QuizPage } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { ReviewPage } from './pages/ReviewPage';
import { StudyPage } from './pages/StudyPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/lookup" element={<LookupPage />} />
          <Route path="/chars" element={<CharListPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
