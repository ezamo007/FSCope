var ClientsObject = require('../objects/clients.json')
const {arrayToHTML} = require('./arrayToHTML.js');
errors = "Here are all the errors I found:\n"
//1. Any client enrolled in incompatible programs.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  for(clientID in household){
    client = household[clientID]
    
    programNamesList = []
    
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]
      programNamesList.push(enrollment.programName)
    }
    
    var incompatibleEnrollmentPairs = [
      ["Homelessness Prevention", "Crisis Housing Vouchers"],
      ["Homelessness Prevention", "Crisis Housing Shelter"]
    ]
    for([program1, program2] of incompatibleEnrollmentPairs){
      if(programNamesList.includes(program1) && programNamesList.includes(program2)){
        errors += (`${client.clientName} enrolled in incompatible programs ${program1} and ${program2}.\n`)
      }
    }
  }
}

//2. Household members enrolled before HoH, or remained in program after HoH.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  HoHProgramDates = {}
  HoH = household[household.HoHID]
  
  for(enrollmentID in HoH.enrollments){
    enrollment = HoH.enrollments[enrollmentID]
    HoHProgramDates[enrollment.programName] = {entryDate : enrollment.entryDate, exitDate: enrollment.exitDate}
  }

  for(clientID in household){
    client = household[clientID]
    //Skip HoH.
    if(clientID == household.HoHID){continue}
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]

      if(!Object.keys(HoHProgramDates).includes(enrollment.programName)){
        errors += (`${client.clientName} in ${enrollment.programName} program and HoH ${HoH.clientName} is not.\n`)
      }else{
        if(enrollment.entryDate < HoHProgramDates[enrollment.programName].entryDate){
          errors += (`${client.clientName} enrolled in ${enrollment.programName} program before HoH ${HoH.clientName}.\n`)
        }
        if(enrollment.exitDate > HoHProgramDates[enrollment.programName].exitDate || 
           //Household member is active and HoH is exited.
          (enrollment.exitDate == "" &&  HoHProgramDates[enrollment.programName].exitDate != "")
          ){
            errors += (`${client.clientName} remained in ${enrollment.programName} program after HoH ${HoH.clientName}.\n`)
        }
      }
    }
  }
}

//4. Voucher Services span multiple months.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  for(clientID in household){
    client = household[clientID]
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]

      for(serviceID in enrollment.services){
        service = enrollment.services[serviceID]

        startMonth = service.startDate.slice(0,7);
        endMonth = service.endDate.slice(0,7);

        if(service.serviceName.includes("Voucher") && startMonth != endMonth){
          errors += (`Voucher service for ${client.clientName} in ${enrollment.programName} spans multiple months: ${startMonth} and ${endMonth}.\n`)
        }
      }
      
    }
  }
}

//5. Household member has service with money.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  for(clientID in household){
    client = household[clientID]
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]

      for(serviceID in enrollment.services){
        service = enrollment.services[serviceID]
        
        if(service.amount > 0 && clientID != household.HoHID){
          errors += (`Service with expense \$${service.amount} for household member ${client.clientName} in ${enrollment.programName} program. Head of household is ${household[household.HoHID].clientName}.\n`)
        }
      }
      
    }
  }
}

//6. Service dates are outside enrollment dates.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  for(clientID in household){
    client = household[clientID]
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]
      
      for(serviceID in enrollment.services){
        service = enrollment.services[serviceID]

        if(service.startDate < enrollment.entryDate){
          errors += (`${client.clientName} has service ${service.serviceName} in ${enrollment.programName} beginning on ${service.startDate} before program entry on ${enrollment.entryDate}.\n`)
        }
        if(service.endDate > enrollment.exitDate && enrollment.exitDate != ""){
          errors += (`${client.clientName} has service ${service.serviceName} in ${enrollment.programName} ending on ${service.endDate} after program exit on ${enrollment.exitDate}.\n`)
        }

      }
      
    }
  }
}

//7. Notes left without time or in the (usually) incorrect program.
for(householdID in ClientsObject){
  household = ClientsObject[householdID];
  for(clientID in household){
    client = household[clientID]
    for(enrollmentID in client.enrollments){
      enrollment = client.enrollments[enrollmentID]
      for(noteID in enrollment.notes){
        note = enrollment.notes[noteID];
        if(Number(note.time) == 0){
          errors += (`Warning: ${client.clientName} has note with no time in ${enrollment.programName}.\n`)
        }
        
        //When clients are enrolled in both Crisis Housing programs and Housing Navigations, we must leave notes in the Housing Navigation program.
        if(enrollment.programName.includes("Crisis")){
          errors += (`Warning: ${client.clientName} has note in ${enrollment.programName}.\n`)
        }
      }
    }
  }
}


const fs = require('fs');

function writeTextToFile(text, filename) {
  fs.writeFile(filename, text, (err) => {
    if (err) throw err;
    console.log(`File saved as ${filename}`);
	
  });
}
console.log(errors);
writeTextToFile(errors, "errors.txt");
