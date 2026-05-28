// ===== Google Apps Script (Version: DRIVE-ENABLED) =====
// เปิดใช้งานระบบอัปโหลดไฟล์ไปยัง Google Drive แล้ว

// 📁 โฟลเดอร์ Google Drive สำหรับเก็บไฟล์แนบ
const DRIVE_FOLDER_ID = '1pYZ_1892K62gCxQIh__5jms0MxrxEXVY';

function initSheet() {
  const SHEET_NAME = 'ข้อมูลร้องเรียน'; 
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  const headers = [
    'หมายเลขอ้างอิง', 'วันที่-เวลา', 'ประเภทเรื่อง', 'หน่วยงาน', 'หัวข้อ', 
    'รายละเอียด', 'สถานที่', 'ลิงก์พิกัด', 'ระดับความสำคัญ', 'เปิดเผยตัวตน', 
    'ชื่อ-นามสกุล', 'ช่องทางติดต่อ', 'ไฟล์แนบ', 'สถานะ', 'การตอบกลับจากพี่สภา', 'โชว์ผลงาน'
  ];

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // อัปเดตหัวตาราง
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#0A2A66').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

// ===== ฟังก์ชันบันทึกไฟล์ลง Google Drive =====
function saveFilesToDrive(fileDataArray, refId) {
  if (!fileDataArray || fileDataArray.length === 0) {
    return 'ไม่มีไฟล์แนบ';
  }

  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const fileLinks = [];

    for (let i = 0; i < fileDataArray.length; i++) {
      const fileObj = fileDataArray[i];
      
      // ดึงข้อมูล base64 ออกมา (ตัด prefix "data:image/jpeg;base64," ออก)
      const base64Data = fileObj.base64.split(',')[1];
      if (!base64Data) continue;

      // แปลง base64 เป็น Blob
      const decoded = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decoded, fileObj.type, refId + '_' + fileObj.name);

      // บันทึกไฟล์ลง Drive
      const file = folder.createFile(blob);
      
      // ตั้งค่าสิทธิ์ให้ทุกคนที่มีลิงก์ดูได้
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // เก็บลิงก์สำหรับดูไฟล์
      fileLinks.push(file.getUrl());
    }

    return fileLinks.length > 0 ? fileLinks.join(', ') : 'ไม่มีไฟล์แนบ';
  } catch (error) {
    Logger.log('Error saving files to Drive: ' + error.toString());
    return 'อัปโหลดไม่สำเร็จ: ' + error.message;
  }
}

function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.type === 'application/json') {
      data = JSON.parse(e.postData.contents);
    } else {
      let contents = e.postData ? e.postData.contents : null;
      data = JSON.parse(contents || e.parameter.data || "{}");
    }

    const sheet = initSheet();
    const thaiDate = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    
    // บันทึกไฟล์แนบลง Google Drive (ถ้ามี)
    const fileLinks = saveFilesToDrive(data.fileData || [], data.id || 'UNKNOWN');

    // บันทึกลง Sheet
    sheet.appendRow([
      data.id, 
      thaiDate, 
      data.topicType || '-', 
      data.department || '-', 
      data.subject || '-',
      data.details || '-', 
      data.location || '-', 
      data.mapLink || '-', 
      data.priority || '-',
      data.identity || '-', 
      data.fullName || 'ไม่เปิดเผย', 
      data.contact || '-',
      fileLinks, 
      'รอดำเนินการ'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const sheet = initSheet();
  
  // 1. Action: Lookup (สำหรับตรวจสอบสถานะรายบุคคล)
  if (action === 'lookup') {
    const refId = (e.parameter.refId || '').toUpperCase();
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().toUpperCase() === refId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true, 
          data: {
            id: rows[i][0],
            date: rows[i][1],
            topicType: rows[i][2],
            department: rows[i][3],
            subject: rows[i][4],
            location: rows[i][6],
            priority: rows[i][8],
            files: rows[i][12],
            status: rows[i][13],
            councilReply: rows[i][14] || ''
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'ไม่พบข้อมูล' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Action: Stats (สำหรับแสดงผล Dashboard สาธารณะ)
  if (action === 'stats') {
    const rows = sheet.getDataRange().getValues();
    const data = rows.slice(1);
    
    const stats = {
      total: data.length,
      done: data.filter(r => r[13] === 'เสร็จสิ้น').length,
      pending: data.filter(r => r[13] === 'รอดำเนินการ').length,
      processing: data.filter(r => r[13] === 'กำลังดำเนินการ').length,
      types: {}
    };
    
    data.forEach(r => {
      const type = r[2] || 'อื่น ๆ';
      stats.types[type] = (stats.types[type] || 0) + 1;
    });
    
    // ดึง 5 รายการล่าสุดที่เสร็จแล้ว (Success Stories)
    stats.recentResolved = data
      .filter(r => (r[15] || '').toString().trim() === 'โชว์')
      .slice(-5)
      .map(r => ({ id: r[0], subject: r[4], date: r[1] }));

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: stats }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
