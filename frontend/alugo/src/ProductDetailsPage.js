// alugo/frontend/alugo/src/ProductDetailsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './App.css';
import './newItem.css'; // Para estilos de botão/feedback message
import './ProductDetailsPage.css';
import './card.css'; // Para estilos do item-image-placeholder
import { ArrowLeft } from 'lucide-react'; // Importar ícone

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useContext(UserContext);

  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensagemAluguel, setMensagemAluguel] = useState('');

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

  const handleAlugar = async () => {
    setMensagemAluguel('');

    if (!loggedInUser) {
      setMensagemAluguel('Você precisa estar logado para alugar um item.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (item.status !== 'disponivel') {
      setMensagemAluguel('Este item não está disponível para aluguel no momento.');
      return;
    }

    if (!dataInicio || !dataFim) {
      setMensagemAluguel('Por favor, selecione as datas de início e fim do aluguel.');
      return;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    if (inicio < hoje) {
      setMensagemAluguel('A data de início não pode ser no passado.');
      return;
    }
    if (fim <= inicio) {
      setMensagemAluguel('A data de fim deve ser posterior à data de início.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/rentals', {
        item_id: item.id,
        locatario_id: loggedInUser.id,
        locador_id: owner.id,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });

      if (response.data && response.data.sucesso) {
        setMensagemAluguel(response.data.mensagem);
        setDataInicio('');
        setDataFim('');
      } else {
        setMensagemAluguel(response.data.erro || 'Erro ao solicitar aluguel. Tente novamente.');
      }
    } catch (err) {
      console.error("Erro na requisição de aluguel:", err.response?.data || err.message);
      setMensagemAluguel(err.response?.data?.erro || 'Erro ao solicitar aluguel. Verifique as datas ou tente novamente.');
    }
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
  const canRent = item.status === 'disponivel' && !isOwner;

  return (
    <div className="product-details-container">
      {/* Botão de Voltar */}
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
                onClick={handleAlugar}
                disabled={!canRent || !dataInicio || !dataFim}
              >
                {canRent ? 'Alugar Agora' : 'Indisponível para Aluguel'}
              </button>
            </>
          )}

          {mensagemAluguel && (
            <p className={mensagemAluguel.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>
              {mensagemAluguel}
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
