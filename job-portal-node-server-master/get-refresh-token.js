const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    '242686908422-ae8un7tr2u17ttvddqr95c719per6d5j.apps.googleusercontent.com', // Client ID
    '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', // Client Secret
    'http://localhost' // Redirect URI
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures you get a refresh token
    scope: scopes,
});

console.log('Authorize this app by visiting this URL:', url);
