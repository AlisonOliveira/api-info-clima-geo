const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/health', async (req, res) => {
    const versao = "1.0.0";
    const timestamp = new Date().toISOString();

    try {
        return res.status(200).json({
            status: "healthy",
            versao: versao,
            timestamp: timestamp
        });
    } catch (error) {
        return res.status(200).json({
            status: "degraded",
            versao: versao,
            timestamp: timestamp,
            motivo: "Serviço externo indisponível"
        });
    }
});

router.get('/cidades/:uf', async (req, res) => {
    const estadoDigitado = req.params.uf.toUpperCase();

    let limite = parseInt(req.query.limite, 10);
    if (isNaN(limite)) {
        limite = 10;
    }

    if (estadoDigitado.length !== 2) {
        return res.status(400).json({
            erro: true,
            codigo: "SIGLA_INVALIDA",
            mensagem: "A sigla do estado deve conter exatamente 2 letras.",
            nome_informado: estadoDigitado
        });
    }

    if (limite < 1 || limite > 100) {
        return res.status(400).json({
            erro: true,
            codigo: "LIMITE_INVALIDO",
            mensagem: "O limite deve ser um número entre 1 e 100",
            limite_informado: limite
        });
    }

    try {
        const response = await axios.get(`https://brasilapi.com.br/api/ibge/municipios/v1/${estadoDigitado}`);

        if (Array.isArray(response.data)) {
            const cidadesLimitadas = response.data
                .map(cidade => ({ nome: cidade.nome }))
                .slice(0, limite);

            return res.status(200).json({
                uf: estadoDigitado,
                quantidade_retornada: cidadesLimitadas.length,
                cidades: cidadesLimitadas,
                consultado_em: new Date().toISOString()
            });
        }

        return res.status(500).json({ error: 'Resposta da API externa inválida.' });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: `Estado com a sigla '${estadoDigitado}' não foi encontrado.` });
        }
        return res.status(500).json({ error: 'Erro ao conectar com a API externa.' });
    }
});

module.exports = router;

if (require.main === module) {
    const app = express();
    app.use('/api/v1', router);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}
