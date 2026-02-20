import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { StudyPage } from './pages/StudyPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
