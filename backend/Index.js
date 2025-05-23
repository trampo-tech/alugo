const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint para buscar 4 itens aleatórios
app.get('/itens', (req, res) => {
  const sql = 'SELECT * FROM itens ORDER BY RAND() LIMIT 4';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Erro na consulta:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
      return;
    }
    res.json(result);
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
