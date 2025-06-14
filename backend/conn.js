const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const categoriaRoutes = require('./Routes/categoria');
const app = express();
const axios = require('axios');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/categorias', categoriaRoutes);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const HYBRID_SEARCH_URL = process.env.HYBRID_SEARCH_URL || 'http://localhost:8000';

// Função para formatar o CPF para XXX.XXX.XXX-XX (mantida)
function formatCpfToDb(cpf) {
  if (!cpf) return null;
  const cleanedCpf = cpf.replace(/\D/g, '');
  if (cleanedCpf.length === 11) {
    return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cleanedCpf;
}

// ================== ROTAS ================== //

// Rota de Login (mantida)
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const query = 'SELECT id, nome, email, telefone, endereco, senha FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas.' });
    }

    const user = results[0];

    if (user.senha === senha) {
      res.json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          endereco: user.endereco,
        },
      });
    } else {
      res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas.' });
    }
  });
});

// Rota de Registro (mantida)
app.post('/register', (req, res) => {
  const { nome, email, senha, telefone, cpf, data_nascimento, genero, tipo_usuario, endereco } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ sucesso: false, erro: 'Nome, email e senha são obrigatórios.' });
  }

  const plainTextPassword = senha;
  const formattedCpf = formatCpfToDb(cpf);

  const query = `
    INSERT INTO usuarios (nome, email, senha, telefone, cpf, data_nascimento, genero, tipo_usuario, endereco)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nome, email, plainTextPassword, telefone || null, formattedCpf, data_nascimento || null, genero || null, tipo_usuario, endereco || null];

  db.query(query, values, (err, result) => {
    if (err) {
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
    res.status(201).json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!', id: result.insertId });
  });
});

// Rota para buscar informações do perfil do usuário (mantida)
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, nome, email, telefone, cpf, data_nascimento, genero, endereco, tipo_usuario FROM usuarios WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
    }
    res.json(results[0]);
  });
});

// Rota para atualizar informações do perfil do usuário (mantida)
app.put('/profile/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, telefone, endereco } = req.body;

  let updateFields = [];
  let updateValues = [];

  if (nome) {
    updateFields.push('nome = ?');
    updateValues.push(nome);
  }
  if (email) {
    updateFields.push('email = ?');
    updateValues.push(email);
  }
  if (senha) {
    updateFields.push('senha = ?');
    updateValues.push(senha);
  }
  if (telefone) {
    updateFields.push('telefone = ?');
    updateValues.push(telefone);
  }
  if (endereco) {
    updateFields.push('endereco = ?');
    updateValues.push(endereco);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ sucesso: false, erro: 'Nenhum dado para atualizar.' });
  }

  const query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
  updateValues.push(id);

  db.query(query, updateValues, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar perfil:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar perfil.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
    }
    res.json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso!' });
  });
});


// Rota para buscar itens de um usuário específico (mantida)
app.get('/user-items/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
      itens.*,
      (SELECT id FROM imagens WHERE imagens.item_id = itens.id LIMIT 1) AS imagem_id
    FROM itens
    WHERE usuario_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar itens do usuário:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar itens.' });
    }
    res.json(results);
  });
});

// Rota para atualizar um item existente (PUT /itens/:id) (mantida)
app.put('/itens/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, categoria, preco_diario, condicoes_uso } = req.body;
  const imagem = req.file ? req.file.buffer : null;
  const nomeArquivo = req.file ? req.file.originalname : null;
  const tipo = req.file ? req.file.mimetype : null;

  let sqlItemUpdate = 'UPDATE itens SET titulo = ?, descricao = ?, categoria = ?, preco_diario = ?, condicoes_uso = ? WHERE id = ?';
  let itemValues = [titulo, descricao, categoria, preco_diario, condicoes_uso, id];

  db.query(sqlItemUpdate, itemValues, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar item:', err);
      return res.status(500).json({ error: 'Erro ao atualizar item' });
    }

    if (imagem) {
      const sqlCheckImage = 'SELECT id FROM imagens WHERE item_id = ? LIMIT 1';
      db.query(sqlCheckImage, [id], (errCheck, resultCheck) => {
        if (errCheck) {
          console.error('Erro ao verificar imagem existente:', errCheck);
          return res.status(500).json({ error: 'Erro ao verificar imagem' });
        }

        if (resultCheck.length > 0) {
          const imageId = resultCheck[0].id;
          const sqlUpdateImage = 'UPDATE imagens SET imagem = ?, nome_arquivo = ?, tipo = ? WHERE id = ?';
          db.query(sqlUpdateImage, [imagem, nomeArquivo, tipo, imageId], (errUpdate) => {
            if (errUpdate) {
              console.error('Erro ao atualizar imagem:', errUpdate);
              return res.status(500).json({ error: 'Erro ao atualizar imagem' });
            }
            res.json({ message: 'Item e imagem atualizados com sucesso!' });
          });
        } else {
          const sqlInsertImage = 'INSERT INTO imagens (item_id, imagem, nome_arquivo, tipo) VALUES (?, ?, ?, ?)';
          db.query(sqlInsertImage, [id, imagem, nomeArquivo, tipo], (errInsert) => {
            if (errInsert) {
              console.error('Erro ao inserir nova imagem para item:', errInsert);
              return res.status(500).json({ error: 'Erro ao inserir imagem' });
            }
            res.json({ message: 'Item atualizado e nova imagem adicionada com sucesso!' });
          });
        }
      });
    } else {
      res.json({ message: 'Item atualizado com sucesso (sem alteração de imagem)!' });
    }
  });
});

// Rota para deletar um item (mantida)
app.delete('/itens/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM imagens WHERE item_id = ?', [id], (errImageDelete) => {
    if (errImageDelete) {
      console.error('Erro ao deletar imagem associada:', errImageDelete);
    }

    db.query('DELETE FROM itens WHERE id = ?', [id], (errItemDelete, result) => {
      if (errItemDelete) {
        console.error('Erro ao deletar item:', errItemDelete);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao deletar item.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ sucesso: false, erro: 'Item não encontrado.' });
      }
      res.json({ sucesso: true, mensagem: 'Item deletado com sucesso!' });
    });
  });
});


// Rota para buscar detalhes de um item específico e seu proprietário (mantida)
app.get('/itens/:id', async (req, res) => {
  const itemId = req.params.id;

  const itemQuery = `
    SELECT
      i.id, i.titulo, i.descricao, i.categoria, i.preco_diario, i.condicoes_uso, i.status, i.usuario_id,
      (SELECT id FROM imagens WHERE imagens.item_id = i.id LIMIT 1) AS imagem_id
    FROM itens i
    WHERE i.id = ?;
  `;

  db.query(itemQuery, [itemId], (err, itemResults) => {
    if (err) {
      console.error('Erro ao buscar item:', err);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do item.' });
    }
    if (itemResults.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    const item = itemResults[0];
    const ownerId = item.usuario_id;

    const ownerQuery = 'SELECT id, nome, email, telefone FROM usuarios WHERE id = ?;';
    db.query(ownerQuery, [ownerId], (err, ownerResults) => {
      if (err) {
        console.error('Erro ao buscar proprietário:', err);
        return res.status(500).json({ error: 'Erro ao buscar informações do proprietário.' });
      }
      const owner = ownerResults[0] || null;

      res.json({ item, owner });
    });
  });
});

// Rota para buscar os pedidos (aluguéis) de um usuário onde ele é o locatário (mantida)
app.get('/my-rentals/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
      p.id AS pedido_id,
      p.data_inicio,
      p.data_fim,
      p.status AS pedido_status,
      p.valor_total,
      i.id AS item_id,
      i.titulo AS item_titulo,
      i.preco_diario AS item_preco_diario,
      i.status AS item_status,
      (SELECT id FROM imagens WHERE imagens.item_id = i.id LIMIT 1) AS item_imagem_id,
      u.nome AS locador_nome,
      u.email AS locador_email,
      u.telefone AS locador_telefone
    FROM pedidos p
    JOIN itens i ON p.item_id = i.id
    JOIN usuarios u ON i.usuario_id = u.id -- O locador é o dono do item
    WHERE p.locatario_id = ?
    ORDER BY p.data_inicio DESC;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar pedidos do usuário (aluguéis):', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar aluguéis.' });
    }
    res.json(results);
  });
});

// Rota para buscar os pedidos (aluguéis) recebidos pelos itens de um usuário (mantida)
app.get('/my-product-rentals/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT
      p.id AS pedido_id,
      p.data_inicio,
      p.data_fim,
      p.status AS pedido_status,
      p.valor_total,
      i.id AS item_id,
      i.titulo AS item_titulo,
      i.preco_diario AS item_preco_diario,
      (SELECT id FROM imagens WHERE imagens.item_id = i.id LIMIT 1) AS item_imagem_id,
      l.nome AS locatario_nome,
      l.email AS locatario_email,
      l.telefone AS locatario_telefone
    FROM pedidos p
    JOIN itens i ON p.item_id = i.id
    JOIN usuarios l ON p.locatario_id = l.id
    WHERE p.locador_id = ?
    ORDER BY p.created_at DESC;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar pedidos recebidos pelo usuário:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar pedidos recebidos.' });
    }
    res.json(results);
  });
});


// Rota para criar um novo pedido de aluguel (CORRIGIDO o status do item)
app.post('/rentals', async (req, res) => {
  const { item_id, locatario_id, locador_id, data_inicio, data_fim } = req.body;

  if (!item_id || !locatario_id || !locador_id || !data_inicio || !data_fim) {
    return res.status(400).json({ sucesso: false, erro: 'Todos os campos obrigatórios (item_id, locatario_id, locador_id, data_inicio, data_fim) devem ser fornecidos.' });
  }

  // 1. Obter o preco_diario do item
  const getItemPriceQuery = 'SELECT preco_diario, status FROM itens WHERE id = ?';
  db.query(getItemPriceQuery, [item_id], (err, itemResults) => {
    if (err) {
      console.error('Erro ao buscar preço do item:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro no servidor ao processar aluguel.' });
    }
    if (itemResults.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Item não encontrado.' });
    }

    const itemPrecoDiario = parseFloat(itemResults[0].preco_diario);
    const itemStatusAtual = itemResults[0].status;

    // Se o item não está disponível para aluguel, impeça o pedido
    if (itemStatusAtual !== 'disponivel') {
      return res.status(400).json({ sucesso: false, erro: `Este item não está disponível para aluguel. Status atual: ${itemStatusAtual}.` });
    }

    // Calcular a duração em dias
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return res.status(400).json({ sucesso: false, erro: 'A data de fim deve ser posterior à data de início.' });
    }

    const valor_total = (itemPrecoDiario * diffDays).toFixed(2);

    // 2. Inserir o pedido na tabela 'pedidos' com status 'pendente'
    const insertPedidoQuery = `
      INSERT INTO pedidos (item_id, locador_id, locatario_id, data_inicio, data_fim, valor_total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const pedidoValues = [item_id, locador_id, locatario_id, data_inicio, data_fim, valor_total, 'pendente'];

    db.query(insertPedidoQuery, pedidoValues, (err, result) => {
      if (err) {
        console.error('Erro ao inserir novo pedido de aluguel:', err);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao registrar o aluguel.' });
      }

      const pedidoId = result.insertId;

      // Importante: NÃO ATUALIZAR O STATUS DO ITEM AQUI. Ele só muda para 'alugado' após aprovação.
      // O frontend receberá 'pendente' para o pedido, e o item continuará 'disponivel'.
      res.status(201).json({
        sucesso: true,
        mensagem: 'Aluguel solicitado com sucesso! Aguardando aprovação do proprietário.',
        pedido_id: pedidoId,
        novo_status_item: 'disponivel', // Confirma que o item permanece disponível (para o frontend)
        valor_total: valor_total
      });
    });
  });
});

// Rota para aprovar um pedido de aluguel
app.put('/pedidos/:pedidoId/approve', (req, res) => {
  const { pedidoId } = req.params;
  const { item_id } = req.body; // Necessário para atualizar o status do item

  if (!item_id) {
    return res.status(400).json({ sucesso: false, erro: 'item_id é necessário para aprovação do pedido.' });
  }

  // 1. Atualizar o status do pedido para 'em_andamento' (se for 'pendente')
  const updatePedidoStatusQuery = 'UPDATE pedidos SET status = ? WHERE id = ? AND status = ?';
  db.query(updatePedidoStatusQuery, ['em_andamento', pedidoId, 'pendente'], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar status do pedido para aprovação:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao aprovar pedido.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Pedido não encontrado ou já foi aprovado/cancelado.' });
    }

    // 2. Atualizar o status do item para 'alugado'
    const updateItemStatusQuery = 'UPDATE itens SET status = ? WHERE id = ?';
    db.query(updateItemStatusQuery, ['alugado', item_id], (errUpdate, updateResult) => {
        if (errUpdate) {
            console.error('Erro ao atualizar status do item após aprovação do pedido:', errUpdate);
        }
        res.json({ sucesso: true, mensagem: 'Pedido aprovado com sucesso!', novo_status_pedido: 'em_andamento' });
    });
  });
});

// Rota para rejeitar um pedido de aluguel
app.put('/pedidos/:pedidoId/reject', (req, res) => {
  const { pedidoId } = req.params;
  const { item_id } = req.body; // Necessário para reverter o status do item

  if (!item_id) {
    return res.status(400).json({ sucesso: false, erro: 'item_id é necessário para rejeição do pedido.' });
  }

  // 1. Atualizar o status do pedido para 'cancelado' (se for 'pendente')
  const updatePedidoStatusQuery = 'UPDATE pedidos SET status = ? WHERE id = ? AND status = ?';
  db.query(updatePedidoStatusQuery, ['cancelado', pedidoId, 'pendente'], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar status do pedido para rejeição:', err);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao rejeitar pedido.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Pedido não encontrado ou já foi aprovado/cancelado.' });
    }

    // 2. Reverter o status do item para 'disponivel'
    const updateItemStatusQuery = 'UPDATE itens SET status = ? WHERE id = ?';
    db.query(updateItemStatusQuery, ['disponivel', item_id], (errUpdate, updateResult) => {
        if (errUpdate) {
            console.error('Erro ao reverter status do item após rejeição do pedido:', errUpdate);
        }
        res.json({ sucesso: true, mensagem: 'Pedido rejeitado com sucesso!', novo_status_pedido: 'cancelado' });
    });
  });
});


// Rota para finalizar o checkout do carrinho (NOVA ROTA)
app.post('/checkout-cart', async (req, res) => {
  const { items, locatario_id } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !locatario_id) {
    return res.status(400).json({ sucesso: false, erro: 'Dados inválidos para checkout do carrinho.' });
  }

  const createdPedidos = [];
  const errors = [];

  for (const cartItem of items) {
    const { item_id, locador_id, data_inicio, data_fim, preco_diario } = cartItem;

    // Validação básica do item do carrinho
    if (!item_id || !locador_id || !data_inicio || !data_fim || !preco_diario) {
      errors.push({ item_id, erro: 'Dados incompletos para item no carrinho.' });
      continue; // Pula para o próximo item
    }

    // Calcular duração e valor total
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const valor_total = (parseFloat(preco_diario) * diffDays).toFixed(2);

    // Validação de disponibilidade do item para o período (evitar sobreposição)
    const checkAvailabilityQuery = `
      SELECT COUNT(*) AS count
      FROM pedidos
      WHERE item_id = ?
      AND status IN ('pendente', 'em_andamento')
      AND (
          (data_inicio <= ? AND data_fim >= ?) OR
          (data_inicio >= ? AND data_inicio <= ?) OR
          (data_fim >= ? AND data_fim <= ?)
      );
    `;
    const availabilityParams = [item_id, fim, inicio, inicio, fim, inicio, fim];

    try {
      const [availabilityResults] = await db.promise().query(checkAvailabilityQuery, availabilityParams);
      if (availabilityResults[0].count > 0) {
        errors.push({ item_id, erro: 'Item já alugado ou com pedido pendente para o período selecionado.' });
        continue; // Pula para o próximo item
      }

      // Inserir o pedido na tabela 'pedidos'
      const insertPedidoQuery = `
        INSERT INTO pedidos (item_id, locador_id, locatario_id, data_inicio, data_fim, valor_total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const pedidoValues = [item_id, locador_id, locatario_id, data_inicio, data_fim, valor_total, 'pendente'];
      const [insertResult] = await db.promise().query(insertPedidoQuery, pedidoValues);
      createdPedidos.push({ pedido_id: insertResult.insertId, item_id, valor_total });

    } catch (err) {
      console.error(`Erro ao processar item ${item_id} no checkout:`, err);
      errors.push({ item_id, erro: 'Erro interno ao processar pedido.' });
    }
  }

  if (createdPedidos.length > 0) {
    res.status(200).json({
      sucesso: true,
      mensagem: 'Checkout processado. Pedidos criados com sucesso!',
      pedidos_criados: createdPedidos,
      erros: errors,
    });
  } else {
    res.status(400).json({
      sucesso: false,
      erro: 'Nenhum pedido pôde ser criado. Verifique a disponibilidade dos itens.',
      erros: errors,
    });
  }
});


// Exibição de itens na landing page (com uma imagem por item) (mantida)
app.get('/itens', (req, res) => {
  const sql = `
    SELECT
      itens.*,
      (SELECT id FROM imagens WHERE imagens.item_id = itens.id LIMIT 1) AS imagem_id
    FROM itens
    ORDER BY RAND()
    LIMIT 3
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


// Exibição de itens por categoria (mantida)
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

// Rota para buscar a imagem binária (mantida)
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

// Rota para inserir novo item + imagem (mantida)
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

// Rota para buscar itens usando o serviço de busca híbrida (mantida)
app.get('/buscar-itens', async (req, res) => {
  const { query: searchTerm, categoria, precoMin, precoMax, dataInicial, dataFinal, status } = req.query;
  const table_name = 'itens';

  let filters = '';
  let dateFilterSql = '';      
  let dateFilterParams = [];
  if (categoria) {
    filters += `categoria:${categoria};`;
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
      // Itens que estão disponíveis OU que não têm pedidos sobrepostos no período
      dateFilterSql = `
          AND (
              i.status = 'disponivel' OR i.status = 'inativo' OR NOT EXISTS (
                  SELECT 1 FROM pedidos p
                  WHERE p.item_id = i.id
                  AND p.status IN ('pendente', 'em_andamento')
                  AND (
                      (p.data_inicio <= ? AND p.data_fim >= ?) OR
                      (p.data_inicio >= ? AND p.data_inicio <= ?) OR
                      (p.data_fim >= ? AND p.data_fim <= ?)
                  )
              )
          )`;
      dateFilterParams.push(dataFinal, dataInicial, dataInicial, dataFinal, dataInicial, dataFinal);
  } else if (dataInicial) {
      // Itens que estão disponíveis OU que não estão alugados a partir da data inicial
      dateFilterSql = `
          AND (
              i.status = 'disponivel' OR i.status = 'inativo' OR NOT EXISTS (
                  SELECT 1 FROM pedidos p
                  WHERE p.item_id = i.id
                  AND p.status IN ('pendente', 'em_andamento')
                  AND p.data_fim >= ?
              )
          )`;
      dateFilterParams.push(dataInicial);
  } else if (dataFinal) {
      // Itens que estão disponíveis OU que não estão alugados até a data final
      dateFilterSql = `
          AND (
              i.status = 'disponivel' OR i.status = 'inativo' OR NOT EXISTS (
                  SELECT 1 FROM pedidos p
                  WHERE p.item_id = i.id
                  AND p.status IN ('pendente', 'em_andamento')
                  AND p.data_inicio <= ?
              )
          )`;
      dateFilterParams.push(dataFinal);
  }


  // Adicionado filtro de status para a busca híbrida (se o search engine suportar)
  if (status) {
    filters += `status:${status},`;
  }

  filters = filters.endsWith(',') ? filters.slice(0, -1) : filters;

  try {
    const hybridSearchResponse = await axios.get(`${HYBRID_SEARCH_URL}/indexes/${table_name}`, {
      params: {
        query: searchTerm,
        top: 50,
        filters: filters || undefined,
      },
    });

    let hybridSearchResults = hybridSearchResponse.data.results;

    if (!hybridSearchResults || hybridSearchResults.length === 0) {
      return res.json([]);
    }

    const itemIds = hybridSearchResults.map(item => item.id);

    const detailedItemsQuery = `
        SELECT i.*, (SELECT id FROM imagens WHERE imagens.item_id = i.id LIMIT 1) AS imagem_id
        FROM itens i
        WHERE i.id IN (?) ${dateFilterSql}
    `;
    
    const queryParams = [itemIds];

    if (dateFilterParams.length > 0) {
        queryParams.push(...dateFilterParams);
    }

    db.query(detailedItemsQuery, queryParams, (err, detailedResults) => {
      if (err) {
        console.error('Erro ao buscar detalhes de itens após search híbrido:', err);
        return res.status(500).json({ error: 'Erro ao obter detalhes dos itens buscados.' });
      }

      const detailedItemsMap = new Map(detailedResults.map(item => [item.id, item]));
      const orderedResults = itemIds.map(id => detailedItemsMap.get(id)).filter(item => item !== undefined);

      res.json(orderedResults);
    });

  } catch (error) {
    console.error('Erro ao chamar o serviço de busca híbrida ou processar resultados:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Erro ao realizar a busca híbrida' });
  }
});
