const nodemailer = require('nodemailer');
const pug = require('pug');

// const { google } = require('googleapis');

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRETE,
//   'https://developers.google.com/oauthplayground'
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  // create transport
  createTransport() {
    //   const transpoerterOpt = {
    //     service: 'gmail',
    //     auth: {
    //       type: 'OAuth2',
    //       user: process.env.GOOGLE_MAIL_USERNAME,
    //       pass: process.env.GOOGLE_MAIL_PASSWORD,
    //       clientId: process.env.GOOGLE_CLIENT_ID,
    //       clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
    //       refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    //       // accessLoken: process.env.GOOGLE_ACCESS_TOKEN,
    //     },
    //   };

    //   return nodemailer.createTransport(transpoerterOpt);
    // }

    const transpoerterOpt = {
      service: '"SendGrid"',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_KEY,
      },
    };

    return nodemailer.createTransport(transpoerterOpt);
  }

  // --------- send
  async send(template, subject, content, btnMessage) {
    const locals = {
      subject,
      btnMessage,
      firstName: this.firstName,
      url: this.url,
    };

    if (template === 'all') locals.content = content;

    // create html from pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, locals);

    const res = await this.createTransport().sendMail({
      from: this.from,
      to: this.to,
      subject,
      text: this.url,
      html,
    });
  }

  // ------------------------ send welcome
  async sendWelcome() {
    await this.send('welcome', `Welcome ${this.firstName}`);
  }

  async sendResetPasswordLInk() {
    await this.send(
      'reset',
      `Your Password Reset Link(Valid for ${process.env.RESET_EXPIRY} minutes).`
    );
  }

  // ------------------------ eamil verification
  async sendEmailVerification() {
    await this.send(
      'verify',
      `Your Email verification LInk(Valid for ${process.env.EMAIL_VERIFICATION} minutes).`
    );
  }

  // --------------------- mass mailer
  async sendAllEmail(subject, content, btnMessage) {
    await this.send('all', subject, content, btnMessage);
  }
}

module.exports = Email;
