// ===== Google Apps Script (Version: SUPER-STABLE / No-Drive) =====
// เน้นความเสถียรในการบันทึกข้อมูลเข้า Sheet โดยตัดระบบ Drive ออกชั่วคราวเพื่อหาจุดผิดพลาด

function initSheet() {
  const SHEET_NAME = 'ข้อมูลร้องเรียน'; 
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  const headers = [
    'หมายเลขอ้างอิง', 'วันที่-เวลา', 'ประเภทเรื่อง', 'หน่วยงาน', 'หัวข้อ', 
    'รายละเอียด', 'สถานที่', 'ลิงก์พิกัด', 'ระดับความสำคัญ', 'เปิดเผยตัวตน', 
    'ชื่อ-นามสกุล', 'ช่องทางติดต่อ', 'ไฟล์แนบ', 'สถานะ'
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
    
    // บันทึกลง Sheet (ข้ามเรื่องรูปภาพไปก่อนเพื่อความเสถียร)
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
      'ไม่มีไฟล์ (ปิดชั่วคราว)', 
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
          data: { status: rows[i][13], subject: rows[i][4], date: rows[i][1] }
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
      .filter(r => r[13] === 'เสร็จสิ้น')
      .slice(-5)
      .map(r => ({ id: r[0], subject: r[4], date: r[1] }));

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: stats }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
