const axios = require('axios');
const express = require('express');
const getMaxId = require('./jsonData');
const cors = require('cors');
//const jsonData = require('./jsonData');
const fs = require('fs');
const app = express();

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// const port = process.env.PORT || 5000;

var jData = fs.readFileSync('jsonfile.json');
var histData = JSON.parse(jData);

var obj = {
  table: histData.table,
};

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//console.log(obj);
app.post('/aqi', (req, res) => {
  console.log(req.body);
});

app.get('/search', function (req, res) {
  let query = req.query.queryStr;
  let lat = '46.8182';
  let lon = '8.2275';
  let appid = '10c584214fe0d93a45fbc65300db142a',
    url = `http://api.openweathermap.org/data/2.5/air_pollution?lon=${lon}&lat=${lat}&appid=${appid}`;
  //&lon=${lon}&appid=${appid}

  //lat=22.5726&lon=88.36398&appid=10c584214fe0d93a45fbc65300db142a
  axios({
    method: 'get',
    url,
    headers: {
      Authorization: appid,
    },
    // auth: {
    //   appid: '10c584214fe0d93a45fbc65300db142a',
    // },
  })
    .then(function (response) {
      responseData = JSON.stringify(response.data);
      const jsonObj = JSON.parse(responseData);
      if (
        jsonObj['coord']['lon'] &&
        jsonObj['coord']['lat'] &&
        jsonObj['list'][0].main &&
        jsonObj['list'][0].components
      ) {
        obj.table.push({
          ID: getMaxId(),
          LON: jsonObj['coord']['lon'],
          LAT: jsonObj['coord']['lat'],
          AQI: jsonObj['list'][0].main.aqi,
          CO: jsonObj['list'][0].components.co,
          NO: jsonObj['list'][0].components.no,
          NO2: jsonObj['list'][0].components.no2,
          O3: jsonObj['list'][0].components.o3,
          SO2: jsonObj['list'][0].components.so2,
          PM2_5: jsonObj['list'][0].components.pm2_5,
          PM10: jsonObj['list'][0].components.pm10,
          NH3: jsonObj['list'][0].components.nh3,
          DATE: jsonObj['list'][0].dt,
        });
      }

      let json = JSON.stringify(obj);
      fs.writeFile('jsonfile.json', json, 'utf8', function (err) {
        if (err) throw err;
        console.log('complete');
      });

      res.send(responseData);
    })
    .catch(function (error) {
      console.log(error);
    });
});

if (process.env.NODE_ENV === 'production') {
  //Express will server prod asset..
  app.use(express.static('client/build'));
  //express will serve up the app.js file if it does not recon the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

let port = process.env.PORT || 5678;
var server = app.listen(port);
console.log('server on : ' + port);
