import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import NovoItem from './newItem';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/novo-item" element={<NovoItem />} />
      </Routes>
    </Router>
  );
}

export default Main;
