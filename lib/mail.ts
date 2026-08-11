import nodemailer from "nodemailer";

export async function enviarCorreo(asunto: string, cuerpoHtml: string, destinatario?: string): Promise<boolean> {
  const host = process.env.SMTP_HOST || "smtp.titan.email";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || "admin@alddea.com";
  const pass = process.env.SMTP_PASS || "g8LccgL6hy(N43Aw";
  const from = process.env.SMTP_FROM || "admin@alddea.com";
  const to = destinatario || process.env.SMTP_TO || "admin@alddea.com";

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Port 465 is implicit SSL
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents certificate trust errors on cPanel/custom mail hosts
      },
    });

    const info = await transporter.sendMail({
      from: `Zirian <${from}>`,
      to,
      subject: asunto,
      html: cuerpoHtml,
    });

    console.log("Email sent successfully: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Nodemailer transmission failed: ", error);
    return false;
  }
}
