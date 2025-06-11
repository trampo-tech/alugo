// alugo/frontend/alugo/src/MyProductsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './list.css'; // Reutilizando estilos de listagem para cards
// Importar card.css para que os estilos de item-card sejam aplicados
import './card.css'; 

function MyProductsPage() {
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login'); // Redireciona se não estiver logado
      return;
    }

    const fetchMyItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user-items/${loggedInUser.id}`);
        setMyItems(response.data);
      } catch (error) {
        console.error('Erro ao buscar meus itens:', error);
        setMensagem('Erro ao carregar seus produtos.');
      }
    };

    fetchMyItems();
  }, [loggedInUser, navigate]);

  const handleAddNewProduct = () => {
    navigate('/novo-item');
  };

  // Função para navegar para a página de detalhes do item (para edição futura)
  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`); // Você pode criar uma rota específica para edição mais tarde, ex: /item/edit/:id
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja deletar este item? Esta ação é irreversível.')) {
      try {
        await axios.delete(`http://localhost:8080/itens/${itemId}`);
        setMensagem('Item deletado com sucesso!');
        setMyItems(myItems.filter(item => item.id !== itemId)); // Remove da lista
      } catch (error) {
        console.error('Erro ao deletar item:', error);
        setMensagem('Erro ao deletar item. Tente novamente.');
      }
    }
  };

  return (
    <div className="itens-page">
      <div className="sidebar-filters" style={{ width: 'unset', maxWidth: '280px' }}> {/* Ajuste para largura no mobile */}
        <h2>Meus Produtos</h2>
        <button className="primary" onClick={handleAddNewProduct}>Adicionar Novo Produto</button>
        {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
      </div>

      <div className="listagem-itens">
        {myItems.length === 0 ? (
          <p>Você não tem nenhum item cadastrado. Clique em "Adicionar Novo Produto" para começar!</p>
        ) : (
          myItems.map((item) => (
            <div key={item.id} className="item-card"> {/* Usa item-card de card.css */}
              {item.imagem_id ? (
                <img
                  src={`http://localhost:8080/imagem/${item.imagem_id}`}
                  alt={item.titulo}
                  className="item-image"
                />
              ) : (
                <div className="item-image-placeholder">N/A</div>
              )}
              <h3>{item.titulo}</h3>
              <p className="item-preco">R${parseFloat(item.preco_diario).toFixed(2).replace('.', ',')}/dia</p>
              
              {/* Contêiner para os botões Editar/Deletar */}
              <div className="card-buttons-container">
                {/* Opcional: botão de "Ver detalhes" que leva para a página do produto */}
                <button className="btn-detalhes" onClick={() => handleItemClick(item.id)}>Ver Detalhes</button>
                <button className="btn-detalhes danger" onClick={() => handleDeleteItem(item.id)}>Deletar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyProductsPage;