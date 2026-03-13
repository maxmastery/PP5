function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    var jsonString = JSON.stringify(data);
    
    // ล้างข้อมูลเก่าในคอลัมน์ A ทั้งหมด
    sheet.getRange("A:A").clearContent();
    
    // แบ่งข้อมูลเป็นส่วนๆ ละ 40,000 ตัวอักษร (Google Sheets จำกัดเซลล์ละ 50,000 ตัวอักษร)
    var chunkSize = 40000;
    var chunks = [];
    for (var i = 0; i < jsonString.length; i += chunkSize) {
      chunks.push([jsonString.substring(i, i + chunkSize)]);
    }
    
    // บันทึกข้อมูลลงในคอลัมน์ A
    sheet.getRange(1, 1, chunks.length, 1).setValues(chunks);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // อ่านข้อมูลทั้งหมดในคอลัมน์ A
    var values = sheet.getRange("A:A").getValues();
    var jsonString = "";
    
    for (var i = 0; i < values.length; i++) {
      if (values[i][0]) {
        jsonString += values[i][0];
      }
    }
    
    var data = {};
    
    if (jsonString) {
      data = JSON.parse(jsonString);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
