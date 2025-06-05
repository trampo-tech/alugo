const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const categoriaRoutes = require('./Routes/categoria');
const app = express();
const axios = require('axios');
// REMOVIDO: const bcrypt = require('bcrypt'); // Não importamos mais o bcrypt

require('dotenv').config();

app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
app.use('/categorias', categoriaRoutes); // Usa as rotas de categoria

const storage = multer.memoryStorage(); // Configura o Multer para armazenar arquivos em memória
const upload = multer({ storage: storage }); // Inicializa o Multer com a configuração de storage

const PORT = process.env.PORT || 8080; // Define a porta do servidor (8080 por padrão)
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const HYBRID_SEARCH_URL = process.env.HYBRID_SEARCH_URL || 'http://localhost:8000'; // URL do serviço de busca híbrida

// ================== ROTAS ================== //

// Rota de Login (ATENÇÃO: SENHA EM TEXTO SIMPLES - INSEGURO PARA PRODUÇÃO)
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Consulta o banco de dados para encontrar o usuário pelo email
  const query = 'SELECT id, nome, email, senha FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário para login:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      // Usuário não encontrado
      return res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas.' });
    }

    const user = results[0];

    // ATENÇÃO: Comparação de senha em texto simples. EXTREMAMENTE INSEGURO para produção.
    if (user.senha === senha) {
      // Login bem-sucedido
      res.json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
        },
      });
    } else {
      // Senha incorreta
      res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas.' });
    }
  });
});

// Rota de Registro (ATENÇÃO: SENHA SALVA EM TEXTO SIMPLES - EXTREMAMENTE INSEGURO PARA PRODUÇÃO)
app.post('/register', (req, res) => {
  const { nome, email, senha, telefone, cpf, data_nascimento, genero, tipo_usuario } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ sucesso: false, erro: 'Nome, email e senha são obrigatórios.' });
  }

  // ATENÇÃO: A senha é armazenada em texto simples. Isso é EXTREMAMENTE INSEGURO.
  // Em produção, use uma biblioteca de hashing como 'bcrypt'.
  const plainTextPassword = senha;

  // Query SQL para inserir um novo usuário
  const query = `
    INSERT INTO usuarios (nome, email, senha, telefone, cpf, data_nascimento, genero, tipo_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  // Valores para a query. Campos opcionais serão 'null' se vazios.
  const values = [
    nome,
    email,
    plainTextPassword,
    telefone || null,
    cpf || null,
    data_nascimento || null, // Garante que datas vazias sejam null
    genero || null,           // Garante que gêneros vazios sejam null
    tipo_usuario
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      // Tratamento de erro para entradas duplicadas (email ou CPF)
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('email')) {
          return res.status(409).json({ sucesso: false, erro: 'Este email já está cadastrado.' });
        }
        if (err.sqlMessage.includes('cpf')) {
          return res.status(409).json({ sucesso: false, erro: 'Este CPF já está cadastrado.' });
        }
      }
      console.error('Erro ao inserir novo usuário:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar usuário.' });
    }
    // Retorna sucesso e o ID do novo usuário
    res.status(201).json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!', id: result.insertId });
  });
});


// Rota para exibir itens na landing page (amostra de 4 itens aleatórios com imagem)
app.get('/itens', (req, res) => {
  const sql = `
    SELECT
      itens.*,
      (SELECT id FROM imagens WHERE imagens.item_id = itens.id LIMIT 1) AS imagem_id
    FROM itens
    ORDER BY RAND()
    LIMIT 4
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro na consulta de itens da landing page:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }
    res.json(result);
  });
});


// Rota para exibir itens por categoria (exemplo específico para "Eletrônicos")
// (Pode ser substituída pela busca híbrida mais geral se não for mais necessária)
app.get('/categoria', (req, res) => {
  const sql = `
    SELECT itens.*, imagens.id AS imagem_id
    FROM itens
    LEFT JOIN imagens ON imagens.item_id = itens.id
    WHERE categoria = 'Eletrônicos'
    GROUP BY itens.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro na consulta por categoria:', err);
      res.status(500).json({ error: 'Erro ao buscar itens por categoria' });
      return;
    }
    res.json(result);
  });
});

// Rota para buscar a imagem binária de um item pelo ID da imagem
app.get('/imagem/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT imagem, tipo FROM imagens WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erro ao buscar imagem:', err);
      res.status(500).send('Erro no servidor');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Imagem não encontrada');
      return;
    }

    // Define o cabeçalho Content-Type com base no tipo MIME da imagem
    res.setHeader('Content-Type', result[0].tipo);
    // Envia os dados binários da imagem
    res.send(result[0].imagem);
  });
});

// Rota para inserir um novo item com uma imagem
app.post('/novo-item', upload.single('imagem'), (req, res) => {
  const { titulo, descricao, categoria, preco_diario, condicoes_uso, usuario_id } = req.body;
  // Verifica se uma imagem foi enviada
  if (!req.file) {
    return res.status(400).json({ error: 'Imagem é obrigatória para o novo item.' });
  }
  const imagem = req.file.buffer; // Conteúdo binário da imagem
  const nomeArquivo = req.file.originalname; // Nome original do arquivo
  const tipo = req.file.mimetype; // Tipo MIME do arquivo

  // Insere os dados do item na tabela 'itens'
  const sqlItem = `
    INSERT INTO itens (titulo, descricao, categoria, preco_diario, condicoes_uso, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sqlItem, [titulo, descricao, categoria, preco_diario, condicoes_uso, usuario_id], (err, result) => {
    if (err) {
      console.error('Erro ao inserir item:', err);
      res.status(500).json({ error: 'Erro ao inserir item' });
      return;
    }

    const itemId = result.insertId; // Pega o ID do item recém-inserido

    // Insere os dados da imagem na tabela 'imagens', linkando com o item
    const sqlImagem = `
      INSERT INTO imagens (item_id, imagem, nome_arquivo, tipo)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlImagem, [itemId, imagem, nomeArquivo, tipo], (err2) => {
      if (err2) {
        console.error('Erro ao inserir imagem:', err2);
        res.status(500).json({ error: 'Erro ao inserir imagem' });
        return;
      }
      res.json({ message: 'Item cadastrado com sucesso!', itemId });
    });
  });
});

// Rota para buscar itens usando o serviço de busca híbrida (Python)
app.get('/buscar-itens', async (req, res) => {
  // Extrai os parâmetros de busca e filtro da requisição
  const { query: searchTerm, categoria, precoMin, precoMax, dataInicial, dataFinal } = req.query;
  const table_name = 'itens'; // Tabela a ser pesquisada

  let filters = '';
  // Constrói a string de filtros para o motor de busca híbrida (formato 'campo:valor' ou 'campo:min-max')
  if (categoria) {
    filters += `categoria:${categoria},`;
  }
  if (precoMin) {
    filters += `preco_diario:${precoMin}-,`; // Se só tem mínimo, formato 'min-'
  }
  if (precoMax) {
    filters += `preco_diario:-${precoMax},`; // Se só tem máximo, formato '-max'
  }
  if (precoMin && precoMax) {
    filters += `preco_diario:${precoMin}-${precoMax},`; // Se tem ambos, formato 'min-max'
  }

  // Adiciona filtros de data, referenciando o campo 'created_at' no backend Python
  if (dataInicial) {
    filters += `created_at:${dataInicial}-,`;
  }
  if (dataFinal) {
    filters += `created_at:-${dataFinal},`;
  }
  if (dataInicial && dataFinal) {
    filters += `created_at:${dataInicial}-${dataFinal},`;
  }

  // Remove a vírgula extra no final da string de filtros, se houver
  filters = filters.endsWith(',') ? filters.slice(0, -1) : filters;

  try {
    // Faz a requisição HTTP GET para o serviço de busca híbrida
    const hybridSearchResponse = await axios.get(`${HYBRID_SEARCH_URL}/indexes/${table_name}`, {
      params: {
        query: searchTerm, // Termo de busca
        top: 50, // Número máximo de resultados
        filters: filters || undefined, // Envia a string de filtros (ou undefined se vazia)
      },
    });

    const hybridSearchResults = hybridSearchResponse.data.results;
    console.log('Resultados da busca híbrida:', hybridSearchResults);

    // Retorna os resultados diretamente do serviço de busca híbrida
    res.json(hybridSearchResults);

  } catch (error) {
    console.error('Erro ao chamar o serviço de busca híbrida:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Erro ao realizar a busca híbrida' });
  }
});
