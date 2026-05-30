const request = require('supertest');
const express = require('express');
const axios = require('axios');

jest.mock('axios');

const climaRouter = require('./endpoint1');
const cidadesRouter = require('./endpoint2');

const appClima = express();
appClima.use('/api/v1', climaRouter);

const appCidades = express();
appCidades.use('/api/v1', cidadesRouter);

// Health Check

describe('Health Check', () => {
    test('GET /api/v1/health responde com status healthy', async () => {
        const res = await request(appClima).get('/api/v1/health');

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('healthy');
        expect(res.body.versao).toBe('1.0.0');
        expect(res.body).toHaveProperty('timestamp');
    });
});

// Endpoint Clima

describe('Endpoint Clima', () => {
    const cidadesMock = [
        { id: 244, nome: 'Fortaleza', estado: 'CE' }
    ];

    const climaMock = {
        clima: [
            { data: '2026-05-27', min: 24, max: 31, condicao_desc: 'Ensolarado' },
            { data: '2026-05-28', min: 23, max: 30, condicao_desc: 'Parcialmente nublado' }
        ]
    };

    test('caso sucesso: retorna previsão do clima da cidade', async () => {
        axios.get
            .mockResolvedValueOnce({ data: cidadesMock })
            .mockResolvedValueOnce({ data: climaMock });

        const res = await request(appClima).get('/api/v1/clima/Fortaleza');

        expect(res.statusCode).toBe(200);
        expect(res.body.municipio).toBe('Fortaleza');
        expect(res.body.estado).toBe('CE');
        expect(Array.isArray(res.body.clima)).toBe(true);
        expect(res.body.clima[0]).toMatchObject({
            data: '2026-05-27',
            temperatura_manima: 24,
            temperatura_maxima: 31,
            condicao: 'Ensolarado'
        });
    });

    test('erro 404: cidade não encontrada na API externa', async () => {
        const err = new Error('Not Found');
        err.response = { status: 404 };
        axios.get.mockRejectedValueOnce(err);

        const res = await request(appClima).get('/api/v1/clima/CidadeInexistente');

        expect(res.statusCode).toBe(404);
        expect(res.body.erro).toBe(true);
        expect(res.body.codigo).toBe('CIDADE_NAO_ENCONTRADA');
    });

    test('erro 400: nome da cidade com menos de 3 caracteres', async () => {
        const res = await request(appClima).get('/api/v1/clima/AB');

        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toBe(true);
        expect(res.body.codigo).toBe('NOME_INVALIDO');
        expect(res.body.nome_informado).toBe('AB');
    });
});

// Endpoint Cidades

describe('Endpoint Cidades', () => {
    const municipiosMock = [
        { nome: 'Fortaleza' },
        { nome: 'Caucaia' },
        { nome: 'Juazeiro do Norte' },
        { nome: 'Maracanaú' },
        { nome: 'Sobral' }
    ];

    test('caso sucesso: retorna lista de cidades do estado', async () => {
        axios.get.mockResolvedValueOnce({ data: municipiosMock });

        const res = await request(appCidades).get('/api/v1/cidades/CE?limite=5');

        expect(res.statusCode).toBe(200);
        expect(res.body.uf).toBe('CE');
        expect(res.body.quantidade_retornada).toBe(5);
        expect(Array.isArray(res.body.cidades)).toBe(true);
        expect(res.body.cidades[0]).toEqual({ nome: 'Fortaleza' });
        expect(res.body).toHaveProperty('consultado_em');
    });

    test('erro 404: estado não encontrado na API externa', async () => {
        const err = new Error('Not Found');
        err.response = { status: 404 };
        axios.get.mockRejectedValueOnce(err);

        const res = await request(appCidades).get('/api/v1/cidades/XX');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toMatch(/XX/);
    });

    test('erro 400: sigla do estado com mais ou menos de 2 letras', async () => {
        const res = await request(appCidades).get('/api/v1/cidades/INVALIDO');

        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toBe(true);
        expect(res.body.codigo).toBe('SIGLA_INVALIDA');
        expect(res.body.nome_informado).toBe('INVALIDO');
    });
});
