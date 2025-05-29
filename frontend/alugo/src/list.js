import React, { useEffect, useState } from 'react';
import ItemCard from './card';         // 🔁 era '../components/ItemCard'
import SidebarFilters from './sidebar'; // 🔁 era '../components/SidebarFilters'
import './list.css';    
import axios from 'axios';
               // 🔁 era '../styles/ItensList.css'


function ItensList() {
  const [itens, setItens] = useState([]);
  const [filtros, setFiltros] = useState({ categoria: '', precoMin: '', precoMax: '' });

  useEffect(() => {
    const fetchItens = async () => {
      try {
        const response = await axios.get('http://localhost:8080/itens', { params: filtros });
        setItens(response.data);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
      }
    };

    fetchItens();
  }, [filtros]);

  return (
    <div className="itens-page">
      <SidebarFilters onFilterChange={setFiltros} />
      <div className="listagem-itens">
        {itens.length === 0 ? (
          <p>Nenhum item encontrado.</p>
        ) : (
          itens.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

export default ItensList;
