import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

function LoginPage({ onLoginSuccess }) { // Adicione onLoginSuccess como prop
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate(); // Inicialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const res = await axios.post('http://localhost:8080/login', { email, senha }); // Envio para a rota de login do backend

      if (res.data && res.data.sucesso) {
        setMensagem('Login realizado com sucesso!');
        // Armazenar informações do usuário no localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(res.data.usuario));
        
        // Chamar a função de callback passada via props
        if (onLoginSuccess) {
          onLoginSuccess(res.data.usuario);
        }

        // Redirecionar para a página principal após o login bem-sucedido
        navigate('/'); // Redireciona para a rota raiz
      } else {
        setMensagem(res.data.erro || 'Credenciais inválidas');
      }
    } catch (err) {
      console.error("Erro na requisição de login:", err);
      setMensagem('Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="novoitem-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Senha:</label>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />

        <button type="submit">Entrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default LoginPage;