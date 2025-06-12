// alugo/frontend/alugo/src/MyProductsPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './list.css';
import './card.css';
import './MyProductsPage.css';

function MyProductsPage() {
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [incomingRentals, setIncomingRentals] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingRentals, setLoadingRentals] = useState(true);

  const fetchData = useCallback(async () => {
    if (!loggedInUser) {
      navigate('/login');
      return;
    }

    setLoadingItems(true);
    setLoadingRentals(true);
    setMensagem('');

    console.log('--- Iniciando busca de dados para o usuário:', loggedInUser.id, '---');

    try {
      const itemsResponse = await axios.get(`http://localhost:8080/user-items/${loggedInUser.id}`);
      setMyItems(itemsResponse.data);
      console.log('Meus Itens Cadastrados:', itemsResponse.data);
    } catch (error) {
      console.error('Erro ao buscar meus itens:', error);
      setMensagem('Erro ao carregar seus produtos.');
    } finally {
      setLoadingItems(false);
    }

    try {
      const rentalsResponse = await axios.get(`http://localhost:8080/my-product-rentals/${loggedInUser.id}`);
      // Filtrar para mostrar apenas 'pendente' e 'em_andamento'
      const filteredRentals = rentalsResponse.data.filter(rental =>
        rental.pedido_status === 'pendente' || rental.pedido_status === 'em_andamento'
      );
      setIncomingRentals(filteredRentals);
      console.log('Pedidos de Aluguel Recebidos (locador):', filteredRentals);
      console.log('Número de Pedidos Filtrados:', filteredRentals.length);

    } catch (error) {
      console.error('Erro ao buscar pedidos recebidos:', error);
    } finally {
      setLoadingRentals(false);
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNewProduct = () => {
    navigate('/novo-item');
  };

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja deletar este item? Esta ação é irreversível.')) {
      try {
        await axios.delete(`http://localhost:8080/itens/${itemId}`);
        setMensagem('Item deletado com sucesso!');
        fetchData(); // Recarrega todas as listas
      } catch (error) {
        console.error('Erro ao deletar item:', error);
        setMensagem('Erro ao deletar item. Tente novamente.');
      }
    }
  };

  const handleApproveRental = async (pedidoId, item_id) => {
    if (window.confirm('Tem certeza que deseja aprovar este aluguel?')) {
      try {
        const response = await axios.put(`http://localhost:8080/pedidos/${pedidoId}/approve`, { item_id });
        if (response.data.sucesso) {
          setMensagem(`Aluguel ${pedidoId} aprovado com sucesso!`);
          fetchData(); // Recarrega todas as listas após a aprovação
        } else {
          setMensagem(response.data.erro || 'Erro ao aprovar aluguel.');
        }
      } catch (error) {
        console.error('Erro ao aprovar aluguel:', error.response?.data || error.message);
        setMensagem('Erro ao aprovar aluguel. Tente novamente.');
      }
    }
  };

  const handleRejectRental = async (pedidoId, item_id) => {
    if (window.confirm('Tem certeza que deseja rejeitar este aluguel?')) {
      try {
        const response = await axios.put(`http://localhost:8080/pedidos/${pedidoId}/reject`, { item_id });
        if (response.data.sucesso) {
          setMensagem(`Aluguel ${pedidoId} rejeitado com sucesso!`);
          fetchData(); // Recarrega todas as listas após a rejeição
        } else {
          setMensagem(response.data.erro || 'Erro ao rejeitar aluguel.');
        }
      } catch (error) {
        console.error('Erro ao rejeitar aluguel:', error.response?.data || error.message);
        setMensagem('Erro ao rejeitar aluguel. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="itens-page my-products-page-container">
      <div className="sidebar-filters" style={{ width: 'unset', maxWidth: '280px' }}>
        <h2>Meus Produtos</h2>
        <button className="primary" onClick={handleAddNewProduct}>Adicionar Novo Produto</button>
        {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
      </div>

      <div className="main-content">
        <section className="my-items-section">
          <h3>Itens Cadastrados por Mim</h3>
          {loadingItems ? (
            <p>Carregando seus itens...</p>
          ) : myItems.length === 0 ? (
            <p>Você não tem nenhum item cadastrado. Clique em "Adicionar Novo Produto" para começar!</p>
          ) : (
            <div className="listagem-itens">
              {myItems.map((item) => (
                <div key={item.id} className="item-card">
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
                  <p className={`product-status status-${item.status}`}>{item.status}</p>
                  <div className="card-buttons-container">
                    <button className="btn-detalhes" onClick={() => handleItemClick(item.id)}>Ver Detalhes</button>
                    <button className="btn-detalhes danger" onClick={() => handleDeleteItem(item.id)}>Deletar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="incoming-rentals-section">
          <h3>Pedidos de Aluguel Recebidos</h3>
          {loadingRentals ? (
            <p>Carregando pedidos...</p>
          ) : incomingRentals.length === 0 ? (
            <p>Nenhum pedido de aluguel recebido para seus itens com status pendente ou em andamento.</p>
          ) : (
            <div className="listagem-itens">
              {incomingRentals.map((rental) => (
                <div key={rental.pedido_id} className="item-card rental-request-card">
                  {rental.item_imagem_id ? (
                    <img
                      src={`http://localhost:8080/imagem/${rental.item_imagem_id}`}
                      alt={rental.item_titulo}
                      className="item-image"
                    />
                  ) : (
                    <div className="item-image-placeholder">N/A</div>
                  )}
                  <h3>{rental.item_titulo}</h3>
                  <p>De: <strong>{rental.locatario_nome}</strong></p>
                  <p>Período: {formatDate(rental.data_inicio)} a {formatDate(rental.data_fim)}</p>
                  <p>Valor: R$ {parseFloat(rental.valor_total).toFixed(2).replace('.', ',')}</p>
                  <p className={`rental-status status-${rental.pedido_status}`}>Status: {rental.pedido_status}</p>

                  {rental.pedido_status === 'pendente' && (
                    <div className="card-buttons-container">
                      <button className="btn-detalhes primary" onClick={() => handleApproveRental(rental.pedido_id, rental.item_id)}>Aprovar</button>
                      <button className="btn-detalhes danger" onClick={() => handleRejectRental(rental.pedido_id, rental.item_id)}>Rejeitar</button>
                    </div>
                  )}
                  {/* Se o pedido não for pendente, mas estiver em andamento, não mostra os botões de ação */}
                  {rental.pedido_status === 'em_andamento' && (
                    <p className="feedback-message success" style={{width: '100%', marginTop: 'auto', marginBottom: '10px'}}>Este pedido foi aprovado.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyProductsPage;
