function doGet(e) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  var data = { datasets: [] };
  
  if (lastRow > 0) {
    // Read all rows in column A
    var values = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    // Combine chunks back into a single JSON string
    var jsonString = values.map(function(row) { return row[0]; }).join('');
    
    if (jsonString) {
      try {
        data = JSON.parse(jsonString);
      } catch (err) {
        // If parsing fails, return empty datasets
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = getSheet();
    var requestData = JSON.parse(e.postData.contents);
    var jsonString = JSON.stringify(requestData);
    
    // A single cell in Google Sheets can hold up to 50,000 characters.
    // To prevent errors when data gets large, we split the JSON string 
    // into chunks of 40,000 characters and save them across multiple rows.
    var chunks = jsonString.match(/.{1,40000}/g) || [];
    var values = chunks.map(function(chunk) { return [chunk]; });
    
    // Clear old data and save new chunks
    sheet.clear();
    if (values.length > 0) {
      sheet.getRange(1, 1, values.length, 1).setValues(values);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get or create the "Database" sheet
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Database";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}

// Handle CORS Preflight requests
function doOptions(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}
