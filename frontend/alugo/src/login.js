// alugo/frontend/alugo/src/login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './newItem.css'; // Para estilos de formulário e mensagens
import { ArrowLeft } from 'lucide-react'; // Importar ícone
import UserMenu from './UserMenu'; // Importa o componente de menu do usuário

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const res = await axios.post('http://localhost:8080/login', { email, senha });

      if (res.data && res.data.sucesso) {
        setMensagem('Login realizado com sucesso!');
        login(res.data.usuario);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMensagem(res.data.erro || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error("Erro na requisição de login:", err);
      if (err.response && err.response.data && err.response.data.erro) {
        setMensagem(err.response.data.erro);
      } else {
        setMensagem('Erro ao fazer login. Tente novamente.');
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
          <button className="outline" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Voltar para o Início
          </button>
        </div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" value={senha} onChange={e => setSenha(e.target.value)} required />

          <button type="submit" className="primary">Entrar</button>
        </form>
        {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}
        
        <p className="form-link">
          Não tem uma conta? <a href="/register">Cadastre-se aqui</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
