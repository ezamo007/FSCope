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
  
  // enrollments.csv Row Indices
  //0. Family ID
  //1. Client ID
  //2. Program ID
  //3. Client Name
  //4. HoH
  //5. Program Name
  //6. Entry Date
  //7. Exit Date
  
  data.forEach(
    row =>{      
      //Add enrollment to client.
      ClientsObject[row[0].toString()][row[1].toString()].enrollments[row[2].toString()] = new Enrollment(row[5], row[6], row[7]);

      //If exit date is blank, household is still active.
      if(row[7] == ""){
         ClientsObject[row[0]].active = "Yes";
      }
    }
  )
}

function writeObject(){
  fs.writeFile(ClientsObjectWritePath, JSON.stringify(ClientsObject),(err) => {
    if(err){
      console.log(err);
    }else{
      console.log(`Successfully wrote enrollments to ${ClientsObjectWritePath}`)
    }
  })
}

function importData() {
  readStream = fs.createReadStream('./spreadsheets/enrollments.csv')
  var readStreamPromise = streamToPromise(readStream)
  readStream.pipe(parse({delimiter : ','}, addHouseholds))
  
  readStreamPromise.then(
   result => {writeObject()} 
  )
}

importData()