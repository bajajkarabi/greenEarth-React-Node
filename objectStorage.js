"use strict"

const IBM = require('ibm-cos-sdk'), fs = require('fs');

var configFile = require('./config.json');

var config = {
    endpoint: configFile.endpoint,
    apiKeyId: configFile.apiKeyId,
    serviceInstanceId: configFile.serviceInstanceId,
    signatureVersion: 'iam',
};

const BUCKET_NAME = 'wit-hackathon-2021',
    FILE_NAME = 'input1.csv',
    FILE_PATH = './input1.csv';

var cos = new IBM.S3(config);

var objectStore = {};


objectStore.uploadFile = function (itemName, filePath) {
    console.log(`Creating new item: ${itemName}`);

    fs.readFile(filePath, (e, fileData) => {
        cos.putObject({ Bucket: BUCKET_NAME, Key: itemName, Body: fileData }, function (error) {

            if (error) {
                console.log("createTextFile error: " + error);

            } else {

                console.log(`createTextFile Item: ${itemName} created!`);
            }
        });
    });

}


objectStore.uploadCSV = function(csvData) {
    console.log(`Uploading: ${FILE_NAME} With Data : ${csvData}`);

    return new Promise(function (resolve, reject) {

        cos.putObject({ Bucket: BUCKET_NAME, Key: FILE_NAME, Body: csvData }, function (error) {
            if (error) {
                console.log("[uploadCSV]  error: " + error);
                return reject(error)
    
            } else {
                console.log(`[uploadCSV] Item: ${FILE_NAME} uploaded!`);
                return resolve(true);
            }
        });

    });
    

}

module.exports = objectStore;