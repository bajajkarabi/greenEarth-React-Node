"use strict"

const IBM = require('ibm-cos-sdk');
const fs = require('fs');

var configFile = require('./config.json');

var config = {
    endpoint: configFile.endpoint,
    apiKeyId: configFile.apiKeyId,
    serviceInstanceId: configFile.serviceInstanceId,
    signatureVersion: 'iam',
};


var cos = new IBM.S3(config);

var objectStore = {};

objectStore.uploadFile = function () {
    console.log(`Uploading: ${configFile.FILE_NAME}`);

    return new Promise(function (resolve, reject) {
    fs.readFile( configFile.FILE_PATH , (e, fileData) => {
        cos.putObject({ Bucket: configFile.BUCKET_NAME, Key: configFile.FILE_NAME, Body: fileData }, function (error) {

            if (error) {
                console.log("[uploadCSV]  error: " + error);
                return reject(error)
            } else {
                console.log("[uploadCSV]  Done: ");
                return resolve(true);
            }
        });

    });
    });

}

objectStore.uploadCSV = function(csvData) {
    console.log(`Uploading: ${configFile.FILE_NAME} With Data : ${csvData}`);

    return new Promise(function (resolve, reject) {

        cos.putObject({ Bucket: configFile.BUCKET_NAME, Key: configFile.FILE_NAME, Body: csvData }, function (error) {
            if (error) {
                console.log("[uploadCSV]  error: " + error);
                return reject(error)
    
            } else {
                console.log(`[uploadCSV] Item: ${configFile.FILE_NAME} uploaded!`);
                return resolve(true);
            }
        });

    });
    

}

module.exports = objectStore;