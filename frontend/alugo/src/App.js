import './App.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [itens, setItens] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/itens') // ou sua rota real
      .then((res) => setItens(res.data))
      .catch((err) => console.error('Erro ao carregar itens:', err));
  }, []);

  const handleSearch = () => {
    navigate(`/listagem?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">ALUGO</div>
        <div className="header-buttons">
          <button className="outline">Login</button>
          <button className="outline">Cadastro</button>
        </div>
      </header>


      <section className="hero">
        <h1>Rent items from people</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="popular">
        <h2>Categorias</h2>
        <div className="items">
          {itens.map((item) => (
            <div className="card" key={item.id}>
              <img src={`http://localhost:8080/imagem/${item.imagem_id}`} alt={item.nome} />
              <h3 className="name">{item.nome}</h3>
              <p className="price">R${item.preco_diario} <span>/ day</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="actions">
        <div className="card-action">
          <h3>Become a host</h3>
          <button>Get started</button>
        </div>
        <div className="card-action">
          <h3>How it works</h3>
          <button onClick={() => navigate('/about')}>Learn more</button>
        </div>
      </section>
    </div>
  );
}

export default App;
