import React from 'react';
import './card.css'; // ✅ precisa do "./"
import { MapPin, Calendar } from 'lucide-react';

function ItemCard({ item }) {
  return (
    <div className="item-card">
        <img
        src={`http://localhost:8080/imagem/${item.imagem_id}`}
        alt={item.titulo}
        className="item-image"
        />
      <h3>{item.nome}</h3>
      <p className="item-preco">R${item.preco}/dia</p>
      
      <div className="item-info">
        <MapPin size={16} /> <span>{item.cidade}, {item.estado}</span>
      </div>

      <div className="item-info">
        <Calendar size={16} /> <span>{item.data_ini} até {item.data_fim}</span>
      </div>

      <button className="btn-detalhes">Ver detalhes</button>
    </div>
  );
}

export default ItemCard;
