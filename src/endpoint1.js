const express = require('express');
const app = express();
const axios = require('axios');

// Endpoint de Health Check
app.get('/api/v1/health', async (req, res) => {
    const versao = "1.0.0";
    const timestamp = new Date().toISOString();

    try {
        // Sucesso 
        return res.status(200).json({
            status: "healthy",
            versao: versao,
            timestamp: timestamp
        });

    } catch (error) {
        // Falha na API externa
        return res.status(200).json({
            status: "degraded",
            versao: versao,
            timestamp: timestamp,
            motivo: "Serviço externo indisponível"
        });
    }
});

//  Busca de Cidades
app.get('/api/v1/clima/:nome', async (req, res) => {
    const cidadeDigitada = req.params.nome;
    

      if (cidadeDigitada.length < 3) {
        return res.status(400).json({
            erro: true,
            codigo: "NOME_INVALIDO",
            mensagem: "O nome da cidade deve conter pelo menos 3 caracteres",
            nome_informado: cidadeDigitada
        });
    }

    try {
        
        const response = await axios.get(`https://brasilapi.com.br/api/cptec/v1/cidade/${cidadeDigitada}`);
    
        if (Array.isArray(response.data)) {
            const cidadeEncontrada = response.data.find(
                cidade => cidade.nome.toLowerCase() === cidadeDigitada.toLowerCase()
            );

            if (cidadeEncontrada) {
                const id = cidadeEncontrada.id;

                const response2 = await axios.get(`https://brasilapi.com.br/api/cptec/v1/clima/previsao/${id}`);

                climaFiltrado = response2.data.clima.map(dia => {
                    return {
                        data: dia.data,
                        temperatura_manima: dia.min,
                        temperatura_maxima: dia.max,
                        condicao: dia.condicao_desc
                    };
                });
                return res.json({
                    municipio: cidadeEncontrada.nome,
                    estado: cidadeEncontrada.estado,
                    clima: climaFiltrado 

                });
                
            } else {
                return res.status(404).json({ 
                    erro: true,
                    codigo: "CIDADE_NAO_ENCONTRADA",
                    mensagem: "Nenhuma cidade encontrada com o nome informado",
                    nome_informado: "CidadeInexistente"
                });

            }
        } else {
            return res.status(500).json({ error: 'Resposta da API externa inválida.' });
        }

    } catch (error) {
        console.error('Error fetching external API:', error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "Nenhuma cidade encontrada com o nome informado",
                nome_informado: cidadeDigitada
            });
        }

        res.status(500).send({ error: 'Failed to fetch external API' });
    }
});

//Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});