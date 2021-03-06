var gmailApiSync = require('gmail-api-sync');
var google = require('googleapis');

exports.setClientSecretsFile = function (path) {
    gmailApiSync.setClientSecretsFile(path);
};
exports.resetCredentials = function (callback) {
    gmailApiSync.resetCredentials(callback);
};
exports.send = function (token, params, callback) {

    gmailApiSync.authorizeWithToken(token, function (err, oauth) {
        if (err) {
            return callback('Auth error: ' + err, null);
        }
        var gmail = google.gmail('v1');
        var headers = [];

        headers.push('From: =?utf-8?b?' + new Buffer(params.fromName).toString('base64') + '?= <' + params.fromEmail + '>');
        headers.push('To: ' + params.to);
        headers.push('Content-Type: text/html;charset=UTF-8');
        headers.push('MIME-Version: 1.0');
        headers.push('Subject: =?utf-8?b?' + new Buffer(params.subject).toString('base64') + '?=');
        headers.push('');
        headers.push(params.body);

        var email = headers.join('\r\n').trim();

        var base64EncodedEmail = new Buffer(email).toString('base64');
        base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

        var reqParams = {
            auth: oauth,
            userId: 'me',
            resource: {
                raw: base64EncodedEmail
            }
        };

        gmail.users.messages.send(reqParams, null, function (err, resp) {
            if (!err) {
                return callback(null, resp);
            }
            else {
                return callback('Unable to send email: ' + err, null);
            }
        });
    });
};
