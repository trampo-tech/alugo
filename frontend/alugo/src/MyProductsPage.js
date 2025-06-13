// alugo/frontend/alugo/src/MyProductsPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import ConfirmationModal from './components/ConfirmationModal';
import './list.css';
import './card.css';
import './MyProductsPage.css';
import { ArrowLeft } from 'lucide-react';
import UserMenu from './UserMenu';


function MyProductsPage() {
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [incomingRentals, setIncomingRentals] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingRentals, setLoadingRentals] = useState(true);

  // Estados para o modal de confirmação
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'approve', 'reject' ou 'delete'
  const [currentPedidoId, setCurrentPedidoId] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);

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

  // handleDeleteItem agora apenas configura o modal
  const handleDeleteItem = (itemId) => {
    setModalMessage('Tem certeza que deseja deletar este item? Esta ação é irreversível.');
    setModalAction('delete');
    setCurrentItemId(itemId);
    setShowModal(true);
  };

  // handleApproveRental e handleRejectRental permanecem como estão (chamam o modal)
  const handleApproveRental = (pedidoId, item_id) => {
    setModalMessage('Você confirma a aprovação deste aluguel? Esta ação tornará o item alugado para o período selecionado.');
    setModalAction('approve');
    setCurrentPedidoId(pedidoId);
    setCurrentItemId(item_id);
    setShowModal(true);
  };

  const handleRejectRental = (pedidoId, item_id) => {
    setModalMessage('Você confirma a rejeição deste aluguel? Esta ação manterá o item disponível.');
    setModalAction('reject');
    setCurrentPedidoId(pedidoId);
    setCurrentItemId(item_id);
    setShowModal(true);
  };

  // Função única para confirmar qualquer ação do modal
  const confirmAction = async () => {
    setShowModal(false); // Esconde o modal

    if (modalAction === 'delete' && currentItemId) {
      try {
        await axios.delete(`http://localhost:8080/itens/${currentItemId}`);
        setMensagem('Item deletado com sucesso!');
        fetchData(); // Recarrega todas as listas
      } catch (error) {
        console.error('Erro ao deletar item:', error);
        setMensagem('Erro ao deletar item. Tente novamente.');
      } finally {
        setCurrentItemId(null); // Limpa o ID atual
      }
    } else if (modalAction === 'approve' && currentPedidoId && currentItemId) {
      try {
        const response = await axios.put(`http://localhost:8080/pedidos/${currentPedidoId}/approve`, { item_id: currentItemId });
        if (response.data.sucesso) {
          setMensagem(`Aluguel ${currentPedidoId} aprovado com sucesso!`);
          fetchData();
        } else {
          setMensagem(response.data.erro || 'Erro ao aprovar aluguel.');
        }
      } catch (error) {
        console.error('Erro ao aprovar aluguel:', error.response?.data || error.message);
        setMensagem('Erro ao aprovar aluguel. Tente novamente.');
      }
    } else if (modalAction === 'reject' && currentPedidoId && currentItemId) {
      try {
        const response = await axios.put(`http://localhost:8080/pedidos/${currentPedidoId}/reject`, { item_id: currentItemId });
        if (response.data.sucesso) {
          setMensagem(`Aluguel ${currentPedidoId} rejeitado com sucesso!`);
          fetchData();
        } else {
          setMensagem(response.data.erro || 'Erro ao rejeitar aluguel.');
        }
      } catch (error) {
        console.error('Erro ao rejeitar aluguel:', error.response?.data || error.message);
        setMensagem('Erro ao rejeitar aluguel. Tente novamente.');
      }
    }

    // Limpa os estados do modal após a ação
    setCurrentPedidoId(null);
    setCurrentItemId(null);
    setModalAction(null);
  };

  const cancelAction = () => {
    setShowModal(false);
    // Limpa os estados do modal mesmo se cancelar
    setCurrentPedidoId(null);
    setCurrentItemId(null);
    setModalAction(null);
    setMensagem('Ação cancelada.');
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="app">
      <header className="header">
        <div
          className="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
          title="Voltar para o início"
          >
            ALUGO
          </div>
        <div className="header-buttons">
          <UserMenu />
        </div>
      </header>
      <div className="itens-page my-products-page-container">
        <div className="back-button-container">
          <button className="outline" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Voltar para o Início
          </button>
        </div>

        <div className="my-products-main-content-wrapper">
          <div className="sidebar-filters" style={{ width: 'unset', maxWidth: '280px' }}>
            <h2>Meus Produtos</h2>
            <button className="primary" onClick={handleAddNewProduct}>Adicionar Novo Produto</button>
            {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
          </div>

          <div className="main-content">
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
                      {rental.pedido_status === 'em_andamento' && (
                        <p className="feedback-message success" style={{width: '100%', marginTop: 'auto', marginBottom: '10px'}}>Este pedido foi aprovado.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
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

            
          </div>
        </div>

        {showModal && (
          <ConfirmationModal 
            message={modalMessage}
            onConfirm={confirmAction}
            onCancel={cancelAction}
            confirmText={modalAction === 'delete' ? 'Sim, Deletar' : (modalAction === 'approve' ? 'Sim, Aprovar' : 'Sim, Rejeitar')}
            cancelText="Não, Cancelar"
          />
        )}
      </div>
    </div>
  );
}

export default MyProductsPage;
