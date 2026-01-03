import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  name: string
  email: string
  challengeName: string
  registrationType: 'free' | 'premium'
  category: string
  paymentId?: string
  orderId?: string
  amount?: number
  registrationTime?: string
  totalRegistrations?: number
  address?: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
  }
  phone?: string
  phoneCountryCode?: string
  sendAdminNotification?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Send Email via SMTP ===')
    const emailData: EmailRequest = await req.json()
    console.log('Recipient:', emailData.to)

    // Send customer confirmation email
    await sendEmail(emailData, false)

    // Send admin notification for premium registrations
    if (emailData.sendAdminNotification && emailData.registrationType === 'premium') {
      console.log('Sending admin notification...')
      await sendEmail(emailData, true)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Email error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function sendEmail(data: EmailRequest, isAdminNotification: boolean) {
  const htmlContent = isAdminNotification ? generateAdminEmailHTML(data) : generateEmailHTML(data)
  const subject = isAdminNotification
    ? `New Premium Registration - ${data.name}`
    : `Registration Confirmed - ${data.challengeName}`
  const recipient = isAdminNotification ? 'pedalpulse.in@gmail.com' : data.to

  // Connect to SMTP server using TLS
  const conn = await Deno.connectTls({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
  })

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  async function write(data: string) {
    await conn.write(encoder.encode(data + '\r\n'))
  }

  async function read(): Promise<string> {
    const buffer = new Uint8Array(1024)
    const n = await conn.read(buffer)
    return decoder.decode(buffer.subarray(0, n || 0))
  }

  try {
    // Read server greeting
    await read()

    // EHLO
    await write(`EHLO ${SMTP_HOST}`)
    await read()

    // AUTH LOGIN
    await write('AUTH LOGIN')
    await read()

    // Send username (base64)
    await write(btoa(SMTP_USER))
    await read()

    // Send password (base64)
    await write(btoa(SMTP_PASS))
    await read()

    // MAIL FROM
    await write(`MAIL FROM:<${SMTP_USER}>`)
    await read()

    // RCPT TO
    await write(`RCPT TO:<${recipient}>`)
    await read()

    // DATA
    await write('DATA')
    await read()

    // Email headers and body
    const boundary = '----=_Part_' + Date.now()
    const emailMessage = [
      `From: PedalPulse <${SMTP_USER}>`,
      `To: ${recipient}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      '',
      htmlContent,
      '',
      `--${boundary}--`,
      '.',
    ].join('\r\n')

    await write(emailMessage)
    await read()

    // QUIT
    await write('QUIT')
    await read()

    console.log('Email sent successfully to:', recipient)
  } finally {
    conn.close()
  }
}

function generateEmailHTML(data: EmailRequest): string {
  const isPremium = data.registrationType === 'premium'
  const fullPhone = data.phoneCountryCode && data.phone ? `${data.phoneCountryCode}${data.phone}` : ''

  const paymentSection = isPremium && data.paymentId ? `
<div style="margin:20px 0;padding:20px;background:#f9fafb;border-radius:8px">
  <h2 style="color:#F97316;font-size:18px;margin:0 0 15px">💳 Payment Details</h2>
  <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:4px;background:#fff">
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:12px"><strong>Payment ID:</strong></td>
      <td style="padding:12px">${data.paymentId}</td>
    </tr>
    <tr>
      <td style="padding:12px"><strong>Order ID:</strong></td>
      <td style="padding:12px">${data.orderId}</td>
    </tr>
  </table>
</div>` : ''

  const addressSection = isPremium && data.address ? `
<div style="margin:20px 0;padding:20px;background:#f9fafb;border-radius:8px">
  <h2 style="color:#F97316;font-size:18px;margin:0 0 15px">📦 Shipping Address</h2>
  <p style="margin:5px 0;color:#374151">${data.address.addressLine1}</p>
  <p style="margin:5px 0;color:#374151">${data.address.addressLine2}</p>
  <p style="margin:5px 0;color:#374151">${data.address.city}, ${data.address.state} - ${data.address.pincode}</p>
  <p style="margin:5px 0;color:#374151"><strong>Phone:</strong> ${fullPhone}</p>
  <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:15px;margin-top:15px;border-radius:4px">
    <p style="margin:0;color:#92400E;font-size:14px">
      <strong>⚠️ Important:</strong> If the shipping address is incorrect, please contact us on WhatsApp at 
      <a href="https://wa.me/919238737970" style="color:#F97316;text-decoration:none"><strong>+91 92387 37970</strong></a> 
      before <strong>25th January</strong>. We cannot make changes after that date.
    </p>
  </div>
</div>` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <tr>
            <td style="background:linear-gradient(135deg,#F97316,#EA580C);padding:40px 30px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:#fff;margin:0;font-size:28px">🎉 Registration Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px">
              <p style="margin:0 0 15px;color:#374151;font-size:16px">Hi <strong>${data.name}</strong>,</p>
              <p style="margin:0 0 20px;color:#374151;font-size:16px">
                Thank you for registering for the <strong>${data.challengeName}</strong>! 🏃‍♂️
              </p>
              <div style="background:#ECFDF5;border-left:4px solid #10B981;padding:15px;margin:20px 0;border-radius:4px">
                <p style="margin:0;color:#065F46;font-size:16px">
                  ✅ Your registration is <strong>confirmed</strong> for the <strong>${data.category}</strong> category!
                </p>
              </div>
              ${paymentSection}
              <div style="margin:20px 0">
                <h2 style="color:#F97316;font-size:18px;margin:0 0 10px">📅 Event Details</h2>
                <p style="margin:0;color:#374151">
                  You can complete the <strong>${data.category}</strong> on <strong>any ONE day</strong> between 
                  <strong>26th January</strong> to <strong>1st February 2026</strong>.
                </p>
              </div>
              <div style="margin:20px 0">
                <h2 style="color:#F97316;font-size:18px;margin:0 0 10px">📱 Track Your Activity</h2>
                <p style="margin:0 0 10px;color:#374151">
                  Use <strong>any app</strong> to record your distance. We recommend <strong>Strava</strong>, but any fitness app that displays:
                </p>
                <ul style="margin:0 0 10px;padding-left:20px;color:#374151">
                  <li>Date and Time</li>
                  <li>Distance covered</li>
                  <li>Speed or Pace</li>
                  <li>Duration</li>
                </ul>
                <p style="margin:0;color:#374151">
                  We will share the <strong>submission process</strong> via email on <strong>25th January 2026</strong>.
                </p>
              </div>
              ${addressSection}
              <div style="margin:30px 0 20px;padding-top:20px;border-top:1px solid #e5e7eb">
                <p style="margin:0 0 10px;color:#374151;font-size:14px">Questions? Reach out to us:</p>
                <p style="margin:5px 0;color:#374151;font-size:14px">📧 Email: <a href="mailto:info@pedalpulse.in" style="color:#F97316;text-decoration:none">info@pedalpulse.in</a></p>
                <p style="margin:5px 0;color:#374151;font-size:14px">📱 WhatsApp: <a href="https://wa.me/919238737970" style="color:#F97316;text-decoration:none">+91 92387 37970</a></p>
              </div>
              <div style="margin:20px 0 0">
                <p style="margin:0 0 10px;color:#374151;font-size:16px">Happy running! 🏃‍♀️💪</p>
                <p style="margin:0;color:#374151;font-size:16px"><strong>Team PedalPulse</strong></p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;border-radius:0 0 8px 8px">
              <p style="margin:0 0 5px;color:#6B7280;font-size:12px">© 2026 PedalPulse | Virtual Running and Cycling Challenges India</p>
              <p style="margin:0;color:#6B7280;font-size:12px">
                <a href="https://www.pedalpulse.in" style="color:#F97316;text-decoration:none">www.pedalpulse.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function generateAdminEmailHTML(data: EmailRequest): string {
  const fullPhone = data.phoneCountryCode && data.phone ? `${data.phoneCountryCode}${data.phone}` : ''
  const registrationTime = data.registrationTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  const totalCount = data.totalRegistrations || 'N/A'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>New Registration</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <tr>
            <td style="background:linear-gradient(135deg,#10B981,#059669);padding:40px 30px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:#fff;margin:0;font-size:28px">✅ New Premium Registration</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px">
              <h2 style="color:#10B981;font-size:20px;margin:0 0 20px">Registration Details</h2>
              <table width="100%" cellpadding="12" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px">
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Name:</strong></td>
                  <td style="padding:12px">${data.name}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Email:</strong></td>
                  <td style="padding:12px">${data.email}</td>
                </tr>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Phone:</strong></td>
                  <td style="padding:12px">${fullPhone}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Category:</strong></td>
                  <td style="padding:12px">${data.category}</td>
                </tr>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Amount Paid:</strong></td>
                  <td style="padding:12px">₹${data.amount || 'N/A'}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Payment ID:</strong></td>
                  <td style="padding:12px">${data.paymentId}</td>
                </tr>
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Order ID:</strong></td>
                  <td style="padding:12px">${data.orderId}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:12px"><strong>Registration Time:</strong></td>
                  <td style="padding:12px">${registrationTime}</td>
                </tr>
                <tr style="background:#f9fafb">
                  <td style="padding:12px"><strong>Total Registrations:</strong></td>
                  <td style="padding:12px"><strong style="color:#10B981;font-size:18px">${totalCount}</strong></td>
                </tr>
              </table>
              ${data.address ? `
              <div style="margin:20px 0">
                <h3 style="color:#F97316;font-size:18px;margin:0 0 10px">📦 Shipping Address</h3>
                <p style="margin:5px 0;color:#374151">${data.address.addressLine1}</p>
                <p style="margin:5px 0;color:#374151">${data.address.addressLine2}</p>
                <p style="margin:5px 0;color:#374151">${data.address.city}, ${data.address.state} - ${data.address.pincode}</p>
              </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;border-radius:0 0 8px 8px">
              <p style="margin:0;color:#6B7280;font-size:12px">PedalPulse Admin Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
