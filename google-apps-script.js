/**
 * Google Apps Script for Sophie AI Sales Assistant
 * This script should be deployed as a web app to connect your Google Sheets to Sophie
 */

function doGet(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Get all data from the sheet (assuming data starts from row 2, row 1 has headers)
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Remove header row
    const dataRows = values.slice(1);
    
    // Convert to the format Sophie expects
    const leads = dataRows.map(row => {
      return {
        name: row[0] || '',          // Column A: Name
        email: row[1] || '',         // Column B: Email
        company: row[2] || '',       // Column C: Company
        role: row[3] || '',          // Column D: Role/Position
        phone: row[4] || '',         // Column E: Phone
        source: row[5] || 'website'  // Column F: Source (default to 'website')
      };
    }).filter(lead => lead.name && lead.email); // Only include rows with name and email
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        rows: leads,
        timestamp: new Date().toISOString(),
        total: leads.length
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 */
function testConnection() {
  const result = doGet();
  console.log(result.getContent());
}