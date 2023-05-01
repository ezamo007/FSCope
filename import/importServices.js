var {Household, Client, Enrollment, Service, Note} = require('./classes.js')
const fs = require('fs');
const {parse} = require('csv-parse');
const streamToPromise = require('stream-promise/to-promise')

var ClientsObject = require('../objects/clients.json')
var ClientsObjectWritePath = './objects/clients.json'

function addHouseholds(err,data){
  if(err){
    console.log(`An error was encountered: ${err}`)
    return
  }
  data.shift()
  
  // services.csv Row Indices
  //0. Family ID
  //1. Client ID
  //2. Program ID
  //3. Service ID
  //4.Service Name
  //5.Service Amount
  //6.Start Date
  //7.End Date
  
  data.forEach(
    row =>{      
      //Add service to enrollment.
      ClientsObject[row[0].toString()][row[1].toString()].enrollments[row[2].toString()].services[row[3]] = new Service(row[4], row[5], row[6],row[7]);

    }
  )
}

function writeObject(){
  fs.writeFile(ClientsObjectWritePath, JSON.stringify(ClientsObject),(err) => {
    if(err){
      console.log(err);
    }else{
      console.log(`Successfully wrote services to ${ClientsObjectWritePath}`)
    }
  })
}

function importData() {
  readStream = fs.createReadStream('./spreadsheets/services.csv')
  var readStreamPromise = streamToPromise(readStream)
  readStream.pipe(parse({delimiter : ','}, addHouseholds))
  
  readStreamPromise.then(
   result => {writeObject()} 
  )
}

importData()