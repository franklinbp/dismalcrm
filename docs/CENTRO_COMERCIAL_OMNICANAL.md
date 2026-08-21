# Centro Comercial Omnicanal

## Propuesta final

El modulo convierte conversaciones existentes en oportunidades comerciales sin tocar la conexion de WhatsApp.

Flujo:

```text
WhatsApp / Messenger / Instagram
-> Contacto + Ticket normal
-> Lead comercial
-> Seguimiento
-> Catalogo segmentado
-> Venta en Maleskin
```

## Version inicial desarrollada

- Nueva pantalla: `Centro comercial`.
- KPIs:
  - Leads de hoy.
  - En seguimiento.
  - Mayoristas activos.
  - Tareas de hoy.
- Bandeja de oportunidades basada en tickets recientes.
- Ficha comercial por contacto.
- Estado comercial:
  - Nuevo.
  - Cotizado.
  - Seguimiento.
  - Ganado.
  - Perdido.
  - No responde.
- Tipo de cliente:
  - Sin clasificar.
  - Cliente final.
  - Mayorista.
- Tareas de seguimiento por lead.
- Bloque visual para envio de catalogo al final del dia.

## Regla de seguridad

No se modifico el listener de WhatsApp ni las sesiones. El modulo sincroniza desde tickets recientes al consultar la pantalla, de forma limitada, para evitar cargar el sistema.

## Siguiente fase recomendada

1. Conectar `Crear venta` con la API de Maleskin.
2. Conectar `Enviar catalogo` con campañas por segmento.
3. Agregar regla anti-duplicado de catalogos por 24 horas.
4. Traer historial de compras, credito y AR desde Maleskin.
5. Medir conversion por canal y por operador.
