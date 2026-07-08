const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

exports.twilioClient = twilioClient;