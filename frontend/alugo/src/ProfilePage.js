// alugo/frontend/alugo/src/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './newItem.css'; // Reutilizando o estilo do formulário
import { ArrowLeft } from 'lucide-react'; // Importar ícone
import UserMenu from './UserMenu'; // Importa o componente de menu do usuário

function ProfilePage() {
  const { loggedInUser, login } = useContext(UserContext);
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Apenas para alterar a senha
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login');
      return;
    }

    axios.get(`http://localhost:8080/profile/${loggedInUser.id}`)
      .then(response => {
        const userData = response.data;
        setNome(userData.nome || '');
        setEmail(userData.email || '');
        setTelefone(userData.telefone || '');
        setEndereco(userData.endereco || '');
      })
      .catch(error => {
        console.error('Erro ao buscar dados do perfil:', error);
        setMensagem('Erro ao carregar seus dados.');
      });
  }, [loggedInUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const updateData = { nome, email, telefone, endereco };
      if (senha) {
        updateData.senha = senha;
      }

      const response = await axios.put(`http://localhost:8080/profile/${loggedInUser.id}`, updateData);

      if (response.data && response.data.sucesso) {
        setMensagem('Perfil atualizado com sucesso!');
        login({ ...loggedInUser, nome, email, telefone, endereco });
        setSenha('');
      } else {
        setMensagem(response.data.erro || 'Erro ao atualizar perfil.');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      setMensagem('Erro ao atualizar perfil. Tente novamente.');
    }
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
      <div className="novoitem-container">
        {/* Botão de Voltar */}
        <div className="back-button-container">
          <button className="outline" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Voltar para o Início
          </button>
        </div>
        <h2>Gerenciar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome:</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="senha">Nova Senha (deixe em branco para não alterar):</label>
          <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} />

          <label htmlFor="telefone">Telefone:</label>
          <input type="text" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

          <label htmlFor="endereco">Endereço:</label>
          <textarea id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

          <button type="submit" className="primary">Salvar Alterações</button>
        </form>
        {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
      </div>
    </div>
  );
}

export default ProfilePage;
