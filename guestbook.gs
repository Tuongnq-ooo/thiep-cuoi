// Dán toàn bộ file này vào Apps Script (mở từ Google Sheet: Tiện ích mở rộng → Apps Script).
// Sau đó Triển khai → Triển khai mới → Ứng dụng web (Thực thi: Tôi, Quyền truy cập: Bất kỳ ai).

const SPREADSHEET_ID = '1uprnPShMouksLthIlgde-ls6QNgPUVCpWt4rzll4zuM';

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('LoiChuc');
  if (!sheet) {
    sheet = ss.insertSheet('LoiChuc');
    sheet.appendRow(['Thời gian', 'Tên', 'Lời chúc']);
  }
  return sheet;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const rows = getSheet().getDataRange().getValues().slice(1).reverse().slice(0, 200);
  return json(rows.map(r => ({ time: new Date(r[0]).getTime(), name: String(r[1]), msg: String(r[2]) })));
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const name = String(data.name || '').trim().slice(0, 50);
  const msg = String(data.msg || '').trim().slice(0, 500);
  if (!name || !msg) return json({ ok: false });
  // Chặn chữ bắt đầu bằng = + - @ bị Sheets hiểu thành công thức
  const safe = s => /^[=+\-@]/.test(s) ? "'" + s : s;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  getSheet().appendRow([new Date(), safe(name), safe(msg)]);
  lock.releaseLock();
  return json({ ok: true });
}
