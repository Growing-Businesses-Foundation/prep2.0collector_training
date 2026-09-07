import { google } from "googleapis";
import { Readable } from "stream";

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
    throw new Error(
        "Google service account credentials are not configured."
    );
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
    },
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

        supportsAllDrives: true,
    });

    return response.data;
}
