const DRIVE_FOLDER_ID = '1pYZ_1892K62gCxQIh__5jms0MxrxEXVY';
const SHEET_NAME = 'ข้อมูลร้องเรียน_v2';

const HEADERS = [
  'ref_code', 'created_at', 'category', 'department', 'title',
  'description', 'location_campus', 'location_building', 'urgency_level',
  'is_anonymous', 'contact_name', 'contact_info', 'attachment_url',
  'status', 'admin_reply', 'show_public', 'assignee', 'forward_status',
  'public_name', 'public_contact', 'pin_hash'
];

function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0A2A66');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    // Ensure headers exist just in case
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setBackground('#0A2A66');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function maskName(fullName) {
  if (!fullName || fullName === '-') return fullName;
  fullName = fullName.trim();
  const spaceIndex = fullName.indexOf(' ');
  if (spaceIndex !== -1) {
    const firstName = fullName.substring(0, spaceIndex);
    const lastName = fullName.substring(spaceIndex + 1).trim();
    if (lastName.length > 0) {
      return firstName + ' ' + lastName.charAt(0) + '***';
    } else {
      return firstName + '***';
    }
  } else {
    return fullName.substring(0, 2) + '***';
  }
}

function maskContact(contact) {
  if (!contact || contact === '-') return contact;
  contact = contact.trim();
  if (contact.includes('@')) {
    const parts = contact.split('@');
    return parts[0].charAt(0) + '***@' + parts[1];
  } else if (/^\d+$/.test(contact)) {
    if (contact.length >= 7) {
      return contact.substring(0, 3) + '***' + contact.substring(contact.length - 4);
    } else {
      return contact + '***';
    }
  }
  return contact + '***';
}

function saveFilesToDrive(fileDataArray, refId) {
  if (!fileDataArray || !fileDataArray.length) return '';
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const urls = [];
    for (let i = 0; i < fileDataArray.length; i++) {
      const fileData = fileDataArray[i];
      if (!fileData) continue;
      let rawBase64 = fileData.data || fileData.base64 || '';
      if (rawBase64.indexOf(',') !== -1) {
        rawBase64 = rawBase64.split(',')[1];
      }
      const mimeType = fileData.type || fileData.mimeType || 'application/octet-stream';
      const fileName = fileData.name || fileData.filename || `file_${i + 1}`;
      
      if (rawBase64) {
        const decoded = Utilities.base64Decode(rawBase64);
        const blob = Utilities.newBlob(decoded, mimeType, refId + '_' + fileName);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        urls.push(file.getUrl());
      }
    }
    return urls.join(',');
  } catch (e) {
    Logger.log('Error saving files: ' + e.toString());
    return '';
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = initSheet();
    const createdAt = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    const attachmentUrl = saveFilesToDrive(body.fileData || body.files, body.ref_code);
    
    const publicName = body.is_anonymous ? 'ไม่ประสงค์ออกนาม' : maskName(body.contact_name);
    const publicContact = body.is_anonymous ? '-' : maskContact(body.contact_info);
    
    const rowData = [
      body.ref_code || '',
      createdAt,
      body.category || '',
      body.department || '',
      body.title || '',
      body.description || '',
      body.location_campus || '',
      body.location_building || '',
      body.urgency_level || '',
      body.is_anonymous ? 'Yes' : 'No',
      body.contact_name || '',
      body.contact_info || '',
      attachmentUrl,
      'รอดำเนินการ',
      '',
      '',
      '',
      '',
      publicName,
      publicContact,
      body.pin_hash || ''
    ];
    
    sheet.appendRow(rowData);
    const row = sheet.getLastRow();
    
    // Add formula in column V (index 22, 1-indexed)
    const formulaCell = sheet.getRange(row, 22);
    formulaCell.setFormula(`=IF(N${row}="รอดำเนินการ",INT(NOW()-INT(B${row})),"-")`);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseThaiDate(dateVal) {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  
  try {
    const str = dateVal.toString().trim();
    if (str.indexOf('/') !== -1) {
      const parts = str.split(' ');
      const dmy = parts[0].split('/');
      const hms = (parts[1] || '00:00:00').split(':');
      const year = parseInt(dmy[2], 10);
      const month = parseInt(dmy[1], 10) - 1;
      const day = parseInt(dmy[0], 10);
      const hour = parseInt(hms[0] || '0', 10);
      const min = parseInt(hms[1] || '0', 10);
      const sec = parseInt(hms[2] || '0', 10);
      return new Date(year, month, day, hour, min, sec);
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  } catch (e) {
    Logger.log('parseThaiDate error: ' + e);
  }
  return new Date();
}

function calculateDaysPassed(createdAtVal, status) {
  if (status === 'เสร็จสิ้น') return '-';
  try {
    const createdDate = parseThaiDate(createdAtVal);
    const now = new Date();
    const diff = Math.floor((now.getTime() - createdDate.getTime()) / 86400000);
    return Math.max(0, isNaN(diff) ? 0 : diff);
  } catch (e) {
    return 0;
  }
}

function formatDisplayDate(val) {
  if (!val) return '-';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
  }
  return val.toString();
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheet = initSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    if (action === 'lookup') {
      const refId = (e.parameter.refId || '').trim();
      const pinHash = (e.parameter.pinHash || '').trim();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] && row[0].toString().trim().toUpperCase() === refId.toUpperCase()) {
          const rowPin = (row[20] || '').toString().trim();
          
          if (rowPin) {
            // Case has a PIN hash (anonymous)
            if (pinHash && rowPin.toLowerCase() === pinHash.toLowerCase()) {
              return ContentService.createTextOutput(JSON.stringify({
                success: true,
                data: {
                  ref_code: row[0],
                  created_at: formatDisplayDate(row[1]),
                  category: row[2],
                  department: row[3],
                  title: row[4],
                  description: row[5],
                  location_campus: row[6],
                  location_building: row[7],
                  urgency_level: row[8],
                  is_anonymous: row[9],
                  public_name: row[18],
                  public_contact: row[19],
                  attachment_url: row[12],
                  status: row[13],
                  admin_reply: row[14],
                  days_passed: calculateDaysPassed(row[1], row[13])
                }
              })).setMimeType(ContentService.MimeType.JSON);
            } else {
              return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid PIN' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          } else {
            // Case has no PIN (revealed identity), show full data
            return ContentService.createTextOutput(JSON.stringify({
              success: true,
              data: {
                ref_code: row[0],
                created_at: formatDisplayDate(row[1]),
                category: row[2],
                department: row[3],
                title: row[4],
                description: row[5],
                location_campus: row[6],
                location_building: row[7],
                urgency_level: row[8],
                is_anonymous: row[9],
                public_name: row[18],
                public_contact: row[19],
                attachment_url: row[12],
                status: row[13],
                admin_reply: row[14],
                days_passed: calculateDaysPassed(row[1], row[13])
              }
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'stats') {
      let done = 0;
      let pending = 0;
      let processing = 0;
      const types = {};
      const recentResolved = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const status = row[13];
        const category = row[2];
        const showPublic = row[15];
        
        if (status === 'เสร็จสิ้น') done++;
        else if (status === 'รอดำเนินการ') pending++;
        else if (status === 'กำลังดำเนินการ') processing++;
        
        if (category) {
          types[category] = (types[category] || 0) + 1;
        }
        
        if (showPublic === 'โชว์') {
          recentResolved.push({
            ref_code: row[0],
            title: row[4],
            created_at: formatDisplayDate(row[1])
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: {
          total: rows.length,
          done: done,
          pending: pending,
          processing: processing,
          types: types,
          recentResolved: recentResolved.slice(-5)
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'rate') {
      // Logic for rating
      const refId = e.parameter.refId;
      const pinHash = e.parameter.pinHash;
      const rating = e.parameter.rating;
      
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === refId && rows[i][20] === pinHash) {
          Logger.log(`Rating for ${refId}: ${rating}`);
          return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Not found or invalid PIN' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
