import nodemailer from 'nodemailer';
import htmlToText from 'html-to-text';
import pug from 'pug';
import nodemailerSendgrid from 'nodemailer-sendgrid';

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ryan Kirby <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV.includes('production')) {
      return nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.EMAIL_PASSWORD_PROD,
        })
      );
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`./views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordResetEmail',
      'Forgot your password? reset it here (valid for only 10 minutes)'
    );
  }
}

export default Email;
