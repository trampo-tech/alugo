import React, { useState, useEffect } from 'react';
import './sidebar.css';

function SidebarFilters({ onFilterChange, onApplyFilters, currentFilters }) { // Recebe onApplyFilters e currentFilters
  // Estados locais para os inputs do sidebar, inicializados com os filtros atuais
  const [categoria, setCategoria] = useState(currentFilters.categoria || '');
  const [precoMin, setPrecoMin] = useState(currentFilters.precoMin || '');
  const [precoMax, setPrecoMax] = useState(currentFilters.precoMax || '');
  const [dataInicial, setDataInicial] = useState(currentFilters.dataInicial || '');
  const [dataFinal, setDataFinal] = useState(currentFilters.dataFinal || '');

  // Sincroniza os estados locais com as props 'currentFilters'.
  // Isso é importante se o currentFilters vier da URL (ex: navegação da home ou reset).
  useEffect(() => {
    setCategoria(currentFilters.categoria || '');
    setPrecoMin(currentFilters.precoMin || '');
    setPrecoMax(currentFilters.precoMax || '');
    setDataInicial(currentFilters.dataInicial || '');
    setDataFinal(currentFilters.dataFinal || '');
  }, [currentFilters]); // Dependência em currentFilters

  // Função chamada ao clicar em "Aplicar".
  const handleApplyClick = () => {
    // 1. Notifica o componente pai (ItensList) sobre as mudanças nos filtros.
    // Isso atualiza o estado 'filtros' dentro de ItensList.
    onFilterChange({ categoria, precoMin, precoMax, dataInicial, dataFinal });
    
    // 2. Dispara a função de aplicar busca e filtros no componente pai.
    // Esta função em ItensList vai atualizar os searchParams da URL e, consequentemente, buscar os dados.
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  return (
    <div className="sidebar-filters">
      <h2>Filtros</h2>

      <label>Categoria</label>
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="">Todas</option>
        <option value="ferramentas">Ferramentas</option>
        <option value="eletronicos">Eletrônicos</option>
        <option value="instrumentos">Instrumentos</option>
        <option value="viagem">Viagem</option>
      </select>

      <label>Preço mínimo (R$)</label>
      <input type="number" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />

      <label>Preço máximo (R$)</label>
      <input type="number" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />

      <label>Data Inicial:</label>
      <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />

      <label>Data Final:</label>
      <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />

      <button onClick={handleApplyClick}>Aplicar</button> {/* Botão para aplicar os filtros */}
    </div>
  );
}

export default SidebarFilters;
