import React, { useState } from 'react';
import './sidebar.css';

function SidebarFilters({ onFilterChange }) {
  const [categoria, setCategoria] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');

  const aplicarFiltros = () => {
    onFilterChange({ categoria, precoMin, precoMax });
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

      <button className="primary" onClick={aplicarFiltros}>Aplicar</button> {/* Adicionada classe primary */}
    </div>
  );
}

export default SidebarFilters;
