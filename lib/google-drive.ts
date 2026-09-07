import { google } from "googleapis";
import path from "path";
import { Readable } from "stream";

const keyFile = path.join(
    process.cwd(),
    "google-drive-service-account.json"
);

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/drive"],
});

export const drive = google.drive({
    version: "v3",
    auth,
});

interface UploadPhotoParams {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
}

export async function uploadTrainingPhoto({
    buffer,
    fileName,
    mimeType,
}: UploadPhotoParams) {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured.");
    }

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [folderId],
        },

        media: {
            mimeType,
            body: Readable.from(buffer),
        },

        fields: "id,name,mimeType,webViewLink",

        // Important for Shared Drives
        supportsAllDrives: true,
    });

    return response.data;
}