// alugo/frontend/alugo/src/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './newItem.css'; // Reusing form styling

function ProfilePage() {
  const { loggedInUser, login } = useContext(UserContext);
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Only for changing password
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    // Fetch user data from backend
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
      if (senha) { // Only send password if it's being changed
        updateData.senha = senha;
      }

      const response = await axios.put(`http://localhost:8080/profile/${loggedInUser.id}`, updateData);

      if (response.data && response.data.sucesso) {
        setMensagem('Perfil atualizado com sucesso!');
        // Update user context with new data (if necessary, though not changing ID/email usually)
        login({ ...loggedInUser, nome, email, telefone, endereco }); // Update local storage
        // Optionally clear password field after update
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
    <div className="novoitem-container">
      <h2>Gerenciar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Nova Senha (deixe em branco para não alterar):</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        <label>Telefone:</label>
        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

        <label>Endereço:</label>
        <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} />

        <button type="submit">Salvar Alterações</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default ProfilePage;