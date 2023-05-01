class Household{
  HoHID = "";
  householdSize = 0;
  active = "No"
}

class Client{
  constructor(clientName, isHoH){
    this.clientName = clientName;
    this.isHoH = isHoH;
  }
  enrollments = {}
}

class Enrollment{
  constructor(programName, entryDate, exitDate){
    this.programName = programName;
    this.entryDate = entryDate;
    this.exitDate = exitDate;
  }
  services = {}
  notes = {}
}

class Service{
  constructor(serviceName, amount, startDate, endDate){
    this.serviceName = serviceName;
    this.amount = amount;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class Note{
  constructor(noteDate, note, time){
    this.noteDate = noteDate;
    this.note = note;
    this.time = time;
  }
}
module.exports = {Household, Client, Enrollment, Service, Note}