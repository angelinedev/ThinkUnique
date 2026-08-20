
'use server'
import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1M-zLwLuXqUtqge_jh8mJmWFwOj__O01T5AiVs3Nycak';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Registrations'; // The name of the sheet (tab) in your spreadsheet

async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
    },
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function appendRegistrationToSheet(data: Record<string, any>) {
  try {
    const sheets = await getGoogleSheetsClient();

    const headers = [
      'Submission ID', 'Team Name', 'Edition', 'Problem Statement ID', 'Problem Statement Title',
      'Leader Name', 'Leader Email', 'Leader Phone', 'Leader Gender', 'Leader Department', 'Leader Year',
      'Presentation Link',
      ...Array.from({ length: 5 }, (_, i) => [
        `Member ${i + 1} Name`, `Member ${i + 1} Email`, `Member ${i + 1} Department`, `Member ${i + 1} Year`, `Member ${i + 1} Gender`
      ]).flat()
    ];

    const rowData = [
      data.submissionId, data.teamName, data.edition, data.problemStatementId, data.problemStatementTitle,
      data.leaderName, data.leaderEmail, data.leaderPhone, data.leaderGender, data.leaderDepartment, data.leaderYear,
      data.presentationLink || '',
      ...data.members.flatMap((m: any) => [m.name, m.email, m.department, m.year, m.gender])
    ];

    await ensureSheetAndHeaders(sheets, SPREADSHEET_ID, SHEET_NAME, headers);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    console.log('Appended to Google Sheet:', response.data);
    return { success: true };
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    return { success: false, error: 'Failed to update Google Sheet.' };
  }
}

async function ensureSheetAndHeaders(sheets: sheets_v4.Sheets, spreadsheetId: string, sheetName: string, headers: string[]) {
    if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID') {
        console.error('Google Sheet ID is not configured.');
        throw new Error('Google Sheet ID is not configured.');
    }
    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = sheetInfo.data.sheets?.some(s => s.properties?.title === sheetName);

    if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title: sheetName } } }]
            }
        });
    }
    
    const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0 || headerCheck.data.values[0].join('') !== headers.join('')) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!1:1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [headers],
            },
        });
    }
}

export async function findTeamBySubmissionId(submissionId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // Find the row matching the submission ID
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === submissionId) {
        return {
          rowIndex: i + 1, // Google Sheets rows are 1-indexed
          teamName: rows[i][1],
          edition: rows[i][2],
          problemStatementId: rows[i][3],
          problemStatementTitle: rows[i][4],
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding team by submission ID:', error);
    return null;
  }
}

export async function updateProblemStatementInSheet(
  submissionId: string,
  problemStatementId: string,
  problemStatementTitle: string
) {
  try {
    const team = await findTeamBySubmissionId(submissionId);
    if (!team) {
      return { success: false, error: 'Team ID not found.' };
    }

    const sheets = await getGoogleSheetsClient();
    const range = `${SHEET_NAME}!D${team.rowIndex}:E${team.rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[problemStatementId, problemStatementTitle]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating problem statement:', error);
    return { success: false, error: 'Failed to update problem statement.' };
  }
}
