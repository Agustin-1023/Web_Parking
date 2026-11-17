import nodemailer from 'nodemailer';from
const transporter = nodemailer.createTransport({
	service:'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

@param {string} destinatario
@param {string} asunto
@param {string} htmlContent
 
export const enviarCorreo = async (destinatario, asunto, htmlContent) => {
	try {
		const mailOptions = {
			from: '"Sistema de Estacionamiento" <no-reply@tuapp.com>',
			to: destinatario,
			subject: asunto,
			html: htmlContent
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Correo enviado con exito: %s", info.messageId);
		return true;
	} catch (error) {
		console.error("Error al enviar el correo:", error);
	}
};