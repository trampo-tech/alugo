// alugo/frontend/alugo/src/ProductDetailsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { CartContext } from './CartContext'; // Importar CartContext
import './App.css';
import './newItem.css';
import './ProductDetailsPage.css';
import './card.css';
import { ArrowLeft } from 'lucide-react';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useContext(UserContext);
  const { addToCart } = useContext(CartContext); // Usar addToCart do contexto

  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensagem, setMensagem] = useState(''); // Mensagem para adicionar ao carrinho

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/itens/${id}`);
        setItem(response.data.item);
        setOwner(response.data.owner);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar detalhes do produto:", err);
        setError("Não foi possível carregar os detalhes do produto.");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => { // Função para adicionar ao carrinho
    setMensagem('');

    if (!loggedInUser) {
      setMensagem('Você precisa estar logado para adicionar itens ao carrinho.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (item.status !== 'disponivel') {
      setMensagem('Este item não está disponível para aluguel no momento.');
      return;
    }

    if (!dataInicio || !dataFim) {
      setMensagem('Por favor, selecione as datas de início e fim do aluguel.');
      return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    if (inicio < hoje) {
      setMensagem('A data de início não pode ser no passado.');
      return;
    }
    if (fim <= inicio) {
      setMensagem('A data de fim deve ser posterior à data de início.');
      return;
    }

    // Adiciona o item ao carrinho
    addToCart({
      item_id: item.id,
      titulo: item.titulo,
      preco_diario: item.preco_diario,
      imagem_id: item.imagem_id,
      locador_id: owner.id,
      locador_nome: owner.nome,
      data_inicio: dataInicio,
      data_fim: dataFim
    });

    setMensagem('Item adicionado ao carrinho com sucesso!');
    // Opcional: Limpar as datas ou redirecionar
    setDataInicio('');
    setDataFim('');
  };

  if (loading) {
    return <div className="product-details-container loading">Carregando detalhes do produto...</div>;
  }

  if (error) {
    return <div className="product-details-container error">{error}</div>;
  }

  if (!item) {
    return <div className="product-details-container not-found">Produto não encontrado.</div>;
  }

  const isOwner = loggedInUser && loggedInUser.id === owner.id;
  const canAddToCart = item.status === 'disponivel' && !isOwner;

  return (
    <div className="product-details-container">
      <div className="back-button-container">
        <button className="outline" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Voltar para o Início
        </button>
      </div>

      <div className="product-details-card">
        {item.imagem_id ? (
          <img
            src={`http://localhost:8080/imagem/${item.imagem_id}`}
            alt={item.titulo}
            className="product-details-image"
          />
        ) : (
          <div className="item-image-placeholder product-details-image-placeholder">Imagem Indisponível</div>
        )}

        <div className="product-info">
          <h1>{item.titulo}</h1>
          <p className="product-category">Categoria: {item.categoria}</p>
          <p className="product-description">{item.descricao}</p>
          <p className="product-price">Preço Diário: <span>R${parseFloat(item.preco_diario).toFixed(2).replace('.', ',')}</span></p>
          <p className={`product-status status-${item.status}`}>Disponibilidade: {item.status === 'disponivel' ? 'Disponível' : (item.status === 'alugado' ? 'Alugado' : 'Indisponível')}</p>
          {item.condicoes_uso && <p className="product-conditions">Condições de Uso: {item.condicoes_uso}</p>}

          {isOwner ? (
            <p className="feedback-message error">Você é o proprietário deste item.</p>
          ) : (
            <>
              <div className="rental-dates-selection">
                <label htmlFor="dataInicio">Data de Início:</label>
                <input
                  type="date"
                  id="dataInicio"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />

                <label htmlFor="dataFim">Data de Fim:</label>
                <input
                  type="date"
                  id="dataFim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  min={dataInicio || new Date().toISOString().split('T')[0]}
                />
              </div>

              <button
                className="primary"
                onClick={handleAddToCart} // Chamada para adicionar ao carrinho
                disabled={!canAddToCart || !dataInicio || !dataFim}
              >
                {canAddToCart ? 'Adicionar ao Carrinho' : 'Indisponível para Carrinho'} {/* Texto do botão */}
              </button>
            </>
          )}

          {mensagem && (
            <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>
              {mensagem}
            </p>
          )}
        </div>
      </div>

      {owner && (
        <div className="owner-info-card">
          <h2>Informações do Proprietário</h2>
          <p>Nome: <span>{owner.nome}</span></p>
          <p>Telefone: <span>{owner.telefone || 'Não informado'}</span></p>
          <p>Email: <span>{owner.email}</span></p>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsPage;
