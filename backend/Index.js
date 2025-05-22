const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// ✅ Ativa CORS para aceitar requisições do frontend
app.use(cors());

// Permite interpretar JSON no corpo das requisições
app.use(express.json());

// Endpoint para buscar itens
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
