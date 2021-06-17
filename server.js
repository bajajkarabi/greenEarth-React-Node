var environment = process.env.NODE_ENV || 'development';

const axios = require('axios');
const express = require('express');
const getMaxId = require('./jsonData');
const cors = require('cors');

const fs = require('fs');
const app = express();

//import config
const configFile = require('./config.json');
var objectStore = require('./objectStorage');

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

let getData = () => {
  axios
    .post('/aqi')
    .then((req) => console.log(req.data))
    .catch((err) => console.log(err.data));
};

// app.post('/aqi', (req, res) => {
//   console.log(req.body);
// });

app.get('/search', function (req, res) {
  let query = req.query.queryStr;
  let lat = '46.8182';
  let lon = '8.2275';
  let appid = '10c584214fe0d93a45fbc65300db142a',
    url = `https://api.openweathermap.org/data/2.5/air_pollution?lon=${lon}&lat=${lat}&appid=${appid}`;

  axios({
    method: 'get',
    url,
    headers: {
      Authorization: appid,
    },
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



/**
 * - parse JSON data and populate the csv format
 * - Upload to Objext storage
 */
function process(jsonData) {

    return new Promise(function (resolve, reject) {

        let csvData = JSON.stringify(jsonData);

        objectStore.uploadCSV(csvData).then(function (status) {
            return resolve(status);
        }).catch(function (error) {
            console.log("[process] Failed due to => ", error);
            return reject(error);
        });

    });

}
//Invoke AQI API 
const sendGetRequest = async (url) => {
    try {
        const resp = await axios.get(url);
        return resp.data;
    } catch (err) {
        console.error(err);
    }
};
/** 
 * 1. Invoke AQI API 
 * 2. populate CSV data 
 * 3. Upload to Objext storage
 * 4. Invoke Python API for graphical display
 */


app.get('/:lat/:lon', function (req, res) {

    let location = 'latitude : ' + req.params.lat + 'longitude : ' + req.params.lon;
    console.log(location);

    let AQI_URL = 'http://api.openweathermap.org/data/2.5/air_pollution?lon=' + req.params.lon + '&lat=' + req.params.lat + '&appid=' + configFile.API_KEY;

    sendGetRequest(AQI_URL).then(function (jsonData) {
        console.log("[sendGetRequest] response ", jsonData);
        process(jsonData).then(function (isFileUploaded) {
            console.log("isFileUploaded ? ", isFileUploaded);
            if (isFileUploaded)
                res.redirect(configFile.PYTHON_API_URL + location);
            else res.send({ "Status": "Failed" });
        });
    }).catch(function (error) {
        console.log("[sendGetRequest] Err due to :::", error);
        res.send({ "Status": "Failed" });
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
