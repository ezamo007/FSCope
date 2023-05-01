var {Household, Client, Enrollment, Service, Note} = require('./classes.js')
const fs = require('fs');
const {parse} = require('csv-parse');
const streamToPromise = require('stream-promise/to-promise')

var ClientsObject = {}
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
      //If household not in clients object, add it.
      if(!(row[0].toString() in ClientsObject)){
        ClientsObject[row[0].toString()] = new Household();
      }

      //If client not in households object, add them.
      if(!(row[1].toString() in ClientsObject[row[0].toString()])){
        ClientsObject[row[0]][row[1]] = new Client(row[3],row[4]);
        ClientsObject[row[0]].householdSize += 1;
      }

      //Add HoHID to household
      if(row[4]=="Yes"){
        ClientsObject[row[0]].HoHID = row[1];
      }      
    }
  )
}

function writeObject(){
  fs.writeFile(ClientsObjectWritePath, JSON.stringify(ClientsObject),(err) => {
    if(err){
      console.log(err);
    }else{
      console.log(`Successfully wrote households to ${ClientsObjectWritePath}`)
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