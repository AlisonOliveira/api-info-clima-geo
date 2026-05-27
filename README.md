# API de Informações de Clima e Cidades

API REST em Node.js que consulta previsão do tempo e lista municípios por estado, usando a BrasilAPI como fonte de dados.

## Como rodar

Instale as dependências:

```bash
npm install
```

Suba o servidor:

```bash
npm start
```

O servidor vai rodar em `http://localhost:3000`.

---

## Endpoints

### Health Check

```
GET /api/v1/health
```

Retorna se a API está funcionando.

**Resposta:**
```json
{
  "status": "healthy",
  "versao": "1.0.0",
  "timestamp": "2026-05-27T10:00:00.000Z"
}
```

---

### Previsão do tempo por cidade

```
GET /api/v1/clima/:nome
```

Busca a previsão dos próximos dias para uma cidade.

**Parâmetros:**
- `nome` — nome da cidade (mínimo 3 caracteres)

**Exemplo:**
```
GET /api/v1/clima/Fortaleza
```

**Resposta:**
```json
{
  "municipio": "Fortaleza",
  "estado": "CE",
  "clima": [
    {
      "data": "2026-05-27",
      "temperatura_manima": 24,
      "temperatura_maxima": 31,
      "condicao": "Ensolarado"
    }
  ]
}
```

**Erros possíveis:**
- `400` — nome com menos de 3 caracteres
- `404` — cidade não encontrada

---

### Cidades por estado

```
GET /api/v1/cidades/:uf?limite=10
```

Lista os municípios de um estado.

**Parâmetros:**
- `uf` — sigla do estado com 2 letras (ex: CE, SP, RJ)
- `limite` *(opcional)* — quantidade de cidades retornadas, entre 1 e 100. Padrão: 10

**Exemplo:**
```
GET /api/v1/cidades/CE?limite=5
```

**Resposta:**
```json
{
  "uf": "CE",
  "quantidade_retornada": 5,
  "cidades": [
    { "nome": "Fortaleza" },
    { "nome": "Caucaia" }
  ],
  "consultado_em": "2026-05-27T10:00:00.000Z"
}
```

**Erros possíveis:**
- `400` — sigla inválida (diferente de 2 letras) ou limite fora do intervalo permitido
- `404` — estado não encontrado

---

## Testes

Os testes cobrem os dois endpoints e usam Jest + Supertest. As chamadas à BrasilAPI são mockadas, então não precisa de internet para rodar.

**Cenários testados:**
- Health check respondendo corretamente
- Clima: retorno com sucesso, erro 400 (nome curto) e erro 404 (cidade não encontrada)
- Cidades: retorno com sucesso, erro 400 (sigla inválida) e erro 404 (estado não encontrado)

Para rodar:

```bash
npm test
```
