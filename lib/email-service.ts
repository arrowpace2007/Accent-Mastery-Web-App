"use client"

// Email service using EmailJS for verification emails
export async function sendVerificationEmail(email: string, fullName: string) {
  // This would integrate with EmailJS or similar service
  // For demo purposes, we'll simulate the email sending

  const emailData = {
    to_email: email,
    to_name: fullName,
    subject: "Verify your Accent Mastery account",
    verification_link: `${window.location.origin}/auth/verify?token=${crypto.randomUUID()}`,
  }

  try {
    // In a real implementation, you would use EmailJS:
    // await emailjs.send('service_id', 'template_id', emailData, 'public_key')

    console.log("Verification email sent to:", email)
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendWelcomeEmail(email: string, fullName: string) {
  const emailData = {
    to_email: email,
    to_name: fullName,
    subject: "Welcome to Accent Mastery!",
  }

  try {
    console.log("Welcome email sent to:", email)
    return { success: true }
  } catch (error) {
    console.error("Welcome email sending failed:", error)
    throw new Error("Failed to send welcome email")
  }
}
