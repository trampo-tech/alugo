// alugo/frontend/alugo/src/newItem.js
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './newItem.css'; // Estilos específicos do formulário
import './App.css'; // Estilos gerais, se necessário
import { UserContext } from './UserContext'; // Para obter o usuario_id
import { ArrowLeft } from 'lucide-react'; // Importar ícone
import UserMenu from './UserMenu'; // Importa o componente de menu do usuário

function NovoItem() {
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precoDiario, setPrecoDiario] = useState('');
  const [condicoesUso, setCondicoesUso] = useState('');
  const [imagem, setImagem] = useState(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login');
    }
  }, [loggedInUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!loggedInUser) {
      setMensagem('Você precisa estar logado para adicionar um item.');
      return;
    }

    if (!titulo || !precoDiario || !imagem) {
      setMensagem('Título, preço diário e imagem são campos obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('preco_diario', precoDiario);
    formData.append('condicoes_uso', condicoesUso);
    formData.append('imagem', imagem);
    formData.append('usuario_id', loggedInUser.id);

    try {
      const res = await axios.post('http://localhost:8080/novo-item', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.message) {
        setMensagem('Item cadastrado com sucesso!');
        setTitulo('');
        setDescricao('');
        setCategoria('');
        setPrecoDiario('');
        setCondicoesUso('');
        setImagem(null);
        setTimeout(() => navigate('/my-products'), 1500);
      } else {
        setMensagem('Erro ao cadastrar item. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setMensagem(err.response.data.error);
      } else {
        setMensagem('Erro ao conectar com o servidor para cadastrar o item.');
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">ALUGO</div>
        <div className="header-buttons">
          <UserMenu />
        </div>
      </header>
      <div className="novoitem-container">
        {/* Botão de Voltar */}
        <div className="back-button-container">
          <button className="outline" onClick={() => navigate('/my-products')}>
            <ArrowLeft size={20} /> Voltar para Meus Produtos
          </button>
        </div>
        <h2>Adicionar Novo Item</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="titulo">Título:</label>
          <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

          <label htmlFor="descricao">Descrição:</label>
          <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}></textarea>

          <label htmlFor="categoria">Categoria:</label>
          <input type="text" id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />

          <label htmlFor="precoDiario">Preço Diário (R$):</label>
          <input type="number" id="precoDiario" value={precoDiario} onChange={(e) => setPrecoDiario(e.target.value)} step="0.01" required />

          <label htmlFor="condicoesUso">Condições de Uso:</label>
          <textarea id="condicoesUso" value={condicoesUso} onChange={(e) => setCondicoesUso(e.target.value)}></textarea>

          <label htmlFor="imagem">Imagem do Item:</label>
          <input type="file" id="imagem" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} required />

          <button type="submit" className="primary">Cadastrar Item</button>
        </form>
        {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
    
      </div>
    </div>  
  );
}

export default NovoItem;
