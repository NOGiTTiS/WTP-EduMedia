import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];

let googleAuthClient: any = null;
let sheetsClient: any = null;
let driveClient: any = null;

// Lazy initialization of auth client to prevent Next.js build-time errors
function getGoogleAuthClient() {
  if (googleAuthClient) return googleAuthClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    // Log a warning during build but don't crash compile process.
    // Crashing will only occur at runtime if someone tries to fetch sheets.
    console.warn('WARNING: Google Service Account credentials are not configured. Database will fail at runtime.');
    return null;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  googleAuthClient = new google.auth.JWT({
    email: email,
    key: privateKey,
    scopes: SCOPES,
  });

  return googleAuthClient;
}

export function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const auth = getGoogleAuthClient();
  if (!auth) throw new Error('Google Sheets API is not configured (missing credentials).');
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export function getDriveClient() {
  if (driveClient) return driveClient;
  const auth = getGoogleAuthClient();
  if (!auth) throw new Error('Google Drive API is not configured (missing credentials).');
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Define database tables and their headers
export const DB_SCHEMA: Record<string, string[]> = {
  Config: ['Key', 'Value'],
  LearningAreas: ['Id', 'Name'],
  Categories: ['Id', 'Name', 'Description'],
  Teachers: ['Id', 'Prefix', 'FirstName', 'LastName', 'LearningAreaId', 'Status'],
  Media: [
    'Id',
    'Timestamp',
    'AcademicYear',
    'Semester',
    'TeacherId',
    'TeacherName',
    'LearningAreaName',
    'CategoryId',
    'CategoryName',
    'Title',
    'Description',
    'Type',
    'Url',
  ],
  UsageReports: [
    'Id',
    'Timestamp',
    'AcademicYear',
    'Semester',
    'TeacherId',
    'TeacherName',
    'MediaId',
    'MediaTitle',
    'UsageDate',
    'TargetClass',
    'StudentCount',
    'OutcomeProblems',
  ],
};

/**
 * Verifies that the Google Spreadsheet has all the required sheets and headers.
 * If any sheet is missing, it creates it with the correct headers.
 */
export async function verifyDatabaseStructure() {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');
  }

  const sheets = getSheetsClient();

  try {
    // 1. Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = metadata.data.sheets || [];
    const existingSheetNames = existingSheets.map((s: any) => s.properties?.title).filter(Boolean) as string[];

    // 2. Identify missing sheets
    const sheetsToCreate = Object.keys(DB_SCHEMA).filter((name) => !existingSheetNames.includes(name));

    if (sheetsToCreate.length > 0) {
      // Create missing sheets in batch
      const requests = sheetsToCreate.map((name) => ({
        addSheet: {
          properties: {
            title: name,
          },
        },
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests },
      });
    }

    // 3. Ensure all sheets have the correct headers
    for (const [sheetName, headers] of Object.entries(DB_SCHEMA)) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:Z1`,
      });

      const currentHeaders = response.data.values?.[0] || [];
      const isHeaderCorrect =
        currentHeaders.length === headers.length &&
        headers.every((h, idx) => currentHeaders[idx] === h);

      if (!isHeaderCorrect) {
        // Overwrite/write the first row with headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
      }
    }

    // 4. Initialize active semester config if it doesn't exist
    const configResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Config!A2:B',
    });
    const configs = configResponse.data.values || [];
    const configMap = Object.fromEntries(configs);

    const defaultConfigs = [
      ['active_year', new Date().getFullYear() + 543 + ''], // Buddhist Calendar
      ['active_semester', '1'],
    ];

    const updates = [];
    for (const [key, value] of defaultConfigs) {
      if (!configMap[key]) {
        updates.push([key, value]);
      }
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Config!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values: updates,
        },
      });
    }

    console.log('Database schema verified and initialized successfully.');
  } catch (error) {
    console.error('Error verifying database structure:', error);
    throw error;
  }
}

let isDbVerified = false;

export async function ensureDbVerified() {
  if (isDbVerified) return;
  try {
    await verifyDatabaseStructure();
    isDbVerified = true;
  } catch (err) {
    console.error('ensureDbVerified failed:', err);
  }
}

/**
 * Generic helper to fetch all rows in a sheet (excluding the header row)
 * Returns array of objects mapped by headers
 */
export async function getSheetData<T = Record<string, any>>(sheetName: string): Promise<T[]> {
  await ensureDbVerified();
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');

  const headers = DB_SCHEMA[sheetName];
  if (!headers) throw new Error(`Sheet ${sheetName} not found in DB schema.`);

  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2:Z`, // Fetch from A2 to Z column
  });

  const rows = response.data.values || [];
  return rows.map((row: any, rowIndex: number) => {
    const obj: any = { _rowIndex: rowIndex + 2 }; // Store 1-based index (header is 1, so rows start at index 2)
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? row[idx] : '';
    });
    return obj as T;
  });
}

/**
 * Helper to append a row of data
 */
export async function appendRow(sheetName: string, data: Record<string, any>): Promise<void> {
  await ensureDbVerified();
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');

  const headers = DB_SCHEMA[sheetName];
  if (!headers) throw new Error(`Sheet ${sheetName} not found in DB schema.`);

  const rowValues = headers.map((header) => {
    const val = data[header];
    return val !== undefined && val !== null ? String(val) : '';
  });

  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowValues],
    },
  });
}

/**
 * Helper to append multiple rows of data in batch
 */
export async function appendRows(sheetName: string, dataArray: Record<string, any>[]): Promise<void> {
  await ensureDbVerified();
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');
  if (dataArray.length === 0) return;

  const headers = DB_SCHEMA[sheetName];
  if (!headers) throw new Error(`Sheet ${sheetName} not found in DB schema.`);

  const values = dataArray.map((data) => {
    return headers.map((header) => {
      const val = data[header];
      return val !== undefined && val !== null ? String(val) : '';
    });
  });

  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2`,
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });
}

/**
 * Helper to update an existing row in a sheet by its Sheet API index (_rowIndex)
 */
export async function updateRow(
  sheetName: string,
  rowIndex: number,
  data: Record<string, any>
): Promise<void> {
  await ensureDbVerified();
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');

  const headers = DB_SCHEMA[sheetName];
  if (!headers) throw new Error(`Sheet ${sheetName} not found in DB schema.`);

  const rowValues = headers.map((header) => {
    const val = data[header];
    return val !== undefined && val !== null ? String(val) : '';
  });

  const columnLetter = String.fromCharCode(64 + headers.length); // E.g., 'E' if 5 columns
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}:${columnLetter}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowValues],
    },
  });
}

/**
 * Helper to delete a row by its index (_rowIndex).
 * Shifting rows is done using spreadsheet batchUpdate requests to prevent gaps.
 */
export async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  await ensureDbVerified();
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SPREADSHEET_ID is not configured.');

  const sheets = getSheetsClient();

  // 1. Get Sheet ID
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = metadata.data.sheets?.find((s: any) => s.properties?.title === sheetName);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error(`Sheet ${sheetName} not found in spreadsheet.`);
  }

  // 2. Perform delete dimension request (rows are 0-indexed in dimension requests)
  const zeroBasedIndex = rowIndex - 1;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: zeroBasedIndex,
              endIndex: zeroBasedIndex + 1,
            },
          },
        },
      ],
    },
  });
}

/**
 * Google Drive helper: find a folder by name inside a parent folder,
 * or create it if it does not exist.
 */
export async function getOrCreateFolder(folderName: string, parentFolderId: string): Promise<string> {
  const drive = getDriveClient();

  // Query to find existing folder
  const query = `name = '${folderName.replace(/'/g, "\\'")}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  const response = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = response.data.files || [];
  if (files.length > 0 && files[0].id) {
    return files[0].id;
  }

  // Create folder if not found
  const createResponse = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  const newFolderId = createResponse.data.id;
  if (!newFolderId) {
    throw new Error(`Failed to create Google Drive folder: ${folderName}`);
  }

  return newFolderId;
}

/**
 * Google Drive helper: upload a file (via buffer) to a folder
 * and set its permissions to public read-only (so everyone can view/download)
 */
export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  folderId: string
): Promise<string> {
  const drive = getDriveClient();
  const stream = require('stream');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  // 1. Create/Upload file
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType,
      body: bufferStream,
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  });

  const fileId = response.data.id;
  const webViewLink = response.data.webViewLink;

  if (!fileId || !webViewLink) {
    throw new Error(`Failed to upload file to Google Drive: ${fileName}`);
  }

  // 2. Set permission to reader for anyone (anyone with link can view/download)
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });
  } catch (err) {
    console.warn(`Could not set public permission on file ${fileId}, but upload succeeded. Error:`, err);
  }

  return webViewLink;
}
