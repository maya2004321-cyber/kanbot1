import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router';

import LoginPage from './pages/LoginPage';

import ProjectPage from './pages/ProjectPage';

import { useParams } from 'react-router';
import BacklogPage from './pages/BacklogPage';
import SprintPage from './pages/SprintPage';
import BoardPage from './pages/BoardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import RegisterPage from './pages/RegisterPage';

function ProjectBacklogRoute() {
  const { projectId } = useParams();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  return <BacklogPage projectId={projectId} />;
}
function ProjectSprintRoute() {
  const { projectId } = useParams();

  if (!projectId) return <Navigate to="/projects" replace />;

  return <SprintPage projectId={projectId} />;
}

function ProjectBoardRoute() {
  const { projectId } = useParams();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  return <BoardPage projectId={projectId} />;
} 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
         path="/projects/:projectId/backlog"
         element={<ProjectBacklogRoute />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
        path="/projects/:projectId/sprints"
       element={<ProjectSprintRoute />}
        />
        <Route
       path="/projects/:projectId/board"
       element={<ProjectBoardRoute />}
      />
      <Route
        path="/projects/:projectId/ai"
       element={<AIAssistantPage />}
      />
      <Route path="/register" element={<RegisterPage />} />
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;