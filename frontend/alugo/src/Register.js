import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './newItem.css'; // Reutilizando o CSS para layout de formulário

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('ambos'); // Valor padrão
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await axios.post('http://localhost:8080/register', {
        nome,
        email,
        senha,
        telefone,
        cpf,
        data_nascimento: dataNascimento, // Garanta que o formato seja YYYY-MM-DD
        genero,
        tipo_usuario: tipoUsuario,
        // foto_perfil e endereco não estão no formulário inicial, mas podem ser adicionados
        // status e data_criacao serão definidos no backend (DEFAULT CURRENT_TIMESTAMP)
        // ultimo_login também será definido no backend
      });

      if (response.data && response.data.sucesso) {
        setMensagem('Cadastro realizado com sucesso! Você pode fazer login agora.');
        // Limpar o formulário
        setNome('');
        setEmail('');
        setSenha('');
        setTelefone('');
        setCpf('');
        setDataNascimento('');
        setGenero('');
        setTipoUsuario('ambos');
        // Opcional: redirecionar para a página de login
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Redireciona após 2 segundos
      } else {
        setMensagem(response.data.erro || 'Erro ao cadastrar usuário.');
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error.response?.data || error.message);
      setMensagem('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="novoitem-container"> {/* Reutilizando o estilo do newItem */}
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Senha:</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />

        <label>Telefone:</label>
        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

        <label>CPF:</label>
        <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Ex: 123.456.789-00" />

        <label>Data de Nascimento:</label>
        <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />

        <label>Gênero:</label>
        <select value={genero} onChange={(e) => setGenero(e.target.value)}>
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
          <option value="prefiro_nao_dizer">Prefiro não dizer</option>
        </select>

        <label>Tipo de Usuário:</label>
        <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
          <option value="ambos">Locador e Locatário</option>
          <option value="locador">Apenas Locador</option>
          <option value="locatario">Apenas Locatário</option>
        </select>

        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default RegisterPage;