import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import VPNPage from './VPNPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<VPNPage />} />
      </Routes>
    </Router>
  );
}

export default App;
