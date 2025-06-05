import './App.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function App({ user, onLogout }) { // Recebe 'user' e 'onLogout' como props
  const [searchTerm, setSearchTerm] = useState('');
  const [itens, setItens] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca itens para a landing page
    axios.get('http://localhost:8080/itens') // ou sua rota real no backend
      .then((res) => setItens(res.data))
      .catch((err) => console.error('Erro ao carregar itens na página principal:', err));
  }, []);

  // Lida com a pesquisa da barra principal, redirecionando para a página de listagem
  const handleSearch = () => {
    navigate(`/listagem?query=${encodeURIComponent(searchTerm)}`);
  };

  // Lida com o clique no botão de Login, redirecionando para a página de login
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Lida com o clique no botão de Cadastro, redirecionando para a página de registro
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Lida com o logout do usuário
  const handleLogout = () => {
    onLogout(); // Chama a função de logout passada via props (limpa localStorage e estado)
    navigate('/'); // Opcional: redireciona para a home após o logout
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">ALUGO</div>
        <div className="header-buttons">
          {user ? ( // Renderização condicional: se o usuário estiver logado
            <>
              {/* Exibe o nome do usuário e um botão de Logout */}
              <span>Olá, {user.nome}!</span>
              <button className="outline" onClick={handleLogout}>Logout</button>
            </>
          ) : ( // Se o usuário não estiver logado, exibe botões de Login e Cadastro
            <>
              <button className="outline" onClick={handleLoginClick}>Login</button>
              <button className="outline" onClick={handleRegisterClick}>Cadastro</button>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <h1>Alugue itens de pessoas</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Pesquisar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => { // Permite pesquisar ao pressionar Enter
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>
      </section>

      <section className="popular">
        <h2>Categorias</h2>
        <div className="items">
          {itens.map((item) => (
            <div className="card" key={item.id}>
              {/* A URL da imagem aponta para o backend */}
              <img src={`http://localhost:8080/imagem/${item.imagem_id}`} alt={item.nome} />
              <h3 className="name">{item.nome}</h3>
              <p className="price">R${item.preco_diario} <span>/ dia</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="actions">
        <div className="card-action">
          <h3>Torne-se um anfitrião</h3>
          <button>Comece agora</button>
        </div>
        <div className="card-action">
          <h3>Como funciona</h3>
          <button onClick={() => navigate('/about')}>Saiba mais</button>
        </div>
      </section>
    </div>
  );
}

export default App;
