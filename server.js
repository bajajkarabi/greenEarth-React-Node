//import config
const configFile = require('./config.json');
var objectStore = require('./objectStorage');

const path = './images/image.png'

//import npm moduels 
const axios = require('axios');
const express = require('express');
const fs = require('fs');
const Path = require('path');
const request = require('request');
const cors = require('cors');

const app = express();

var corsOptions = {
  origin: 'https://hackathon-2021-greenearth.herokuapp.com',
  optionsSuccessStatus: 200,
  methods: "GET, PUT"
}
app.use(cors(corsOptions));

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
  axios.get(AQI_URL).then(function (responseData) {

    let jsonData = JSON.stringify(responseData.data);
    console.log("[sendGetRequest] response ", jsonData);

    let airPullutants = JSON.parse(jsonData);

    if (!airPullutants || airPullutants.list.length < 1)
      res.send({ "Status": "AQI Not Found" });

    let airPullutantList = airPullutants.list[0].components;

    console.log(Object.entries(airPullutantList))
    var csvData = ['COMPONENT_NAME', 'AMOUNT',
      ['CO', airPullutantList.co],
      ['NO', airPullutantList.no],
      ['NO2', airPullutantList.no2],
      ['O3', airPullutantList.o3],
      ['SO2', airPullutantList.so2],
      ['PM2_5', airPullutantList.pm2_5],
      ['PM10', airPullutantList.pm10],
      ['NH3', airPullutantList.nh3],
    ];

    objectStore.uploadCSV(JSON.stringify(csvData)).then(function (isFileUploaded) {
      let pythonURl = configFile.PYTHON_API_URL + location

      console.log(pythonURl);
      const path = Path.resolve(__dirname, 'images', 'code.jpg')
      const writer = fs.createWriteStream(path)

      if (isFileUploaded) {

        setTimeout(function(){
          console.log("Waiting ");
          res.redirect(pythonURl);
        }, 1500);
        
      } else res.send({ "Status": "Upload Failed" });
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