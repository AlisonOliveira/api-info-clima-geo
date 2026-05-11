const express = require('express');
const app = express();
const axios = require('axios');

// 1. Endpoint de Health Check
app.get('/api/v1/health', (req, res) => {
    res.send({ status: 'OK', message: 'API LOCAL' });
});

// 2. Rota Dinâmica de Busca de Cidades
app.get('/api/v1/cidade/:nome/:uf', async (req, res) => {
    const cidadeDigitada = req.params.nome;
    const estadoDigitado = req.params.uf;
    const ufMaiuscula = estadoDigitado.toUpperCase();

    try {
        // CORREÇÃO: Adicionada a barra '/' antes de ${ufMaiuscula} para a URL ficar correta
        const response = await axios.get(`https://brasilapi.com.br/api/ibge/municipios/v1/${ufMaiuscula}`);

        if (Array.isArray(response.data)) {
            const cidadeEncontrada = response.data.find(
                cidade => cidade.nome.toLowerCase() === cidadeDigitada.toLowerCase()
            );

            if (cidadeEncontrada) {
                return res.json({
                    municipio: cidadeEncontrada.nome,
                    codigo_ibge: cidadeEncontrada.codigo_ibge
                });
            } else {
                return res.status(404).json({ 
                    erro: `Cidade '${cidadeDigitada}' não encontrada no estado de ${ufMaiuscula}.` 
                });
            }
        } else {
            return res.status(500).json({ error: 'Resposta da API externa inválida.' });
        }

    } catch (error) {
        console.error('Error fetching external API:', error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: `Estado/UF '${ufMaiuscula}' inválido ou não encontrado.` });
        }
        res.status(500).send({ error: 'Failed to fetch external API' });
    }
});

// CORREÇÃO: Adicionada a inicialização do servidor que estava faltando no final
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
