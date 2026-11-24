import nodemailer from 'nodemailer';

const port = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_KEY,
	}
});
/**
*@param {string} destinatario
*@param {string} asunto
*@param {string} htmlContent
*@returns {Promise<boolean>}
*/
export const enviarCorreo = async (destinatario, asunto, htmlContent) => {
	try {
		if (!destinatario) {
			console.error('Error al enviar el correo: Falta el destinatario.');
			return false;
		}

		const mailOptions = {
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to: destinatario,
			subject: asunto,
			html: htmlContent,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Correo enviado con exito: ", info.messageId);
		return true;
	} catch (error) {
		console.error("Error al enviar el correo:", error);
		return false;
	}
}