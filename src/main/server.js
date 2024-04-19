const http = require('http');
const { StringDecoder } = require('string_decoder');

require('dotenv').config();
console.log("apiRest start ...", process.env.MAIL_HOST);
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: `${process.env.MAIL_HOST}`,
    port: process.env.MAIL_PORT,
    auth: {
        user: `${process.env.MAIL_USERNAME}`,
        pass: `${process.env.MAIL_PASSWORD}`
    }
});

const requestHandler = (request, response) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    if (request.url === '/api' && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Hola Mundo!' }));
    } else if (request.url === '/api/email' && request.method === 'POST') {
        request.on('data', (data) => {
            buffer += decoder.write(data);
        });
        request.on('end', () => {
            buffer += decoder.end();
            console.log('Cuerpo de la solicitud:', buffer);
            let objEmail;
            try {
                objEmail = JSON.parse(buffer);
                // console.log("buff - ", buffer);
                // console.log("this is data - ", objEmail.name);
                // console.log(" dominio ", process.env.DOMAIN_HOST);
                const mailOptions = {
                    from: `${objEmail.email}`,
                    to: `${process.env.MAIL_FOR_ADDRESS}`,
                    subject: `Asunto del correo ${objEmail.asunto}`,
                    text: `Hola me llamo ${objEmail.name}, ${objEmail.message}, este es mi correo ${objEmail.email}`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email enviado: ' + info.response);
                    }
                });
            } catch (error) {
                console.error('Error al parsear el cuerpo de la solicitud:', error);
            }
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({ status: 200, message: 'Correo enviado correctamente' }));
            // response.end(JSON.stringify({ status: 200, message: 'Correo enviado correctamente', data: objEmail }));
        });
    } else {
        response.writeHead(404);
        response.end();
    }
};
const server = http.createServer(requestHandler);

const port = 3000;
server.listen(port, () => {
    // console.log();
    // console.log(`Servidor corriendo en http://localhost:${port}`);
    // console.log(`Servidor corriendo en ${process.env.DOMAIN_HOST}`);
});
