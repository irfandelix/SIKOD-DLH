import { google } from 'googleapis';

export const getAuthClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
};

export const getDriveService = () => {
  const oauth2Client = getAuthClient();
  return google.drive({ version: 'v3', auth: oauth2Client });
};
