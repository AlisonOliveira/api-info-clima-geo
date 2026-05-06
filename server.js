const express = require('express');
const app = express();

app.get('/api/v1/health', (req, res) => {
  res.send('API LOCAL');
});
const PORT = process.env.PORT || 3000;          
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});