import Resend from "@auth/core/providers/resend";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";
import { AUTH_RESEND_KEY } from "./env.ts";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Prism <onboarding@resend.dev>",
      to: [email],
      subject: "Your login code for Prism",
      text: `Use the following verification code to sign in: ${token}

  If you did not request this code, please ignore this email.`,
    });

    if (error) {
      throw new Error("Could not send");
    }
  },
});
