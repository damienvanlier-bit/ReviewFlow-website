import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Ontbrekende omgevingsvariabele: ${name}`);
  }
  return value;
}

async function loadClient(clientKey) {
  const raw = await readFile(path.join(__dirname, '..', 'config', 'clients.json'), 'utf8');
  const clients = JSON.parse(raw);
  const client = clients[clientKey];
  if (!client) {
    throw new Error(
      `Onbekende klant: "${clientKey}". Voeg deze eerst toe aan config/clients.json.`,
    );
  }
  return client;
}

function buildSystemPrompt(client) {
  return [
    `Je schrijft een conceptreactie op een Google-review, namens ${client.displayName}.`,
    `Schrijfstijl: ${client.toneOfVoice}`,
    `Achtergrond van het bedrijf: ${client.businessInfo}`,
    'Regels waar je je ALTIJD aan houdt:',
    '- Verzin nooit feiten, beloftes, openingstijden of andere details die niet in de review of de achtergrondinfo staan.',
    `- Maximaal ${client.maxWords} woorden.`,
    '- Bij een negatieve review: erken het punt van de klant serieus en wees niet defensief. Spreek de klant niet tegen.',
    `- Sluit exact af met deze regel:\n${client.closing}`,
    '- Geef alleen de reactietekst terug, zonder inleidende zin zoals "Hier is de conceptreactie:".',
  ].join('\n');
}

async function draftReply({ client, reviewerName, stars, reviewText }) {
  const anthropic = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: buildSystemPrompt(client),
    messages: [
      {
        role: 'user',
        content: `Review van ${reviewerName} (${stars} van de 5 sterren):\n\n"${reviewText}"\n\nSchrijf de conceptreactie.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('Claude gaf geen tekstantwoord terug.');
  }
  return textBlock.text.trim();
}

async function sendApprovalEmail({ client, reviewerName, stars, reviewText, concept }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: requireEnv('GMAIL_USER'),
      pass: requireEnv('GMAIL_APP_PASSWORD'),
    },
  });

  const subject = `[ReviewFlow] Ter controle: reactie op review van ${reviewerName} (${client.displayName})`;
  const text = [
    'Nieuwe conceptreactie ter goedkeuring — dit is NOG NIET gepubliceerd.',
    '',
    `Klant: ${client.displayName}`,
    `Reviewer: ${reviewerName}`,
    `Sterren: ${stars}/5`,
    '',
    '--- Originele review ---',
    reviewText,
    '',
    '--- Conceptreactie van Claude ---',
    concept,
    '',
    'Kopieer de conceptreactie pas naar Google nadat je \'m hebt gecontroleerd en eventueel aangepast.',
  ].join('\n');

  await transporter.sendMail({
    from: requireEnv('GMAIL_USER'),
    to: requireEnv('APPROVER_EMAIL'),
    subject,
    text,
  });
}

async function main() {
  const clientKey = requireEnv('CLIENT');
  const reviewerName = requireEnv('REVIEWER_NAME');
  const stars = requireEnv('STARS');
  const reviewText = requireEnv('REVIEW_TEXT');

  const client = await loadClient(clientKey);

  console.log(`Concept genereren voor ${client.displayName}...`);
  const concept = await draftReply({ client, reviewerName, stars, reviewText });

  console.log('Concept klaar, e-mail versturen ter goedkeuring...');
  await sendApprovalEmail({ client, reviewerName, stars, reviewText, concept });

  console.log('Klaar! Check je mail — er is niets automatisch gepubliceerd.');
}

main().catch((error) => {
  console.error('Er ging iets mis:', error.message);
  process.exitCode = 1;
});
