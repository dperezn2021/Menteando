async function enviarCorreoSoporte(email, mensaje) {
    try {
        const response = await fetch('/api/enviar-correo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                mensaje: mensaje,
                destinatario: 'danieloo.2003.p.n@gmail.com'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Correo enviado exitosamente');
            return true;
        } else {
            console.error('Error al enviar correo:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        return false;
    }
}