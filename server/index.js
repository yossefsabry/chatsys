const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const { run, get, all } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// REST APIs
// 1. Create a chat room
app.post('/api/chats', async (req, res) => {
  try {
    const chatId = crypto.randomUUID();
    await run('INSERT INTO chats (id) VALUES (?)', [chatId]);
    res.json({ id: chatId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// 2. Check if chat exists
app.get('/api/chats/:id', async (req, res) => {
  try {
    const chat = await get('SELECT * FROM chats WHERE id = ?', [req.params.id]);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check chat' });
  }
});

// 3. Fetch paginated messages
app.get('/api/chats/:id/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    // We fetch messages in descending order (newest first) for pagination, 
    // then the client can reverse them. Or we can just order by ID DESC.
    const messages = await all(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [req.params.id, limit, offset]
    );
    res.json(messages.reverse()); // Reverse to chronological order (oldest first in the array)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3.5 Search messages
app.get('/api/chats/:id/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) return res.json([]);
    const messages = await all(
      "SELECT * FROM messages WHERE chat_id = ? AND type = 'text' AND content LIKE ? ORDER BY id DESC LIMIT 50",
      [req.params.id, `%${query}%`]
    );
    res.json(messages);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// 4. Upload an image
app.post('/api/chats/:id/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// WebSockets (Socket.io)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  socket.on('send_message', async (data) => {
    // data: { chatId, senderId, type, content }
    try {
      const { chatId, senderId, type, content } = data;
      
      // Save message to DB
      const result = await run(
        'INSERT INTO messages (chat_id, sender_id, type, content) VALUES (?, ?, ?, ?)',
        [chatId, senderId, type, content]
      );
      
      // Fetch the saved message to get its auto-generated ID and created_at
      const msg = await get('SELECT * FROM messages WHERE id = ?', [result.id]);

      // Broadcast to room (including sender)
      io.to(chatId).emit('receive_message', msg);
    } catch (err) {
      console.error('Failed to save/send message', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
