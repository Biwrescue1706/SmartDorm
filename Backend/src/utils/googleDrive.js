import { google } from "googleapis";
import stream from "stream";

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json", // path ไปไฟล์ service account
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// อัปโหลดไฟล์เข้า Google Drive
export const uploadToDrive = async (buffer, filename, mimeType, parentId) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: bufferStream,
    },
  });

  const fileId = response.data.id;

  // เปิดให้ดูได้สาธารณะ
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
};

// ลบไฟล์จาก Google Drive ด้วย URL
export const deleteFromDriveByUrl = async (url) => {
  try {
    if (!url) return;
    const match = url.match(/\/d\/([^/]+)/);
    if (!match) return;

    const fileId = match[1];
    await drive.files.delete({ fileId });
  } catch (err) {
    console.warn("ลบไฟล์ใน Google Drive ไม่สำเร็จ:", err.message);
  }
};
