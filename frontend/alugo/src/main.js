import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import NovoItem from './newItem';
import ItensList from './list';
import AboutPage from './about'; // importe a nova página
import Categorias from './cat';


function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/novo-item" element={<NovoItem />} />
        <Route path="/listagem" element={<ItensList />} /> {/* Rota para busca */}
        <Route path="/about" element={<AboutPage />} /> {/* nova rota */}
        <Route path="/categorias" element={<Categorias />} />
      </Routes>
    </Router>
  );
}

export default Main;
