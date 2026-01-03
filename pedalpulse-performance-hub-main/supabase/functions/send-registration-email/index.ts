import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const SMTP_HOST = Deno.env.get('SMTP_HOST')! // smtp.hostinger.com
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
const SMTP_USER = Deno.env.get('SMTP_USER')! // no-reply@pedalpulse.in
const SMTP_PASS = Deno.env.get('SMTP_PASS')!

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    to: string
    name: string
    challengeName: string
    registrationType: 'free' | 'premium'
    category: string
    // For premium
    paymentId?: string
    orderId?: string
    address?: {
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        pincode: string
    }
    phone?: string
    phoneCountryCode?: string
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('=== Send Registration Email Function Called ===')

        const emailData: EmailRequest = await req.json()
        console.log('Email request for:', emailData.to, 'Type:', emailData.registrationType)

        const htmlContent = generateEmailHTML(emailData)
        const subject = `Registration Confirmed - ${emailData.challengeName}`

        // Create SMTP client
        const client = new SMTPClient({
            connection: {
                hostname: SMTP_HOST,
                port: SMTP_PORT,
                tls: true,
                auth: {
                    username: SMTP_USER,
                    password: SMTP_PASS,
                },
            },
        })

        // Send email
        await client.send({
            from: `PedalPulse <${SMTP_USER}>`,
            to: emailData.to,
            subject: subject,
            content: 'Please use an HTML-capable email client to view this message.',
            html: htmlContent,
        })

        await client.close()

        console.log('Email sent successfully to:', emailData.to)

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('=== Email Send Error ===')
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)

        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})

function generateEmailHTML(data: EmailRequest): string {
    const isPremium = data.registrationType === 'premium'
    const fullPhone = data.phoneCountryCode + data.phone

    const addressHTML = data.address ? `
    <tr>
      <td style="padding: 20px 0; border-top: 1px solid #e5e7eb;">
        <h2 style="color: #F97316; font-size: 20px; margin: 0 0 15px 0;">📦 Shipping Address</h2>
        <p style="margin: 5px 0; color: #374151;">${data.address.addressLine1}</p>
        <p style="margin: 5px 0; color: #374151;">${data.address.addressLine2}</p>
        <p style="margin: 5px 0; color: #374151;">${data.address.city}, ${data.address.state} - ${data.address.pincode}</p>
        <p style="margin: 5px 0; color: #374151;"><strong>Phone:</strong> ${fullPhone}</p>
        
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 20px; border-radius: 4px;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>⚠️ Important:</strong> If the shipping address is incorrect, please contact us on WhatsApp at 
            <a href="https://wa.me/919238737970" style="color: #F97316; text-decoration: none;"><strong>+91 92387 37970</strong></a> 
            before <strong>25th January</strong>. We cannot make changes after that date, and reshipping charges will apply for returns due to incorrect addresses.
          </p>
        </div>
      </td>
    </tr>
  ` : ''

    const paymentInfoHTML = isPremium && data.paymentId && data.orderId ? `
    <tr>
      <td style="padding: 20px 0;">
        <h2 style="color: #F97316; font-size: 20px; margin: 0 0 15px 0;">💳 Payment Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; background-color: #F9FAFB; border: 1px solid #E5E7EB;"><strong>Payment ID:</strong></td>
            <td style="padding: 8px; background-color: #F9FAFB; border: 1px solid #E5E7EB;">${data.paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background-color: #FFFFFF; border: 1px solid #E5E7EB;"><strong>Order ID:</strong></td>
            <td style="padding: 8px; background-color: #FFFFFF; border: 1px solid #E5E7EB;">${data.orderId}</td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - ${data.challengeName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">🎉 Registration Confirmed!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Greeting -->
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">Hi <strong>${data.name}</strong>,</p>
              
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                Thank you for registering for the <strong>${data.challengeName}</strong>! 🏃‍♂️
              </p>

              <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065F46; font-size: 16px;">
                  ✅ Your registration is <strong>confirmed</strong> for the <strong>${data.category}</strong> category!
                </p>
              </div>

              ${paymentInfoHTML}

              <!-- Challenge Instructions -->
              <tr>
                <td style="padding: 20px 0; border-top: 1px solid #e5e7eb;">
                  <h2 style="color: #F97316; font-size: 20px; margin: 0 0 15px 0;">📅 Event Details</h2>
                  <p style="margin: 10px 0; color: #374151;">
                    You can complete the <strong>${data.category}</strong> on <strong>any ONE day</strong> between 
                    <strong>26th January</strong> to <strong>1st February 2026</strong>.
                  </p>
                </td>
              </tr>

              <!-- Activity Tracking -->
              <tr>
                <td style="padding: 20px 0; border-top: 1px solid #e5e7eb;">
                  <h2 style="color: #F97316; font-size: 20px; margin: 0 0 15px 0;">📱 Track Your Activity</h2>
                  <p style="margin: 10px 0; color: #374151;">
                    You can use <strong>any app</strong> to record your distance. We recommend using <strong>Strava</strong>, 
                    but any fitness app that displays:
                  </p>
                  <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
                    <li>Date & Time</li>
                    <li>Distance covered</li>
                    <li>Speed or Pace</li>
                    <li>Duration</li>
                  </ul>
                  <p style="margin: 10px 0; color: #374151;">
                    We will share the <strong>submission process</strong> via email on <strong>25th January 2026</strong>.
                  </p>
                </td>
              </tr>

              ${addressHTML}

              <!-- Support Section -->
              <tr>
                <td style="padding: 30px 0 0 0; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">
                    Questions? Reach out to us:
                  </p>
                  <p style="margin: 5px 0; color: #374151; font-size: 14px;">
                    📧 Email: <a href="mailto:support@pedalpulse.in" style="color: #F97316; text-decoration: none;">support@pedalpulse.in</a>
                  </p>
                  <p style="margin: 5px 0; color: #374151; font-size: 14px;">
                    📱 WhatsApp: <a href="https://wa.me/919238737970" style="color: #F97316; text-decoration: none;">+91 92387 37970</a>
                  </p>
                </td>
              </tr>

              <!-- Closing -->
              <tr>
                <td style="padding: 30px 0 0 0;">
                  <p style="margin: 0; color: #374151; font-size: 16px;">
                    Happy running! 🏃‍♀️💪
                  </p>
                  <p style="margin: 10px 0 0 0; color: #374151; font-size: 16px;">
                    <strong>Team PedalPulse</strong>
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                © 2026 PedalPulse | Virtual Running & Cycling Challenges India
              </p>
              <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">
                <a href="https://www.pedalpulse.in" style="color: #F97316; text-decoration: none;">www.pedalpulse.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
