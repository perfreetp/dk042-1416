import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import HeatmapPage from '@/pages/HeatmapPage/HeatmapPage';
import QualityPage from '@/pages/QualityPage/QualityPage';
import ReviewPage from '@/pages/ReviewPage/ReviewPage';
import WeeklyPage from '@/pages/WeeklyPage/WeeklyPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HeatmapPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
