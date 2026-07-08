const { twilioClient } = require("../config/twilio");
const { get, set, del, exists, increment, setWithExpiry, expire } = require("../utils/redis");
const APIError = require("../utils/APIError");
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const OTP_REQUEST_LIMIT = 3;
const OTP_REQUEST_WINDOW = 600; // 10min
const OTP_RESEND_COOLDOWN = 60;
const OTP_VERIFY_LIMIT = 5;
const OTP_VERIFY_WINDOW = 600;  // 10mins

exports.sendOTP = async (phone) => {

  const requestKey = `otp:request:${phone}`;
  const cooldownKey = `otp:cooldown:${phone}`;
  if (await exists(cooldownKey)) {
    throw new APIError(429, "please wait for 1 min before requesting another OTP");
  }
  const requestCount = Number(await increment(requestKey));
  if (requestCount === 1) {
    await expire(requestKey, OTP_REQUEST_WINDOW);
  }
  if (requestCount > OTP_REQUEST_LIMIT) {
    throw new APIError(429, "request exceed the limit try after 1 min");
  }
  const response = await twilioClient.verify.v2.services(VERIFY_SERVICE_SID).verifications.create({ to: phone, channel: "sms" });
  console.log(response);
  await setWithExpiry(cooldownKey, "1", OTP_RESEND_COOLDOWN);

  return { success: true, message: "otp sent successfully" }
}

exports.verifyOTP = async (phone, otp) => {
  const verifyKey = `otp:verify:${phone}`
  const verification = await twilioClient.verify.v2.services(VERIFY_SERVICE_SID).verificationChecks.create({ to: phone, code: otp });
  if (verification.status !== "approved") {
    const attempts = await increment(verifyKey);
    if (attempts === 1) {
      await expire(verifyKey, OTP_VERIFY_WINDOW);
    }
    if (attempts > OTP_VERIFY_LIMIT) {
      throw new ApiError(429, "exceeded the otp limits try agin ");
    }
    throw new APIError(401, "Invalid OTP");
  }
  await del(verifyKey);
  return { success: true, message: "verification successful" }

}
