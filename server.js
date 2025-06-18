const express = require('express');
//const cors = require('cors'); // 👈 importar cors
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

//app.use(cors()); // 👈 habilita CORS para todas las rutas
app.use(express.json());

app.post('/api/:key', (req, res) => {
  try {
    const key = req.params.key;
    const filePath = path.join(__dirname, 'data', `${key}.json`);

    let data = [];

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const newItem = req.body;

    if (!newItem || typeof newItem !== 'object') {
      return res.status(400).json({ error: 'Formato inválido de datos' });
    }

    newItem.id = newItem.id || (data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1);

    data.push(newItem);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ message: 'Guardado correctamente', item: newItem });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
  }
});


// Obtener el JSON por clave
app.get('/api/:key', (req, res) => {
    const key = req.params.key;
    const filePath = path.join(__dirname, 'data', `${key}.json`);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } else {
        res.status(404).json({ error: 'No encontrado' });
    }
});

app.get('/api/:key/:id', (req, res) => {
    const key = req.params.key;
    const id = parseInt(req.params.id);
    const filePath = path.join(__dirname, 'data', `${key}.json`);

    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath));
        const item = data.find(obj => obj.id === id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'ID no encontrado' });
        }
    } else {
        res.status(404).json({ error: 'Archivo no encontrado' });
    }
});

// Actualizar parcialmente un objeto por ID (sin borrar los demás)
app.patch('/api/:key/:id', (req, res) => {
  const key = req.params.key;
  const id = parseInt(req.params.id);
  const filePath = path.join(__dirname, 'data', `${key}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const index = data.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `ID ${id} no encontrado` });
  }

  // Solo actualiza los campos enviados en req.body
  data[index] = { ...data[index], ...req.body };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ message: `Objeto con ID ${id} actualizado`, item: data[index] });
});



app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
