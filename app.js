const express = require('express');
const app = express();
const path = require('path');

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.get('/', (req, res) => {
  res.send('fuck you!');
});
// sendFile will go here
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/frontend/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
