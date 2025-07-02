const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Hardcoded configuration values
const SHEET_ID = '12hg96jJOAcgjYGJ3aXYOv1dHmpKjk7LiTdhWB7SZMwQ';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'workflow-builder@workflow-builder-464701.iam.gserviceaccount.com';
const GOOGLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCPaHtn4P5n+jGg
Oi92QskfG/i5Ycfo7J42ZcNvD5Bu8mBCpRaXQowUeCcrP+yXVRRtLVh6tgn8UotK
OaEMxwBEsWxR+kEijFjtNIGca9b3TzvbiwpvAn1kCVe4s4DAPq0SyP/kS8MLyI40
5Ao3YkN9s6/KAAFeq07813D038OVjqdOEwJddyIjjJJjUMLmq7nKFze4uL8dkeh8
NkV9oBbeJADjpmTx5oK8kSU3GLBBtZcq1mrurFN4AfiWCicM4v+A1r+qEm2hDrJ/
1kEGuV3b6hmi5RetF78tDKW2zKRYpOkmx5jMZlrH/TLXS1i1M/MYT5DrhkfZsP83
g2sFzUaJAgMBAAECggEAA3MfeNW8OPMXS4PqzVz46pMpLghwnyVF/wf+pgbJUinp
b+D5xKS4qutjAdLVVaSZy7CKDtWfMt8nc58kRSLqWjysXuJ2u6aFoxsevQ0JDETv
Ky5Sj24PZx8kaZCD2dwIHMoSAcNiyz9FUHdl2YQ3HGh8o47ReZ4EVee202Uolsng
+01Xfu8fBPg/8tdvz8yZY+rnTVzeTVGwQ4M5NrkGAIKg1PBM8MULPTGyFvqYKuAs
uBmmZqKftNZ96ecgj5zDOFXHFNKsCu1C9+JSKOpuBj5UM9y3jyjGPKSlB2oZUwfw
QFlfZIv2/6bavtWY0+h3AQYv8YicSoA+fWY5OFQA6wKBgQDCT1O2a2kICqQdQO7C
8dGMzsKB7UEmC4jJ5YPq7x0py7mgs9btPPmoCCHWpgO67OzhPNjccCjg8PQnSQbl
6JeE4GVvmfB9G6ZDCVWN7vuwADP5xgHdwW680XXG6f4ZiaUQLGuJr38WfSzsKptz
6TAVDhIkCyds/67oK9ZH0g3XRwKBgQC88BSAG4aEm2wAsH0DFasibIv3b7Ei/HCg
YgE8cWfvA9xlSoBTE9d/z86peVf/5B1MQOjFakrhxHwJQnN36GdGKRcKTWRLryw1
JJ0cHg80xaagHbE5dBc0TffeD0hfl9O21JW/ZRtNxdgWVZfVnPUF/Q5B+I6f40In
BGpgvNh7rwKBgF12UJrG8V9H1wanK/Ei5Ztn/FEIcLS/CY2rUxeW6h0ne+Mbfb7g
/GjheH1JnzOzMIFqhhkJ7e+8loOq8aF2jiMA2GmkzvMucHuAKuG5WOCgSF/U6SLk
HsK9sXv7Ixjfh0DPTO6ONn/3t7rlB57qRBFskjc6Ej2wgk30f/5NwBCTAoGAHpIJ
/yB1B4fOVd44nAMpiYxeqU6dLrgB0TGKWalP09CgHJONZ+PR/pA1NB66KmFSjEAE
aczlCNqt5yGlZUVpUGTdoYEcNVLGqGKgOShz9Wn1p/ql7lHmX0QuUvPOFgmO7ApB
oJJPdKoKaLK4uouG6c0kPXBmQ2CWF5ITVEu6C2kCgYEAlCr5jxdQB71OK9lgwAQ6
LxryK9zRO8OaTVX13eIG0WEqaSyQxQWKCcmcP8V3Tl99Z4UFz2k0vVuqLx2nXIrU
uFxiIhsgmyvM1YhAYWii7vrFWwnZAhME0Djr47S6sh4yCX7Izw+IpnPCnAEKRAfp
rUYPzDWfKpCt2Ul/NkTdVJ8=
-----END PRIVATE KEY-----`;

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
