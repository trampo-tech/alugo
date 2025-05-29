import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import NovoItem from './newItem';
import ItensList from './list'; // ✅ Importa a nova página

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/novo-item" element={<NovoItem />} />
        <Route path="/itens" element={<ItensList />} /> {/* ✅ Nova rota adicionada */}
      </Routes>
    </Router>
  );
}

export default Main;
