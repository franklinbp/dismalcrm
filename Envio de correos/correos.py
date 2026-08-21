import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import tkinter as tk
from tkinter import messagebox

def enviar_correo(asunto, mensaje, destinatario):
    correo_origen = "correo"
    contra_aplicacion = "constrasena"  # Usar la contraseña de aplicación generada
    servidor_smtp = "smtp.gmail.com"
    puerto_smtp = 587

    # Crear el mensaje
    msj = MIMEMultipart()
    msj["From"] = correo_origen
    msj["To"] = destinatario
    msj["Subject"] = asunto
    msj.attach(MIMEText(mensaje, "plain"))

    try:
        # Conectar al servidor SMTP y enviar el correo
        server = smtplib.SMTP(servidor_smtp, puerto_smtp)
        server.starttls()
        server.login(correo_origen, contra_aplicacion)
        server.sendmail(correo_origen, destinatario, msj.as_string())
        server.quit()
        messagebox.showinfo("Éxito", f"Correo enviado a {destinatario}")
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo enviar el correo a {destinatario}: {str(e)}")

def limpiar_campos():
    entrada_asunto.delete(0, tk.END)
    entrada_mensaje.delete(1.0, tk.END)
    entrada_correo.delete(0, tk.END)  # Limpiar el campo de correo

def nuevo_correo():
    limpiar_campos()

# Configuración de la ventana principal
raiz = tk.Tk()
raiz.title("Enviar Correo Electrónico")
raiz.geometry("400x300")

# Campo de entrada del correo
etiqueta_correo = tk.Label(raiz, text="Correo:")
etiqueta_correo.pack()
entrada_correo = tk.Entry(raiz, width=50)  # Usar una caja de texto para ingresar el correo
entrada_correo.pack()

# Campo de entrada del asunto
etiqueta_asunto = tk.Label(raiz, text="Asunto:")
etiqueta_asunto.pack()
entrada_asunto = tk.Entry(raiz, width=50)
entrada_asunto.pack()

# Campo de entrada del mensaje
etiqueta_mensaje = tk.Label(raiz, text="Mensaje:")
etiqueta_mensaje.pack()
entrada_mensaje = tk.Text(raiz, height=10, width=50)
entrada_mensaje.pack()

# Botón de enviar
boton_enviar = tk.Button(raiz, text="Enviar", command=lambda: enviar_correo(
    entrada_asunto.get(), 
    entrada_mensaje.get("1.0", tk.END), 
    entrada_correo.get()  # Obtener el correo directamente de la caja de texto
))
boton_enviar.pack()

# Botón de limpiar
boton_limpiar = tk.Button(raiz, text="Limpiar", command=limpiar_campos)
boton_limpiar.pack()

# Botón de nuevo
boton_nuevo = tk.Button(raiz, text="Nuevo", command=nuevo_correo)
boton_nuevo.pack()

# Ejecutar la aplicación
raiz.mainloop()
