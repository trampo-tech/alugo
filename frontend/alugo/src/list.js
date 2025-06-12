// alugo/frontend/alugo/src/list.js
import React, { useEffect, useState } from 'react';
import SidebarFilters from './sidebar';
import './list.css';
import './card.css'; // Importa card.css para o item-card
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ItensList() {
  // `filtros` agora inclui query, categoria, precoMin, precoMax, dataInicial, dataFinal, e status
  const [filtros, setFiltros] = useState({ 
    query: '', 
    categoria: '', 
    precoMin: '', 
    precoMax: '', 
    dataInicial: '', 
    dataFinal: '',
    status: '' // Novo campo de filtro para status
  });
  
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // `searchTerm` será usado para o input da barra de pesquisa visível
  const [searchTerm, setSearchTerm] = useState(''); 

  // Sincroniza o termo de busca da URL com o estado local e o estado de filtros
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryTerm = queryParams.get('query') || '';
    setSearchTerm(queryTerm); // Atualiza o input da barra de pesquisa
    setFiltros(prev => ({ ...prev, query: queryTerm })); // Atualiza o filtro de busca
  }, [location.search]);

  // Efeito para buscar itens sempre que os filtros mudarem
  useEffect(() => {
    const fetchItens = async () => {
      setLoading(true);
      setError(null);
      try {
        // Os parâmetros são enviados diretamente do estado de filtros
        const response = await axios.get('http://localhost:8080/buscar-itens', { params: filtros });
        setItens(response.data);
      } catch (err) {
        console.error('Erro ao buscar itens:', err);
        setError('Não foi possível carregar os itens. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [filtros]); // Reage a mudanças em *qualquer* filtro

  // Callback para a SidebarFilters (para filtros de categoria, preço, data e status)
  const handleFilterChange = (newFilters) => {
    setFiltros(prev => ({ ...prev, ...newFilters }));
  };

  // Função para lidar com a busca da barra de pesquisa (quando o botão é clicado)
  const handleSearchBarSearch = () => {
    setFiltros(prev => ({ ...prev, query: searchTerm })); // Atualiza o filtro 'query'
  };

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`); // Navega para a página de detalhes do item
  };

  // Função para traduzir o status do item para uma mensagem amigável
  const getFriendlyStatus = (status) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'alugado':
        return 'Alugado';
      case 'inativo':
        return 'Inativo';
      case 'alugado_pendente':
        return 'Aguardando Confirmação';
      default:
        return status;
    }
  };

  return (
    <div className="itens-page">
      {/* Barra de pesquisa na página de listagem */}
      <div className="list-page-search-bar">
        <input
          type="text"
          placeholder="Pesquise por itens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearchBarSearch}>Pesquisar</button>
      </div>

      <div className="list-content-container"> {/* Contêiner para sidebar e listagem */}
        {/* Passa todos os filtros atuais para a SidebarFilters */}
        <SidebarFilters onFilterChange={handleFilterChange} currentFilters={filtros} /> 
        <div className="listagem-itens">
          {loading && <p>Carregando itens...</p>}
          {error && <p className="feedback-message error">{error}</p>}
          {!loading && !error && itens.length === 0 && (
            <p>Nenhum item encontrado com os critérios de busca.</p>
          )}
          {itens.map((item) => (
            <div
              className="item-card"
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              {item.imagem_id ? (
                <img src={`http://localhost:8080/imagem/${item.imagem_id}`} alt={item.titulo} className="item-image" />
              ) : (
                <div className="item-image-placeholder">N/A</div>
              )}
              <h3>{item.titulo}</h3>
              <p className="item-preco">R${parseFloat(item.preco_diario).toFixed(2).replace('.', ',')}/dia</p>
              
              {/* Exibe a disponibilidade (status) do item */}
              <div className="item-info status-display"> 
                <span>Status: {getFriendlyStatus(item.status)}</span>
              </div>
              <button className="btn-detalhes">Ver detalhes</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItensList;
