import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
export const envoyerEmailReinitialisation = async (email, token) => {
    const lien=`${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
        from: `"Trusty" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `

            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Cliquez sur le lien ci-dessous. Il expire dans 1 heure.</p>
            <a href="${lien}">${lien}</a>
            <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        `
    };
    await transporter.sendMail(mailOptions);
}

export const envoyerEmailCredentiels = async (email, nom, prenom, motDePasse, role) => {
  const mailOptions = {
    from: `"Trusty" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Votre compte Trusty a été créé',
    html: `
      <h2>Bienvenue sur Trusty, ${prenom} ${nom} !</h2>
      <p>Un administrateur vient de créer votre compte avec le rôle <strong>${role}</strong>.</p>
      <p>Voici vos identifiants de connexion :</p>
      <ul>
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Mot de passe temporaire :</strong> <code>${motDePasse}</code></li>
      </ul>
      <p>Connectez-vous et changez votre mot de passe dès que possible.</p>
      <a href="${process.env.FRONTEND_URL}/login">Se connecter</a>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const envoyerEmailDemandeCompte = async (nom, prenom, email, role, message) => {
  const mailOptions = {
    from: `"Trusty" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Demande de création de compte — ${role}`,
    html: `
      <h2>Nouvelle demande de création de compte</h2>
      <ul>
        <li><strong>Nom :</strong> ${prenom} ${nom}</li>
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Rôle demandé :</strong> ${role}</li>
        ${message ? `<li><strong>Message :</strong> ${message}</li>` : ''}
      </ul>
      <p>Connectez-vous à l'interface admin pour créer ce compte.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const envoyerEmailVerification = async (email, token) => {
  const lien = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: `"Trusty" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Vérification de votre adresse email',
    html: `
      <h2>Bienvenue sur Trusty !</h2>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email. Il expire dans 24 heures.</p>
      <a href="${lien}">${lien}</a>
      <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export default transporter;