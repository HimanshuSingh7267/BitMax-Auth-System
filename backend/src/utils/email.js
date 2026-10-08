const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();

    console.log("Email service is ready");
  } catch (error) {
    console.error("Email service connection failed:", error);
  }
};

const sendOTPEmail = async ({ email, otp, purpose = "login" }) => {
  const subject =
    purpose === "registration"
      ? "Verify Your BitMax Account"
      : "Your BitMax Login OTP";

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,

    to: email,

    subject,

    text: `
Hello,

Your OTP is: ${otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Regards,
BitMax Authentication System
    `,

    html: `
      <h2>BitMax Authentication</h2>

      <p>Hello,</p>

      <p>Your OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP is valid for <strong>5 minutes</strong>.</p>

      <p>Please do not share this OTP with anyone.</p>

      <p>
        Regards,<br>
        BitMax Authentication System
      </p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("OTP email sent successfully:", info.messageId);

  return info;
};

module.exports = {
  sendOTPEmail,
  verifyEmailTransporter,
};
