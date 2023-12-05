import twilio from "twilio"

const accountSid = "ACacb326aec0680e94b60ee4e3b40fdc42";
const authToken = "c5473f7cd3a2b9c1cbed2392ff670a1d";
const client = require('twilio')(accountSid, authToken);

export const GenerateAccessCode = () => {
    const code = Math.floor(10000 * Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime(new Date().getTime() * 30 * 60 * 1000)
    return { code, expiry }
}

export const SendVerificationCode = async (code: number, toPhoneNumber: string) => {
    // +13853991862
    const response = await client.messages.create({
        body: `Your verification code is ${code} it will expire within 30 minutes.`,
        from: "+13853991862",
        to: toPhoneNumber.trim(),
    });
    return response;
}
