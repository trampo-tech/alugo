// alugo/frontend/alugo/src/list.js
import React, { useEffect, useState } from 'react';
import SidebarFilters from './sidebar';
import './list.css';
import './card.css'; // Certifique-se de importar o card.css para o estilo dos cards
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ItensList() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca da URL/barra de pesquisa
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  // Sincroniza o termo de busca da URL com o estado local ao carregar a página
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('query') || '');
  }, [location.search]);

  // Efeito para buscar itens sempre que os filtros ou o termo de busca mudarem
  useEffect(() => {
    const fetchItens = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          query: searchTerm, // Inclui o termo de busca
          categoria: categoriaFilter,
          precoMin: precoMin,
          precoMax: precoMax,
          dataInicial: dataInicial,
          dataFinal: dataFinal,
        };
        const res = await axios.get('http://localhost:8080/buscar-itens', { params });
        // A API /buscar-itens já retorna a lista de itens diretamente
        setItens(res.data);
      } catch (err) {
        console.error('Erro ao buscar itens:', err);
        setError('Não foi possível carregar os itens. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [searchTerm, categoriaFilter, precoMin, precoMax, dataInicial, dataFinal]);

  // Callback para a SidebarFilters
  const handleFilterChange = (newFilters) => {
    setCategoriaFilter(newFilters.categoria);
    setPrecoMin(newFilters.precoMin);
    setPrecoMax(newFilters.precoMax);
    // Data inicial e final podem ser adicionadas à sidebar depois
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    // O useEffect já reage às mudanças de estado dos filtros, então não precisamos de uma ação aqui além de atualizar os estados.
    // Se a sidebar tiver um botão "Aplicar", ele pode chamar esta função.
  };

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`); // Navega para a página de detalhes do item
  };

  return (
    <div className="itens-page">
      <SidebarFilters
        onFilterChange={handleFilterChange}
        // Passa os estados atuais dos filtros para que a sidebar possa exibi-los
        currentCategoria={categoriaFilter}
        currentPrecoMin={precoMin}
        currentPrecoMax={precoMax}
      />
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
            {/* Opcional: botão "Ver detalhes" se desejar duplicar a funcionalidade de clique no card */}
            <button className="btn-detalhes">Ver detalhes</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItensList;
