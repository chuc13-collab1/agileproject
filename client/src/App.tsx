import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <PwaUpdatePrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
