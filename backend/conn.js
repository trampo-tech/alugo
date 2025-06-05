const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const categoriaRoutes = require('./Routes/categoria');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/categorias', categoriaRoutes);

// Configura o multer para armazenar imagens em memória (BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// ================== ROTAS ================== //

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
      console.error('Erro na consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }

    res.json(result);
  });
});


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
      console.error('Erro na consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }

    res.json(result);
  });
});

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

    res.setHeader('Content-Type', result[0].tipo);
    res.send(result[0].imagem);
  });
});

app.post('/novo-item', upload.single('imagem'), (req, res) => {
  const { titulo, descricao, categoria, preco_diario, condicoes_uso, usuario_id } = req.body;
  const imagem = req.file.buffer;
  const nomeArquivo = req.file.originalname;
  const tipo = req.file.mimetype;

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

    const itemId = result.insertId;

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
app.get('/buscar-itens', (req, res) => {
  const { categoria, cidade, precoMin, precoMax, dataIni, dataFim } = req.query;

  let sql = `
    SELECT itens.*, imagens.id AS imagem_id
    FROM itens
    LEFT JOIN imagens ON imagens.item_id = itens.id
    WHERE 1 = 1
  `;
  const params = [];

  if (categoria) {
    sql += ' AND itens.categoria = ?';
    params.push(categoria);
  }

  if (cidade) {
    sql += ' AND itens.cidade = ?';
    params.push(cidade);
  }

  if (precoMin) {
    sql += ' AND itens.preco_diario >= ?';
    params.push(parseFloat(precoMin));
  }

  if (precoMax) {
    sql += ' AND itens.preco_diario <= ?';
    params.push(parseFloat(precoMax));
  }

  if (dataIni && dataFim) {
    sql += ` AND itens.id NOT IN (
      SELECT item_id FROM alugueis
      WHERE (? BETWEEN data_inicio AND data_fim OR ? BETWEEN data_inicio AND data_fim)
    )`;
    params.push(dataIni, dataFim);
  }

  sql += ' GROUP BY itens.id';

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erro ao buscar itens com filtros:', err);
      res.status(500).json({ error: 'Erro ao buscar itens com filtros' });
      return;
    }

    res.json(result);
  });
});
