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
      const email = row[1] || '';
      const timestamp = row[0] || '';
      
      // Extract name from email (before @ symbol) as fallback
      const emailName = email.split('@')[0] || '';
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      return {
        name: formattedName,         // Generated from email
        email: email,                // Column B: Email
        company: '',                 // Will be enriched by AI
        role: '',                    // Will be enriched by AI  
        phone: '',                   // Not collected in form
        source: 'website_form',      // Form submission source
        timestamp: timestamp         // Column A: Timestamp
      };
    }).filter(lead => lead.email && lead.email.includes('@')); // Only include valid emails
    
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