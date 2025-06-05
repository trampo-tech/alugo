import React, { useEffect, useState, useCallback } from 'react';
import ItemCard from './card';
import SidebarFilters from './sidebar';
import './list.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function ItensList() {
  const [itens, setItens] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locais para os inputs do formulário de pesquisa e filtros
  // Eles são inicializados com os valores da URL na primeira renderização.
  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('query') || '');
  const [filtros, setFiltros] = useState({
    categoria: searchParams.get('categoria') || '',
    precoMin: searchParams.get('precoMin') || '',
    precoMax: searchParams.get('precoMax') || '',
    dataInicial: searchParams.get('dataInicial') || '',
    dataFinal: searchParams.get('dataFinal') || '',
  });

  // Função para atualizar os parâmetros da URL e disparar a busca.
  // Memorizada com useCallback para evitar recriação desnecessária.
  const handleApplySearchAndFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    if (localSearchTerm) {
      newParams.append('query', localSearchTerm);
    }
    if (filtros.categoria) {
      newParams.append('categoria', filtros.categoria);
    }
    if (filtros.precoMin) {
      newParams.append('precoMin', filtros.precoMin);
    }
    if (filtros.precoMax) {
      newParams.append('precoMax', filtros.precoMax);
    }
    if (filtros.dataInicial) {
      newParams.append('dataInicial', filtros.dataInicial);
    }
    if (filtros.dataFinal) {
      newParams.append('dataFinal', filtros.dataFinal);
    }
    setSearchParams(newParams); // Isso acionará o useEffect abaixo.
  }, [localSearchTerm, filtros, setSearchParams]); // Dependências da função

  // Efeito para buscar itens e sincronizar estados locais com a URL.
  // Este efeito é disparado *apenas* quando 'searchParams' muda (ou seja, a URL muda).
  useEffect(() => {
    // Sincroniza os estados locais dos inputs com os parâmetros da URL.
    setLocalSearchTerm(searchParams.get('query') || '');
    setFiltros({
      categoria: searchParams.get('categoria') || '',
      precoMin: searchParams.get('precoMin') || '',
      precoMax: searchParams.get('precoMax') || '',
      dataInicial: searchParams.get('dataInicial') || '',
      dataFinal: searchParams.get('dataFinal') || '',
    });

    // Constrói os parâmetros para a chamada da API diretamente de searchParams.
    const paramsForApi = {};
    for (const [key, value] of searchParams.entries()) {
      paramsForApi[key] = value;
    }

    const fetchItemsFromApi = async () => {
      try {
        // Faz a requisição ao backend com os parâmetros da URL
        const response = await axios.get('http://localhost:8080/buscar-itens', { params: paramsForApi });
        setItens(response.data);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
      }
    };

    fetchItemsFromApi();
  }, [searchParams]); // Dependência apenas em searchParams

  // Função para lidar com a mudança dos filtros na barra lateral.
  // Ela atualiza o estado local 'filtros'.
  const handleFilterChange = (novosFiltros) => {
    setFiltros(prevFiltros => ({ ...prevFiltros, ...novosFiltros }));
  };

  // Função para lidar com a busca local (na barra de pesquisa da página de listagem).
  // Ela aciona a atualização da URL e a busca.
  const handleLocalSearchSubmit = () => {
    handleApplySearchAndFilters();
  };

  return (
    <div className="itens-page">
      {/* Sidebar de filtros. Passa os filtros atuais e as funções de callback. */}
      <SidebarFilters
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplySearchAndFilters} // Função para disparar a busca ao clicar em "Aplicar"
        currentFilters={filtros} // Passa o estado atual dos filtros para o sidebar
      />
      <div className="main-content">
        <div className="search-bar-list-page"> {/* Barra de pesquisa na página de listagem */}
          <input
            type="text"
            placeholder="Pesquisar itens..."
            value={localSearchTerm} // Input controlado pelo estado local
            onChange={(e) => setLocalSearchTerm(e.target.value)} // Atualiza o estado local imediatamente
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLocalSearchSubmit(); // Dispara a busca ao pressionar Enter
              }
            }}
          />
          <button onClick={handleLocalSearchSubmit}>Buscar</button> {/* Dispara a busca ao clicar */}
        </div>
        <div className="listagem-itens">
          {itens.length === 0 ? (
            <p>Nenhum item encontrado com os critérios de busca e filtros aplicados.</p>
          ) : (
            itens.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default ItensList;
