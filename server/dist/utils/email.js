"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const mjml_1 = __importDefault(require("mjml"));
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = 'jpoulain58@gmail.com';
const FROM_NAME = 'Tock Game';
async function sendVerificationEmail(email, username, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const mjml = `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text font-size="20px" font-weight="bold">Vérification de votre compte</mj-text>
            <mj-text>Bonjour ${username},</mj-text>
            <mj-text>Merci de vous être inscrit ! Cliquez sur le bouton ci-dessous pour vérifier votre compte :</mj-text>
            <mj-button href="${verificationUrl}">Vérifier mon compte</mj-button>
            <mj-text font-size="12px" color="#666">Ce lien expire dans 24 heures.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
    const { html } = (0, mjml_1.default)(mjml);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email, name: username }],
            subject: 'Vérifiez votre compte Tock Game',
            htmlContent: html,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Brevo: ${error}`);
    }
    return response.json();
}
async function sendPasswordResetEmail(email, username, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const mjml = `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text font-size="20px" font-weight="bold">Réinitialisation de mot de passe</mj-text>
            <mj-text>Bonjour ${username},</mj-text>
            <mj-text>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</mj-text>
            <mj-button href="${resetUrl}">Réinitialiser mon mot de passe</mj-button>
            <mj-text font-size="12px" color="#666">Ce lien expire dans 1 heure.</mj-text>
            <mj-text font-size="12px" color="#666">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
    const { html } = (0, mjml_1.default)(mjml);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email, name: username }],
            subject: 'Réinitialisez votre mot de passe Tock Game',
            htmlContent: html,
        }),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Brevo: ${error}`);
    }
    return response.json();
}
