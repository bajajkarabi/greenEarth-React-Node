const express = require("express");
const axios = require('axios');
const cors = require('cors');

//import config
const configFile = require('./config.json');

app = express();
app.use(express.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

var objectStore = require('./objectStorage');


app.use(cors());
const corsOptions = {
    origin: "https://greenearth-node.herokuapp.com"
};

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



app.get('/', cors(corsOptions), function (req, res) {

    res.send({ status: 'ok' });
});


/** 
 * 1. Invoke AQI API 
 * 2. populate CSV data 
 * 3. Upload to Objext storage
 * 4. Invoke Python API for graphical display
 */


app.get('/:lat/:lon', cors(corsOptions), function (req, res) {

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

/******************************************/

let port = process.env.PORT || 9000;
app.listen(port);
console.log('listening on ' + port);
