const config = require("../config");
const mailer = require("@sendgrid/mail");
mailer.setApiKey(config.SENDGRID_API_KEY);

module.exports = {
  sendTemplate: (template, to, data) => {
    console.log({
      to,
      from: config.MAIL_SENDER,
      data,
      template: config.TEMPLATES[template]
    });
    return mailer.send({
      to,
      from: config.MAIL_SENDER,
      dynamic_template_data: data,
      templateId: config.TEMPLATES[template]
    });
  }
};
