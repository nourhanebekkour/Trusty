import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
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

export default transporter;