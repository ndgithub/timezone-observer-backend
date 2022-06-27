import 'dotenv/config';
import { formatTime } from './timeUtils.js';
import express from 'express';
const app = express();
import axios from 'axios';
let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.use(express.static('public'));

app.get('/api', (req, res) => {
  console.log('app.gasdfasdfasdfadfet');
  let sysServ = {};
  sysServ.timestamp = Math.floor(Date.now() / 1000);
  sysServ.offset = new Date().getTimezoneOffset();
  sysServ.tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`System time is ${sysServ.timestamp} secs since epoch,
  Timezone is ${sysServ.tzName}`);
  console.log(sysServ);
  axios
    .get(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${req.query.lat}%2C${req.query.lng}&timestamp=${sysServ.timestamp}&key=${process.env.API_KEY}`
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
    `--------Example app listening on port ${port} at ${formatTime(
      Date.now()
    )}--------`
  );
});
