const express = require('express');
const app = express();

const climaRouter = require('./endpoint1');
const cidadesRouter = require('./endpoint2');

app.use('/api/v1', climaRouter);
app.use('/api/v1', cidadesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
