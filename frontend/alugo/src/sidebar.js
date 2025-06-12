// alugo/frontend/alugo/src/sidebar.js
import React, { useState, useEffect } from 'react';
import './sidebar.css';
import './list.css'; // Reutilizando para os estilos gerais da sidebar-filters

function SidebarFilters({ onFilterChange, currentFilters }) {
  const [categoria, setCategoria] = useState(currentFilters.categoria || '');
  const [precoMin, setPrecoMin] = useState(currentFilters.precoMin || '');
  const [precoMax, setPrecoMax] = useState(currentFilters.precoMax || '');
  const [dataInicial, setDataInicial] = useState(currentFilters.dataInicial || '');
  const [dataFinal, setDataFinal] = useState(currentFilters.dataFinal || '');
  const [status, setStatus] = useState(currentFilters.status || ''); // Novo estado para status

  // Sincroniza os estados internos com os filtros recebidos de `list.js`
  useEffect(() => {
    setCategoria(currentFilters.categoria || '');
    setPrecoMin(currentFilters.precoMin || '');
    setPrecoMax(currentFilters.precoMax || '');
    setDataInicial(currentFilters.dataInicial || '');
    setDataFinal(currentFilters.dataFinal || '');
    setStatus(currentFilters.status || ''); // Sincroniza o status
  }, [currentFilters]);


  const aplicarFiltros = (e) => {
    e.preventDefault();
    // Passa todos os filtros, incluindo o novo status
    onFilterChange({ categoria, precoMin, precoMax, dataInicial, dataFinal, status });
  };

  return (
    <div className="sidebar-filters">
      <h2>Filtros</h2>
      <form onSubmit={aplicarFiltros}>
        <label htmlFor="categoria">Categoria</label>
        <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          <option value="eletro">Eletro</option>
          <option value="videogame">Videogame</option>
          <option value="dasdf">Dasdf</option>
          <option value="udsnfian">Udsnfian</option>
        </select>

        <label htmlFor="precoMin">Preço mínimo (R$)</label>
        <input type="number" id="precoMin" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />

        <label htmlFor="precoMax">Preço máximo (R$)</label>
        <input type="number" id="precoMax" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />

        <label htmlFor="dataInicial">Data Inicial</label>
        <input type="date" id="dataInicial" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />

        <label htmlFor="dataFinal">Data Final</label>
        <input type="date" id="dataFinal" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />

        {/* Novo campo de filtro para Status */}
        <label htmlFor="status">Disponibilidade</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="disponivel">Disponível</option>
          <option value="alugado">Alugado</option>
          <option value="inativo">Inativo</option>
          {/* Adicione outros status se houver no seu ENUM do DB */}
        </select>

        <button type="submit" className="primary">Aplicar Filtros</button>
      </form>
    </div>
  );
}

export default SidebarFilters;
