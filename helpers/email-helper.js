'use strict';
const nodemailer = require("nodemailer");
class Mailer {

    constructor() {
    }
    
async send(to, from, subject, message_or_html,bcc) {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTPHOST,
            port: process.env.SMTPPORT,
            logger: false,
            debug: false,
            secure: true,
            auth: {
              user: process.env.SMTPUSERNAME,
              pass: process.env.SMTPPASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
          });
          let mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: message_or_html,
            html: message_or_html,
            // Custom headers for configuration set and message tags.
            headers: {
            //  'X-SES-CONFIGURATION-SET': configurationSet
              
            }
          };
          // Send the email.
          let info = await transporter.sendMail(mailOptions)
          return info;
    }
    
    async sendForgetPassword(to, subject, message_or_html) {
        let from = process.env.FROM;
       return await this.send(to, from, subject, message_or_html,'');
    }
    async sendWelcome(to, subject, message_or_html, env = 'care') {
        let receiver = ` <${to}>`;
        let from = `Puglist <no-reply@puglist.com>`;
        return await this.send(receiver, from, subject, message_or_html, env);
    }

    async sendForgotPasswordLink(user, reset_link, env = 'care') {
        let receiver = `MySureFit <${user.email}>`;
        let from = `MySureFit <care@mysurefit.com>`;
     
        let emailTemplate = await this.templatesModel.GetEmailTemplate('password_reset_web.html.twig');
        let data = {
            reset_link: reset_link,
            email: user.email,
            entity: {
                firstName: (user.first_name == null ? " " : user.first_name),
            },
            link: `${process.env.V3_BASE_URL}`
        };

        let mailOptions = {
            from: from,
            to: user.email,
            subject: subject,
            html: emailHtml
        };
        // let from = `SureFit Contact <no_reply@selfiestyler.com>`;
       return await this.send(mailOptions.to, mailOptions.from, mailOptions.subject, mailOptions.html, 'care', '');
        //return await this.sendHTML(receiver, from, subject,emailHtml, env, bcc);
    }

   
    async sendPasswordResetStatus(to, subject = '', message_or_html = '', env = 'care') {
        //let receiver = `SureFit <${to}>`;
        let receiver = to;
        let from = `MySureFit <care@mysurefit.com>`;
        // let from = `SureFit Contact <no_reply@selfiestyler.com>`;
        subject = 'Password Reset Success';
        message_or_html = 'The password was reset successfully.';
        return await this.send(receiver, from, subject, message_or_html, env);
    }

}

module.exports = Mailer;
