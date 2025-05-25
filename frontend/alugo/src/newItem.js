import { useState } from 'react';
import axios from 'axios';
import './newItem.css';

function NovoItem() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precoDiario, setPrecoDiario] = useState('');
  const [condicoesUso, setCondicoesUso] = useState('');
  const [imagem, setImagem] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('preco_diario', precoDiario);
    formData.append('condicoes_uso', condicoesUso);
    formData.append('imagem', imagem);
    formData.append('usuario_id', 1); // Pode ser dinâmico futuramente.

    axios.post('http://localhost:8080/novo-item', formData)
      .then(() => {
        setMensagem('Item cadastrado com sucesso!');
        setTitulo('');
        setDescricao('');
        setCategoria('');
        setPrecoDiario('');
        setCondicoesUso('');
        setImagem(null);
      })
      .catch(err => {
        console.error(err);
        setMensagem('Erro ao cadastrar item.');
      });
  };

  return (
    <div className="novoitem-container">
      <h2>Cadastrar Novo Item</h2>
      <form onSubmit={handleSubmit}>
        <label>Título:</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

        <label>Descrição:</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required />

        <label>Categoria:</label>
        <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />

        <label>Preço Diário (R$):</label>
        <input type="number" value={precoDiario} onChange={(e) => setPrecoDiario(e.target.value)} required />

        <label>Condições de Uso:</label>
        <textarea value={condicoesUso} onChange={(e) => setCondicoesUso(e.target.value)} required />

        <label>Imagem:</label>
        <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} required />

        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default NovoItem;
