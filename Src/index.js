import express from 'express';
import { getAllPosts } from './db.js'; // Importar posts de './db.js'
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import pool from './conexion.js';

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
app.get('/posts', async (req, res) => {
  const posts = await getAllPosts();
  writeToLog('/posts', req.query, res);
  res.json(posts);
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
/*app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  res.status(200).json(newPost);
  writeToLog('/posts', req.body, newPost);
});
*/

app.post('/posts', async (req, res) => {
  // Extrae los datos del post del cuerpo de la solicitud
  const {
    Ciudad, Pais, Nombre_jugador, Apellido_jugador, Edad_jugador, Posicion_jugador, Equipo_local, Equipo_visitante, Goles_Local, Goles_Visitante, Fecha_partido, imagen_base64, Fase_champions,
  } = req.body;

  // Realiza validaciones básicas; puedes expandirlas según sea necesario
  if (!Ciudad || !Pais || !Nombre_jugador || !Apellido_jugador || !Edad_jugador || !Posicion_jugador || !Equipo_local || !Equipo_visitante || !Goles_Local || !Goles_Visitante || !Fecha_partido || !imagen_base64 || !Fase_champions) {
    return res.status(400).send('Datos requeridos faltantes');
  }

  try {
    // Inserta el nuevo post en la base de datos
    const result = await pool.query(
      'INSERT INTO champions (Ciudad, Pais, Nombre_jugador, Apellido_jugador, Edad_jugador, Posicion_jugador, Equipo_local, Equipo_visitante, Goles_Local, Goles_Visitante, Fecha_partido, imagen_base64, Fase_champions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [Ciudad, Pais, Nombre_jugador, Apellido_jugador, Edad_jugador, Posicion_jugador, Equipo_local, Equipo_visitante, Goles_Local, Goles_Visitante, Fecha_partido, imagen_base64, Fase_champions],
    );

    // Obtén el ID del nuevo post
    const postId = result[0].insertId;

    // Retorna el nuevo post; realiza otra consulta para obtener los datos recién insertados
    const [rows] = await pool.query('SELECT * FROM champions WHERE id = ?', [postId]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).send('Post creado pero no encontrado');
    }
  } catch (error) {
    console.error('Error al crear el post:', error);
    res.status(500).send('Error interno del servidor');
  }
  writeToLog('/posts', req.body, res);
  return { message: 'La función ha terminado correctamente' };
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

// GET /posts
app.get('/posts', async (req, res) => {
  try {
    const allPosts = await getAllPosts();
    res.status(200).json(allPosts);
    writeToLog('/posts', req.query, allPosts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

app.listen(8001, () => {
  console.log('Server is running on port 8001');
});
