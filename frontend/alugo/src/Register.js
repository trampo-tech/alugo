// alugo/frontend/alugo/src/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import './newItem.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState(''); // Estado do CPF
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('ambos');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  // Função para formatar o CPF
  const formatCpf = (value) => {
    // Remove tudo que não for dígito
    let cleanedValue = value.replace(/\D/g, '');

    // Aplica a máscara se houver dígitos suficientes
    if (cleanedValue.length > 3 && cleanedValue.length <= 6) {
      cleanedValue = cleanedValue.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (cleanedValue.length > 6 && cleanedValue.length <= 9) {
      cleanedValue = cleanedValue.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (cleanedValue.length > 9) {
      cleanedValue = cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cleanedValue;
  };

  const handleCpfChange = (e) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!nome || !email || !senha) {
      setMensagem('Nome, email e senha são campos obrigatórios.');
      return;
    }

    // CPF que será enviado para o backend
    // É bom garantir que o CPF seja enviado no formato esperado pelo backend
    // ou que o backend limpe/formate por conta própria.
    // Aqui estamos confiando na formatação do backend.
    const cpfParaEnviar = cpf.replace(/\D/g, ''); // Envia apenas dígitos, o backend fará a formatação final

    try {
      const res = await axios.post('http://localhost:8080/register', {
        nome,
        email,
        senha,
        telefone: telefone || null,
        cpf: cpfParaEnviar || null, // Envia o CPF sem formatação, o backend formata para salvar
        data_nascimento: dataNascimento || null,
        genero: genero || null,
        tipo_usuario: tipoUsuario,
      });

      if (res.data && res.data.sucesso) {
        setMensagem('Cadastro realizado com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMensagem(res.data.erro || 'Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      console.error("Erro na requisição de cadastro:", err);
      if (err.response && err.response.data && err.response.data.erro) {
        setMensagem(err.response.data.erro);
      } else {
        setMensagem('Erro ao cadastrar. Tente novamente.');
      }
    }
  };

  return (
    <div className="novoitem-container">
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome:</label>
        <input type="text" id="nome" value={nome} onChange={e => setNome(e.target.value)} required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label htmlFor="senha">Senha:</label>
        <input type="password" id="senha" value={senha} onChange={e => setSenha(e.target.value)} required />

        <label htmlFor="telefone">Telefone (opcional):</label>
        <input type="text" id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />

        <label htmlFor="cpf">CPF (opcional):</label>
        <input
          type="text"
          id="cpf"
          value={cpf}
          onChange={handleCpfChange} // Chama a função de formatação no onChange
          maxLength="14" // Limita para o formato XXX.XXX.XXX-XX
          placeholder="000.000.000-00"
        />

        <label htmlFor="dataNascimento">Data de Nascimento (opcional):</label>
        <input type="date" id="dataNascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />

        <label htmlFor="genero">Gênero (opcional):</label>
        <select id="genero" value={genero} onChange={e => setGenero(e.target.value)}>
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
          <option value="prefiro_nao_dizer">Prefiro não dizer</option>
        </select>

        <label htmlFor="tipoUsuario">Tipo de Usuário:</label>
        <select id="tipoUsuario" value={tipoUsuario} onChange={e => setTipoUsuario(e.target.value)}>
          <option value="ambos">Locador e Locatário</option>
          <option value="locador">Apenas Locador</option>
          <option value="locatario">Apenas Locatário</option>
        </select>

        <button type="submit" className="primary">Cadastrar</button>
      </form>
      {mensagem && <p className={mensagem.includes('sucesso') ? 'feedback-message success' : 'feedback-message error'}>{mensagem}</p>}

      <p className="form-link">
        Já tem uma conta? <a href="/login">Faça login aqui</a>
      </p>
    </div>
  );
}

export default RegisterPage;