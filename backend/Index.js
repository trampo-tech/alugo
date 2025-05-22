require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORTFRONT || 1111;

app.use(cors());
app.use(express.json());

//SELECT TESTE
app.get('/api/itens', (req, res) => {
  const sql = "SELECT * FROM itens";
  db.query(sql, (err, data) => {
    if (err) {
      console.error('❌ Erro ao buscar itens:', err);
      return res.status(500).json({ error: 'Erro ao buscar itens' });
    }
    return res.json(data);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
