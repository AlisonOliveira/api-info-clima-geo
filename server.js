const express = require('express');
const app = express();
const axios = require('axios');

app.get('/api/v1/health', (req, res) => {
  res.send({status: 'OK',message: 'API LOCAL'});
});

app.get('/api/v1/cidade/:nome', async (req, res) => {
  try {
    const response = await axios.get('https://brasilapi.com.br');   
   // res.send(response.data);
  } catch (error) {
    console.error('Error fetching external API:', error);
    res.status(500).send({ error: 'Failed to fetch external API' });
  }
});

const PORT = process.env.PORT || 3000;          
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});