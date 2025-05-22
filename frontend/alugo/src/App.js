import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/itens')
      .then(response => {
        setItens(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar itens:', error);
      });
  }, []);

  return (
    <div>
      <header>
        <div className="logo">Rental Platform</div>
        <div className="buttons">
          <button className="outline">Login</button>
          <button className="outline">Sign up</button>
        </div>
      </header>

      <section className="hero">
        <h1>Rent items from people</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search for items" />
          <button>Search</button>
        </div>
      </section>

      <section className="popular">
        <h2>Popular items</h2>
        <div className="items">
          {itens.map((item) => (
            <div className="card" key={item.id}>
              <img src={item.imagem} alt={item.nome} />
              <p className="name">{item.nome}</p>
              <p className="price">${item.preco} <span>/ day</span></p>
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
          <button>Learn more</button>
        </div>
      </section>
    </div>
  );
}

export default App;
