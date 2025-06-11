// alugo/frontend/alugo/src/MyRentalsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './list.css'; // Reutilizando estilos de listagem para cards
import './MyRentalsPage.css'; // Novo arquivo CSS específico para esta página
import './card.css'; // Importa card.css para que os estilos de item-card sejam aplicados

function MyRentalsPage() {
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login'); // Redireciona se não estiver logado
      return;
    }

    const fetchMyRentals = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/my-rentals/${loggedInUser.id}`);
        setMyRentals(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar meus aluguéis:', err);
        setError('Não foi possível carregar seus aluguéis. Verifique se a tabela `pedidos` existe no banco de dados e está populada.');
        setLoading(false);
      }
    };

    fetchMyRentals();
  }, [loggedInUser, navigate]);

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`); // Navega para a página de detalhes do item alugado
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data Inválida';
      }
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('pt-BR', options);
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return 'Erro de Formato';
    }
  };

  if (loading) {
    return <div className="itens-page">Carregando seus aluguéis...</div>;
  }

  if (error) {
    return <div className="itens-page feedback-message error">{error}</div>;
  }

  return (
    <div className="itens-page my-rentals-page">
      <h2>Meus Aluguéis</h2>
      {myRentals.length === 0 ? (
        <p>Você não possui aluguéis registrados no momento.</p>
      ) : (
        <div className="listagem-itens">
          {myRentals.map((rental) => (
            <div key={rental.pedido_id} className="item-card rental-card" onClick={() => handleItemClick(rental.item_id)} style={{ cursor: 'pointer' }}>
              {rental.item_imagem_id ? (
                <img
                  src={`http://localhost:8080/imagem/${rental.item_imagem_id}`}
                  alt={rental.item_titulo}
                  className="item-image"
                />
              ) : (
                <div className="item-image-placeholder">Imagem Indisponível</div>
              )}
              <h3>{rental.item_titulo}</h3>
              <p className="rental-dates">
                De: <span>{formatDate(rental.data_inicio)}</span> <br/>
                Até: <span>{formatDate(rental.data_fim)}</span>
              </p>
              <p className="rental-value">Total: <span>R${parseFloat(rental.valor_total).toFixed(2).replace('.', ',')}</span></p>
              <p className={`rental-status status-${rental.pedido_status}`}>Status: {rental.pedido_status}</p>
              <div className="locador-info">
                <h4>Proprietário do Item:</h4>
                <p>Nome: {rental.locador_nome}</p>
                <p>Email: {rental.locador_email}</p>
                <p>Tel: {rental.locador_telefone || 'Não informado'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRentalsPage;