import { useEffect, useState } from 'react';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editImagem, setEditImagem] = useState(null);

  const api = 'http://localhost:8080/categorias';

  const fetchCategorias = async () => {
    try {
      const res = await fetch(api);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const criarCategoria = async () => {
    if (!nome || !imagem) {
      alert('Preencha o nome e selecione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('imagem', imagem);

    try {
      const res = await fetch(api, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setNome('');
        setImagem(null);
        fetchCategorias();
      } else {
        const erro = await res.json();
        alert(erro.erro || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
    }
  };

  const iniciarEdicao = (cat) => {
    setEditandoId(cat.id);
    setEditNome(cat.nome);
    setEditImagem(null);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditNome('');
    setEditImagem(null);
  };

  const salvarEdicao = async () => {
    const formData = new FormData();
    formData.append('nome', editNome);
    if (editImagem) formData.append('imagem', editImagem);

    const res = await fetch(`${api}/${editandoId}`, {
      method: 'PUT',
      body: formData
    });

    if (res.ok) {
      cancelarEdicao();
      fetchCategorias();
    } else {
      const erro = await res.json();
      alert(erro.erro || 'Erro ao atualizar');
    }
  };

  const excluirCategoria = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta categoria?');
    if (!confirmar) return;

    const res = await fetch(`${api}/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      fetchCategorias();
    } else {
      const erro = await res.json();
      alert(erro.erro || 'Erro ao excluir');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Criar Nova Categoria</h2>
      <input
        type="text"
        placeholder="Nome da categoria"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagem(e.target.files[0])}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <button onClick={criarCategoria}>Criar</button>

      <hr />

      <h3>Lista de Categorias</h3>
      {categorias.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
          {editandoId === cat.id ? (
            <>
              <input
                type="text"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                style={{ width: '100%', marginBottom: 5 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImagem(e.target.files[0])}
                style={{ width: '100%', marginBottom: 5 }}
              />
              <button onClick={salvarEdicao}>Salvar</button>
              <button onClick={cancelarEdicao} style={{ marginLeft: 5 }}>Cancelar</button>
            </>
          ) : (
            <>
              <strong>{cat.nome}</strong><br />
              {cat.imagem_base64 && (
                <img
                  src={`data:image/jpeg;base64,${cat.imagem_base64}`}
                  alt={cat.nome}
                  style={{ maxWidth: 150, marginTop: 5 }}
                />
              )}
              <div style={{ marginTop: 5 }}>
                <button onClick={() => iniciarEdicao(cat)}>Editar</button>
                <button onClick={() => excluirCategoria(cat.id)} style={{ marginLeft: 5, color: 'red' }}>Excluir</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Categorias;
