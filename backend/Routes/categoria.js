const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

const upload = multer(); // Upload em memória

// 📌 Criar nova categoria
router.post('/', upload.single('imagem'), (req, res) => {
  console.log('Recebido:', req.body, req.file); // Debug opcional
  const { nome } = req.body;
  const imagem = req.file ? req.file.buffer : null;

  if (!nome || !imagem) {
    return res.status(400).json({ erro: 'Nome e imagem são obrigatórios' });
  }

  const query = 'INSERT INTO categorias (nome, imagem) VALUES (?, ?)';
  db.query(query, [nome, imagem], (err, result) => {
    if (err) {
      console.error('Erro ao criar categoria:', err);
      return res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
    res.status(201).json({ id: result.insertId });
  });
});

// 📌 Listar categorias
router.get('/', (req, res) => {
  const query = 'SELECT id, nome, TO_BASE64(imagem) AS imagem_base64 FROM categorias ORDER BY nome ASC';
  db.query(query, (err, rows) => {
    if (err) {
      console.error('Erro ao listar categorias:', err);
      return res.status(500).json({ erro: 'Erro ao listar categorias' });
    }
    res.json(rows);
  });
});

// 📌 Buscar por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, nome, TO_BASE64(imagem) AS imagem_base64 FROM categorias WHERE id = ?';
  db.query(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar categoria' });
    if (rows.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(rows[0]);
  });
});

// 📌 Atualizar categoria (opcional)
router.put('/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const imagem = req.file ? req.file.buffer : null;

  let query, params;
  if (imagem) {
    query = 'UPDATE categorias SET nome = ?, imagem = ? WHERE id = ?';
    params = [nome, imagem, id];
  } else {
    query = 'UPDATE categorias SET nome = ? WHERE id = ?';
    params = [nome, id];
  }

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao atualizar categoria' });
    res.json({ id, nome });
  });
});

// 📌 Deletar categoria
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM categorias WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar categoria' });
    res.json({ sucesso: true });
  });
});

module.exports = router;
