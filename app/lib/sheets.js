const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Get values from environment variables
const SHEET_ID = process.env.SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function getSheet() {
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  return doc.sheetsByIndex[0]; // Get the first sheet
}

export async function saveWorkflow(workflowData) {
  try {
    const sheet = await getSheet();
    
    const newRow = {
      id: Date.now().toString(),
      title: workflowData.title,
      steps: JSON.stringify(workflowData.steps),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await sheet.addRow(newRow);
    return { success: true, id: newRow.id };
  } catch (error) {
    console.error('Error saving workflow:', error);
    return { success: false, error: error.message };
  }
}

export async function getWorkflows() {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.get('id'),
      title: row.get('title'),
      steps: JSON.parse(row.get('steps') || '[]'),
      created_at: row.get('created_at'),
      updated_at: row.get('updated_at')
    }));
  } catch (error) {
    console.error('Error getting workflows:', error);
    return [];
  }
}
