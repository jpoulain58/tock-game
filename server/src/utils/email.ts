import nodemailer from 'nodemailer';
import mjml2html from 'mjml';

// Configuration du transporteur email avec Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
},
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
  tls: {
    rejectUnauthorized: false
  },
});

export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>Vérification de votre email - Tock Game</mj-title>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
          <mj-text font-size="14px" color="#333333" line-height="20px" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section padding="40px 30px" border-radius="8px">
          <mj-column>
            <mj-text font-size="24px" font-weight="bold" color="#1e3a8a" align="center">
              🎮 Bienvenue sur Tock Game !
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section background-color="#ffffff" padding="40px 30px" border-radius="8px">
          <mj-column>
            <mj-text font-size="16px" padding-top="20px">
              Bonjour <strong>${username}</strong>,
            </mj-text>
            <mj-text>
              Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :
            </mj-text>
            <mj-button
              background-color="#3b82f6"
              color="#ffffff"
              border-radius="8px"
              font-size="16px"
              padding="15px 30px"
              href="${verificationUrl}"
            >
              Vérifier mon email
            </mj-button>
            <mj-text font-size="12px" color="#666666" padding-top="20px">
              Ou copiez ce lien dans votre navigateur :<br/>
              <a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="20px">
          <mj-column>
            <mj-text font-size="12px" color="#999999" align="center">
              © 2025 Tock Game. Tous droits réservés.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjmlTemplate);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD non configurés - Email non envoyé');
    console.log(`📧 Email de vérification pour ${email}: ${verificationUrl}`);
    return;
  }

  try {
    const result = await transporter.sendMail({
      from: `"Tock Game" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎮 Vérifiez votre email - Tock Game',
      html,
    });

    console.log(`✅ Email de vérification envoyé à ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de vérification:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, username: string, token: string) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>Réinitialisation de mot de passe - Tock Game</mj-title>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
          <mj-text font-size="14px" color="#333333" line-height="20px" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section background-color="#ffffff" padding="40px 30px" border-radius="8px">
          <mj-column>
            <mj-text font-size="24px" font-weight="bold" color="#dc2626" align="center">
              🔐 Réinitialisation de mot de passe
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section background-color="#ffffff" padding="40px 30px" border-radius="8px">
          <mj-column>
            <mj-text font-size="16px" padding-top="20px">
              Bonjour <strong>${username}</strong>,
            </mj-text>
            <mj-text>
              Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </mj-text>
            <mj-button
              background-color="#dc2626"
              color="#ffffff"
              border-radius="8px"
              font-size="16px"
              padding="15px 30px"
              href="${resetUrl}"
            >
              Réinitialiser mon mot de passe
            </mj-button>
            <mj-text font-size="12px" color="#666666" padding-top="20px">
              Ou copiez ce lien dans votre navigateur :<br/>
              <a href="${resetUrl}" style="color: #dc2626;">${resetUrl}</a>
            </mj-text>
            <mj-text font-size="12px" color="#999999" padding-top="20px">
              Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="20px">
          <mj-column>
            <mj-text font-size="12px" color="#999999" align="center">
              © 2025 Tock Game. Tous droits réservés.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjmlTemplate);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD non configurés - Email non envoyé');
    console.log(`📧 Email de réinitialisation pour ${email}: ${resetUrl}`);
    return;
  }

  try {
    const result = await transporter.sendMail({
      from: `"Tock Game" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Réinitialisation de mot de passe - Tock Game',
      html,
    });

    console.log(`✅ Email de réinitialisation envoyé à ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de réinitialisation:", error);
    throw error;
  }
}
