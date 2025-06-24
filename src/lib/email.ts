import { render } from "@react-email/render"
import { Resend } from "resend"
import {
    EmailVerificationTemplate,
    OTPEmailTemplate,
    PasswordResetTemplate
} from "./email-templates"

type EmailProvider = "resend"

interface EmailConfig {
    provider: EmailProvider
    from: string
    resend?: {
        apiKey: string
    }
}

interface SendEmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

class EmailService {
    private config: EmailConfig
    private resend?: Resend

    constructor() {
        this.config = this.getEmailConfig()
        this.initializeProvider()
    }

    private getEmailConfig(): EmailConfig {
        const provider = (process.env.EMAIL_PROVIDER || "resend") as EmailProvider

        if (provider === "resend" && !process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is required when using Resend provider")
        }

        return {
            provider,
            from: process.env.EMAIL_FROM || "onboarding@openchat.one",
            resend:
                provider === "resend"
                    ? {
                          apiKey: process.env.RESEND_API_KEY!
                      }
                    : undefined
        }
    }

    private initializeProvider() {
        if (this.config.provider === "resend" && this.config.resend) {
            this.resend = new Resend(this.config.resend.apiKey)
        }
    }

    private async sendWithResend(options: SendEmailOptions) {
        if (!this.resend) {
            throw new Error("Resend client not initialized")
        }

        const result = await this.resend.emails.send({
            from: this.config.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        })

        if (result.error) {
            throw new Error(`Resend error: ${result.error.message}`)
        }

        return result
    }

    async sendEmail(options: SendEmailOptions) {
        try {
            if (this.config.provider === "resend") {
                return await this.sendWithResend(options)
            }

            throw new Error(`Unsupported email provider: ${this.config.provider}`)
        } catch (error) {
            console.error("Failed to send email:", error)
            throw error
        }
    }

    async sendVerificationEmail(data: {
        user: { email: string; name?: string }
        url: string
        token: string
    }) {
        const html = await render(
            EmailVerificationTemplate({
                name: data.user.name,
                verificationUrl: data.url
            })
        )

        console.debug(`Sending verification email to ${data.user.email} with URL: ${data.url}`)

        await this.sendEmail({
            to: data.user.email,
            subject: "Verify your email address - OpenChat",
            html,
            text: `Hi ${data.user.name || ""},\n\nPlease verify your email address by clicking this link: ${data.url}\n\nIf you didn't create an account, you can safely ignore this email.`
        })
    }

    async sendPasswordResetEmail(data: {
        user: { email: string; name?: string }
        url: string
        token: string
    }) {
        const html = await render(
            PasswordResetTemplate({
                name: data.user.name,
                resetUrl: data.url
            })
        )

        await this.sendEmail({
            to: data.user.email,
            subject: "Reset your password - OpenChat",
            html,
            text: `Hi ${data.user.name || ""},\n\nYou can reset your password by clicking this link: ${data.url}\n\nIf you didn't request a password reset, you can safely ignore this email.`
        })
    }

    async sendOTPEmail(data: {
        email: string
        otp: string
        type: "sign-in" | "email-verification" | "forget-password"
    }) {
        const getSubjectAndTemplate = async () => {
            switch (data.type) {
                case "sign-in":
                    return {
                        subject: "Your sign-in code - OpenChat",
                        html: await render(
                            OTPEmailTemplate({
                                otp: data.otp,
                                type: "sign-in"
                            })
                        ),
                        text: `Your sign-in code for OpenChat is: ${data.otp}\n\nThis code will expire in 5 minutes.`
                    }
                case "email-verification":
                    return {
                        subject: "Verify your email - OpenChat",
                        html: await render(
                            OTPEmailTemplate({
                                otp: data.otp,
                                type: "email-verification"
                            })
                        ),
                        text: `Your email verification code for OpenChat is: ${data.otp}\n\nThis code will expire in 5 minutes.`
                    }
                case "forget-password":
                    return {
                        subject: "Reset your password - OpenChat",
                        html: await render(
                            OTPEmailTemplate({
                                otp: data.otp,
                                type: "forget-password"
                            })
                        ),
                        text: `Your password reset code for OpenChat is: ${data.otp}\n\nThis code will expire in 5 minutes.`
                    }
            }
        }

        const { subject, html, text } = await getSubjectAndTemplate()

        console.debug(`Sending ${data.type} OTP email to ${data.email} with code: ${data.otp}`)

        await this.sendEmail({
            to: data.email,
            subject,
            html,
            text
        })
    }
}

export const emailService = new EmailService()

export const sendEmail = emailService.sendEmail.bind(emailService)
export const sendVerificationEmail = emailService.sendVerificationEmail.bind(emailService)
export const sendPasswordResetEmail = emailService.sendPasswordResetEmail.bind(emailService)
export const sendOTPEmail = emailService.sendOTPEmail.bind(emailService)
