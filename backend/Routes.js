const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


// Exibição de itens landing page
app.get('/itens', (req, res) => {
  const sql = 'SELECT * FROM itens ORDER BY RAND() LIMIT 4';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro na consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }
    res.json(result);
  });
});


// Exibição de todos os itens
app.get('/categoria', (req, res) => {
  const sql = 'SELECT * FROM itens WHERE categoria = "Eletrônicos" LIMIT 4';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro na consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }
    res.json(result);
  });
});

// app.get('/itens', (req, res) => {
//   const sql = `
//     SELECT itens.*, imagens.id AS imagem_id
//     FROM itens
//     LEFT JOIN imagens ON imagens.item_id = itens.id
//     GROUP BY itens.id
//     ORDER BY RAND()
//     LIMIT 4
//   `;

//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error('Erro na consulta:', err);
//       res.status(500).json({ error: 'Erro ao buscar itens' });
//       return;
//     }

//     res.json(result);
//   });
// });

//Insere item
pp.post('/novo-item', upload.single('imagem'), (req, res) => {
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