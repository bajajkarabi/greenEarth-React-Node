const express = require("express");
const axios = require('axios');


app = express();
app.use(express.json());


var objectStore = require('./objectStorage');
const { stat } = require("fs");

/******************************************/
const port = 9000;
console.log('listening on ' + port);

app.listen(port);

/** 
 * 1. Invoke AQI API 
 * 2. populate CSV data 
 * 3. Upload to Objext storage
 * 4. Invoke Python API for graphical display
 */



function process(jsonData) {

    return new Promise(function (resolve, reject) {
        //parse JSON data and populate the csv format 



        let csvData = JSON.stringify(jsonData);
        objectStore.uploadCSV(csvData).then(function (status) {
            return resolve(status);
        }).catch(function (error) {
            console.log("[process] Failed due to => ", error);
            return reject(error);
        });

    });

}

const sendGetRequest = async (url) => {
    try {
        const resp = await axios.get(url);
        return resp.data;
    } catch (err) {
        console.error(err);
    }
};




function getAPIResponse(url) {
    axios({
        method: 'get',
        url
    }).then(function (response) {

        let csvData = JSON.stringify(response.data);
        console.log(">>>>>", csvData);
        writeFileOS(csvData);

        //3. Upload to Objext storage
        objectStore.uploadCSV(csvData);
        let pyUrl = 'https://hackathon-2021-greenearth.herokuapp.com/kolkata';
        console.log("pyUrl", pyUrl);
        //4. invoke PythonApi 
        axios({
            method: 'get',
            pyUrl,
        }).then(function (res) {
            cosnsole.log("Res from python ==> ", res);
        });
    }).catch(function (error) {
        console.log(error);
    });


}

app.get('/Hello/:lat/:lon', function (req, res) {

    let latitude = req.params.lat;
    let longitude = req.params.lon;
    console.log(latitude, longitude);
    var AQI_URL = 'http://api.openweathermap.org/data/2.5/air_pollution?lon=' + longitude + '&lat=' + latitude + '&appid=10c584214fe0d93a45fbc65300db142a';
    console.log(AQI_URL);
    res.send(AQI_URL);
});



app.get('/:lat/:lon', function (req, res) {

    let location = 'latitude : '+req.params.lat +'longitude : '+ req.params.lon;
    console.log(location);

    let AQI_URL = 'http://api.openweathermap.org/data/2.5/air_pollution?lon=' +  req.params.lon + '&lat=' + req.params.lat + '&appid=10c584214fe0d93a45fbc65300db142a';
    let PYTHON_API = 'https://hackathon-2021-greenearth.herokuapp.com/'+location

    sendGetRequest(AQI_URL).then(function (jsonData) {
        console.log("[sendGetRequest] response ", jsonData);
        process(jsonData).then(function (isFileUploaded) {
            console.log("isFileUploaded ? ", isFileUploaded);
            if (isFileUploaded)
                res.redirect(PYTHON_API);
            else res.send({ "Status": "Failed" });
        });
    }).catch(function (error) {
        console.log("[sendGetRequest] Err due to :::", error);
        res.send({ "Status": "Failed" });
    });
});
