//import config
const configFile = require('./config.json');
var objectStore = require('./objectStorage');

//import npm moduels 
const axios = require('axios');
const express = require('express');


const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});


/** 
 * 1. Invoke AQI API 
 * 2. populate CSV data 
 * 3. Upload to Objext storage
 * 4. Invoke Python API for graphical display
 */


app.get('/:lat/:lon', function (req, res) {

  let location = 'latitude :' + req.params.lat + ' longitude :' + req.params.lon;
  console.log(location);

  let AQI_URL = 'http://api.openweathermap.org/data/2.5/air_pollution?lon=' + req.params.lon + '&lat=' + req.params.lat + '&appid=' + configFile.API_KEY;
  let pythonURl = configFile.PYTHON_API_URL + location

  console.log(pythonURl);

  axios.get(AQI_URL).then(function (responseData) {

    let jsonData = JSON.stringify(responseData.data);
    console.log("[sendGetRequest] response ", jsonData);

    let airPullutants = JSON.parse(jsonData);

    if (!airPullutants || airPullutants.list.length < 1)
      res.send({ "Status": "AQI Not Found" });

    airPullutants = airPullutants.list[0].components;

    var records = [
      ['CO', airPullutants.co, ''],
      ['NO', airPullutants.no, ''],
      ['NO2', airPullutants.no2, ''],
      ['O3', airPullutants.o3, ''],
      ['SO2', airPullutants.so2, ''],
      ['PM2_5', airPullutants.pm2_5, ''],
      ['PM10', airPullutants.pm10, ''],
      ['NH3', airPullutants.nh3, ''],
    ];

    const createCsvWriter = require('csv-writer').createArrayCsvWriter;
    let csvWriter = createCsvWriter({
      header: ['COMPONENT_NAME', 'AMOUNT', ,],
      path: './output.csv',
    });

    csvWriter
      .writeRecords(records) // returns a promise
      .then(() => {
        objectStore.uploadFile().then(function (isFileUploaded) {

          if (isFileUploaded) {
            setTimeout(function () {
              console.log("Waiting ");
              res.redirect(pythonURl);
            }, 1500);

          } else res.send({ "Status": "Upload Failed" });
        });

      }).catch(function (error) {
        console.log("[process] Failed due to => ", error);
        return reject(error);
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


let port = process.env.PORT || 9000;
var server = app.listen(port);
console.log('server on : ' + port);