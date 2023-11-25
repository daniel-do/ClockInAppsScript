var ss = SpreadsheetApp.openById('1R2UTbVEjMt8D8PWSVtHpEdLtNBTlF4N5zfhOqwsVYkY')
var vUsers = ss.getSheetByName('vUsers');
var cUsers = ss.getSheetByName('cUsers');
var userlr =  vUsers.getLastRow()+1;
var currlr =  cUsers.getLastRow()+1;


function getUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

function doGet(e) {
  var htmlOutput =  HtmlService.createTemplateFromFile('login');
  htmlOutput.message = '';
  return htmlOutput.evaluate();
}

function doPost(e) {
    Logger.log(JSON.stringify(e));
    if(e.parameter.LoginButton == 'Login'){    
    var username = e.parameter.username;
    var password = e.parameter.password;
    var vdate = vlogin(username, password);
    if(vdate == 'TRUE' && e.parameter.username != "" && e.parameter.password != ""){
      var htmlOutput =  HtmlService.createTemplateFromFile('TimeTracker');
      htmlOutput.username = username;
      htmlOutput.message = '';
      return htmlOutput.evaluate();   
      }else{
      var htmlOutput =  HtmlService.createTemplateFromFile('login');
      htmlOutput.message = 'Failed to Login';
      return htmlOutput.evaluate();     
     }}else if(e.parameter.LogoutButton == 'Logout'){
     louNow(e.parameter.username);
     var htmlOutput =  HtmlService.createTemplateFromFile('login');
     htmlOutput.message = 'Logged Out';
     return htmlOutput.evaluate(); 
     }

    function vlogin(username, password){
    var flag  = '';
    for(var x = 1; x <= currlr; x++){
    if(cUsers.getRange(x, 2).getValue()== username){
        flag = 'TRUE';
    var d = new Date();
    cUsers.getRange(x, 1).setValue(d);
    }}
    if( flag == ''){
    for(var i = 1; i <= userlr; i++){
    if(vUsers.getRange(i, 1).getValue()== username&& 
    vUsers.getRange(i, 2).getValue() == password){
        flag = 'TRUE';
    var sv = vUsers.getRange(i,8).getValue();
    cUsers.insertRowAfter(1).appendRow([new Date(),username,,sv]);
        }    
    }
  }if(flag == ''){
    flag = 'FALSE'; 
  }return flag;}
  }

function louNow(username){
  for(var b = 1; b <= currlr; b++){
  if(cUsers.getRange(b, 2).getValue() == username){
    cUsers.deleteRow(b);
    }      
  }

}

function clockIn(employee) {
  
  //DEFINE ALL ACTIVE SHEETS
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //DEFINE MAIN SHEET          
  var mainSheet = ss.getSheetByName("MAIN");

  //LAST ROW ON MAIN SHEET
  var lastRow = mainSheet.getLastRow();
  
  //Define Return Variables
  var return_date = '';
  var error = 'SUCCESS';
  var return_array = [];

  for (var j = 2; j <= lastRow; j++)
  {
    // CHECK CLOCK IN
    if(employee ==  mainSheet.getRange(j, 1).getValue() && mainSheet.getRange(j,3).getValue() == '')
    {
      error = 'Need to Clock Out before Clocking In';
      return_array.push([error, return_date, employee]);
      return return_array;
    }
    
  }
  
  var new_date = new Date();
  return_date = getDate(new_date);
  
  // ADD CLOCK IN RECORD
  mainSheet.getRange(lastRow+1,1).setValue(employee)
  .setFontSize(12);
  mainSheet.getRange(lastRow+1,2).setValue(new_date)
  .setNumberFormat("MM/dd/yyyy hh:mm:ss A/P")
  .setHorizontalAlignment("left")
  .setFontSize(12);
  
  return_array.push([error, return_date, employee]);
  return return_array;
  
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getDate(date_in)
{
  var currentDate = date_in;
  var currentMonth = currentDate.getMonth()+1;
  var currentYear = currentDate.getFullYear();
  var currentHours = (addZero(currentDate.getHours()) > 12) ? addZero(currentDate.getHours()) - 12 : addZero(currentDate.getHours());
  var currentMinutes = addZero(currentDate.getMinutes());
  var currentSeconds = addZero(currentDate.getSeconds());
  var suffix = (addZero(currentDate.getHours()) >= 12)? 'PM' : 'AM';
  var date = currentMonth.toString() + '/' + currentDate.getDate().toString() + '/' + 
             currentYear.toString() + ' ' + currentHours.toString() + ':' +
             currentMinutes.toString() + ':' + currentSeconds.toString() + ' ' + suffix;
  
  return date;
}


function clockOut(employee) {
  
  //DEFINE ALL ACTIVE SHEETS
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //DEFINE MAIN SHEET          
  var mainSheet = ss.getSheetByName("MAIN");

  //LAST ROW ON MAIN SHEET
  var lastRow = mainSheet.getLastRow();
  
  var foundRecord = false;
  
  var new_date = new Date();
  var return_date = getDate(new_date);
  var error = 'SUCCESS';
  var return_array = [];
  
  for (var j = 2; j <= lastRow; j++)
  {
    // FIND CLOCK IN RECORD
    if(employee ==  mainSheet.getRange(j, 1).getValue() && mainSheet.getRange(j,3).getValue() == '')
    {
      // UPDATE CLOCK IN RECORD
      mainSheet.getRange(j,3)
      .setValue(new_date)
      .setNumberFormat("MM/dd/yyyy hh:mm:ss A/P")
      .setHorizontalAlignment("left")
      .setFontSize(12);
      var totalTime = (mainSheet.getRange(j,3).getValue() - mainSheet.getRange(j,2).getValue()) /(60*60*1000);
      mainSheet.getRange(j,4).setValue(totalTime.toFixed(2))
      .setNumberFormat("#0.00")
      .setHorizontalAlignment("left")
      .setFontSize(12);  
      foundRecord = true;     
    }
    
  }
  
  // IF NO CLOCK IN RECORD
  if(foundRecord == false)
  {
    return_array.push(['Need to Clock In First', '', employee]);
    return return_array; 
  }
  
  // CALL TOTAL HOURS
  TotalHours();
  
  return_array.push([error, return_date, employee]);
  return return_array;
}

function TotalHours()
{
  
  //DEFINE ALL ACTIVE SHEETS
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //DEFINE MAIN SHEET          
  var mainSheet = ss.getSheetByName("MAIN");

  //LAST ROW ON MAIN SHEET
  var lastRow = mainSheet.getLastRow();
  
  //DEFINE ARRAY
  var totals = [];
  
  //LOOP THROUGH ALL RATES
  for (var j = 2; j <= lastRow; j++)
  {
    var rate = mainSheet.getRange(j, 4).getValue();
    var name = mainSheet.getRange(j, 1).getValue();
    var foundRecord = false;
    
    for(var i = 0; i < totals.length; i++)
    {
       //FOUND RECORD ADD TO TOTAL
       if(name == totals[i][0] && rate != '')
       {         
         totals[i][1] =  totals[i][1] + rate;
         foundRecord = true;
       }
    }
    
    //ADD NEW RECORD, EXISTING RECORD NOT FOUND
    if(foundRecord == false && rate != '')
    {
      totals.push([name, rate]);
    }
    
  }
  
  //CLEAR DATA
  mainSheet.getRange("F5:G1000").clear();
  
  //DISPLAY TOTALS
  for(var i = 0; i < totals.length; i++)
  {
    mainSheet.getRange(2+i,6).setValue(totals[i][0]).setFontSize(12);
    mainSheet.getRange(2+i,7).setValue(totals[i][1]).setFontSize(12);  
  } 
}