const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const API_KEY = 'AIzaSyBAOc9xl7yekh32ePNqbyi2l5mDVXAx4YM';
let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.use(express.static(path.join(__dirname, 'public')));
// sendFile will go here
// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, '/public/index.html'));
// });

app.get('/api', (req, res) => {
  console.log('app.get');
  sysServ = {};
  sysServ.timestamp = Math.floor(Date.now() / 1000);
  sysServ.offset = new Date().getTimezoneOffset();
  sysServ.tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`System time is ${sysServ.timestamp} secs since epoch,
  Timezone is ${sysServ.tzName}`);
  console.log(sysServ);
  axios
    .get(
      //`https://timeapi.io/api/Time/current/coordinate?latitude=${req.query.lat}&longitude=${req.query.lng}`
      `https://maps.googleapis.com/maps/api/timezone/json?location=${req.query.lat}%2C${req.query.lng}&timestamp=${sysServ.timestamp}&key=${API_KEY}`
    )
    .then(function (response) {
      console.log(response);

      res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  // res.send(`lat: ${req.query.lat} lng: ${req.query.lng}`);
});

app.listen(port, () => {
  console.log(
    `*******************************************************************************************************************************************Example app listening on port ${port}`
  );
});
