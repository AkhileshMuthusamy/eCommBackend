const nodemailer = require('nodemailer');
const htmlEmail = require('./htmlRenderer');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NOTIFY_EMAIL,
    pass: process.env.NOTIFY_EMAIL_PASSWORD
  }
});

function sendHtmlEmail(toAddress, subject, bodyTemplate, bodyTemplateData) {
  return new Promise(function(resolve, reject) {
    htmlEmail
      .render(bodyTemplate, bodyTemplateData)
      .then(html => {
        transporter.sendMail(
          {
            from: process.env.NOTIFY_EMAIL, // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            html: html // html body
          },
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

function sendHtmlEmailWithEmbedImage(toAddress, subject, bodyTemplate, bodyTemplateData) {
  return new Promise(function(resolve, reject) {
    htmlEmail
      .render(bodyTemplate, bodyTemplateData)
      .then(html => {
        transporter.sendMail(
          {
            from: process.env.NOTIFY_EMAIL, // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
            attachments: [
              {
                filename: 'Picture1.png',
                // data uri as an attachment
                path: './email/templates/Picture1.png',
                cid: 'unique@kreata.ee'
              }
            ]
          },
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

function sendEmailwithAttachment(toAddress, subject, body, attachmentBase64) {
  return new Promise(function(resolve, reject) {
    const start = attachmentBase64.indexOf('=');
    const end = attachmentBase64.indexOf(';', start);

    transporter.sendMail(
      {
        from: process.env.NOTIFY_EMAIL, // sender address
        to: toAddress, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
        attachments: [
          {
            // utf-8 string as an attachment
            filename: 'text1.txt',
            content: 'hello world!'
          },
          {
            filename: `${attachmentBase64.substring(start + 1, end)}`,
            // data uri as an attachment
            path: attachmentBase64
          }
        ]
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
}

function sendEmailwithAttachments(toAddress, subject, body, attachments) {
  return new Promise(function(resolve, reject) {
    let emailAttachments = [];
    attachments.forEach(file => {
      emailAttachments.push({ filename: file.originalname, content: file.buffer });
    });

    console.dir(emailAttachments);
    transporter.sendMail(
      {
        from: process.env.NOTIFY_EMAIL, // sender address
        to: toAddress, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
        attachments: emailAttachments
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
}

module.exports = {
  sendHtmlEmail,
  sendEmailwithAttachment,
  sendEmailwithAttachments,
  sendHtmlEmailWithEmbedImage
};
