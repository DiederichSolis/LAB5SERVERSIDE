import express from 'express';
import { posts } from './db.js'; // Importar posts de './db.js'
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';

const app = express();

const swaggerDocument = YAML.load('swagger.yaml');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.use(cors());

const logFilePath = 'log.txt';
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, 'Inicio del registro:\n\n');
}

const writeToLog = (endpoint, payload, response) => {
  const currentTime = new Date().toISOString();
  let payloadString;
  try {
    payloadString = JSON.stringify(payload);
  } catch (error) {
    payloadString = 'Circular structure in payload';
  }

  let responseString;
  try {
    responseString = JSON.stringify(response);
  } catch (error) {
    responseString = 'Circular structure in response';
  }

  const logMessage = `${currentTime} - Endpoint: ${endpoint}\nPayload: ${payloadString}\nResponse: ${responseString}\n\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
  });
};

// Define tus endpoints aquí
app.get('/posts', (req, res) => {
  res.status(200).json(posts);
  writeToLog('/posts', req.query, posts);
});

// GET /posts/:postId
app.get('/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId, 10); // Añadir radix 10
  const post = posts.find(post => post.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.status(200).json(post);
  writeToLog('/posts/:postId', req.params, post);
});

// POST /posts
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  res.status(200).json(newPost);
  writeToLog('/posts', req.body, newPost);
});

// PUT /posts/:postId
app.put('/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId, 10); // Añadir radix 10
  const { title, content } = req.body;
  const post = posts.find(post => post.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  post.title = title;
  post.content = content;
  res.status(200).json(post);
  writeToLog('/posts/:postId', req.params, post);
});

// DELETE /posts/:postId
app.delete('/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId, 10); // Añadir radix 10
  posts = posts.filter(post => post.id !== postId);
  res.status(204).end();
  writeToLog('/posts/:postId', req.params, '');
});

// Manejo de endpoint no implementado
app.use((req, res, next) => {
  res.status(501).send('Not Implemented');
  writeToLog(req.url, req.body, res);
});

// Middleware para manejar errores de sintaxis en los datos enviados
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).send('Bad Request - Invalid JSON');
  } else {
    next();
  }
  writeToLog(req.url, req.body, res);
});

// Middleware para manejar endpoints no existentes
app.use((req, res, next) => {
  res.status(404).send('Not Found');
  writeToLog(req.url, req.body, res);
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
