// alugo/frontend/alugo/src/CartPage.js
import React, { useContext, useState } from 'react'; // Importar useState para mensagens
import { CartContext } from './CartContext';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios
import { ArrowLeft, Trash2 } from 'lucide-react';
import './CartPage.css';
import './list.css';
import './newItem.css'; // Para estilos de mensagem de feedback

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [mensagemCheckout, setMensagemCheckout] = useState(''); // Estado para mensagens de checkout

  const calculateTotalCartValue = () => {
    return cartItems.reduce((total, item) => {
      const inicio = new Date(item.data_inicio);
      const fim = new Date(item.data_fim);
      const diffTime = Math.abs(fim.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return total + (parseFloat(item.preco_diario) * diffDays);
    }, 0).toFixed(2).replace('.', ',');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleCheckout = async () => { // Tornar assíncrona
    setMensagemCheckout(''); // Limpa mensagens anteriores

    if (!loggedInUser) {
      setMensagemCheckout('Você precisa estar logado para finalizar o aluguel.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (cartItems.length === 0) {
      setMensagemCheckout('Seu carrinho está vazio. Adicione itens para alugar!');
      return;
    }

    try {
      // Enviar os itens do carrinho para o backend para processamento
      const response = await axios.post('http://localhost:8080/checkout-cart', {
        items: cartItems,
        locatario_id: loggedInUser.id,
      });

      if (response.data && response.data.sucesso) {
        let successCount = response.data.pedidos_criados.length;
        let failCount = response.data.erros.length;
        let finalMessage = `Checkout concluído! ${successCount} pedido(s) criado(s).`;
        
        if (failCount > 0) {
          finalMessage += ` ${failCount} item(ns) não puderam ser alugados.`;
          // Mostrar detalhes dos erros, se necessário
          response.data.erros.forEach(err => console.error(`Erro no item ${err.item_id}: ${err.erro}`));
        }
        
        setMensagemCheckout(finalMessage);
        clearCart(); // Limpa o carrinho após o checkout
        setTimeout(() => {
          navigate('/my-rentals'); // Redireciona para a página de meus aluguéis
        }, 2000);

      } else {
        setMensagemCheckout(response.data.erro || 'Erro ao finalizar aluguel. Tente novamente.');
      }

    } catch (error) {
      console.error('Erro ao finalizar aluguel:', error.response?.data || error.message);
      setMensagemCheckout(error.response?.data?.erro || 'Erro na requisição de checkout. Tente novamente.');
    }
  };

  return (
    <div className="itens-page cart-page-container">
      <div className="back-button-container">
        <button className="outline" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Voltar para o Início
        </button>
      </div>

      <h2>Seu Carrinho ({cartItems.length} itens)</h2>
      {mensagemCheckout && (
        <p className={mensagemCheckout.includes('sucesso') || mensagemCheckout.includes('concluído') ? 'feedback-message success' : 'feedback-message error'}>
          {mensagemCheckout}
        </p>
      )}

      {cartItems.length === 0 ? (
        <p>Seu carrinho está vazio. Adicione itens para alugar!</p>
      ) : (
        <>
          <div className="listagem-itens">
            {cartItems.map((item) => (
              <div key={`${item.item_id}-${item.data_inicio}-${item.data_fim}`} className="item-card cart-item-card">
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
                <p>De: <span>{formatDate(item.data_inicio)}</span></p>
                <p>Até: <span>{formatDate(item.data_fim)}</span></p>
                <p>Proprietário: <span>{item.locador_nome}</span></p>
                
                <div className="card-buttons-container">
                  <button 
                    className="btn-detalhes danger" 
                    onClick={() => removeFromCart(item.item_id, item.data_inicio, item.data_fim)}
                  >
                    <Trash2 size={16} /> Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Valor Total do Carrinho: R${calculateTotalCartValue()}</h3>
            <button className="primary" onClick={handleCheckout}>
              Finalizar Aluguel
            </button>
            <button className="outline" onClick={clearCart} style={{marginLeft: '10px'}}>
              Limpar Carrinho
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
