require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 1111;

app.use(cors());
app.use(express.json());

// 🔥 ROTA DE TESTE PARA VALIDAR CONEXÃO COM O BANCO
app.get('/test-db', (req, res) => {
  const sql = 'SELECT * FROM usuarios LIMIT 5';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erro na query:', err);
      return res.status(500).json({ erro: 'Erro na conexão com o banco' });
    }
    res.json({ sucesso: true, dados: results });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
