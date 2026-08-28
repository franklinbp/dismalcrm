const messages = {
  es: {
    translations: {
      signup: {
        title: "Registro",
        toasts: {
          success: "El usuario ha sido creado satisfactoriamente! Ahora inicia sesion!",
          fail: "Error creando el usuario. Verifica la data reportada.",
        },
        form: {
          name: "Nombre",
          email: "Correo Electronico",
          password: "Contrasena",
        },
        buttons: {
          submit: "Registrate",
          login: "Ya tienes una cuenta? Inicia sesion!",
        },
      },
      login: {
        title: "Inicio de Sesion",
        form: {
          email: "Correo Electronico",
          password: "Contrasena",
        },
        buttons: {
          submit: "Ingresa",
          register: "No tienes cuenta? Registrate!",
        },
      },
      auth: {
        toasts: {
          success: "Inicio de sesion exitoso!",
        },
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Mensajes hoy: ",
          },
        },
        messages: {
          inAttendance: {
            title: "En servicio"
          },
          waiting: {
            title: "Esperando"
          },
          closed: {
            title: "Finalizado"
          }
        }
      },
      connections: {
        title: "Conexiones",
        toasts: {
          deleted:
            "La conexion de WhatsApp ha sido borrada satisfactoriamente!",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "Estas seguro? Este proceso no puede ser revertido.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "Estas seguro? Deberas volver a leer el codigo QR",
        },
        buttons: {
          add: "Agrega WhatsApp",
          disconnect: "Desconectar",
          tryAgain: "Intentalo de nuevo",
          qrcode: "QR CODE",
          newQr: "Nuevo QR CODE",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "No se pudo iniciar la sesion de WhatsApp",
            content:
              "Asegurese de que su telefono celular este conectado a Internet y vuelva a intentarlo o solicite un nuevo codigo QR",
          },
          qrcode: {
            title: "Esperando la lectura del codigo QR",
            content:
              "Haga clic en el boton 'CODIGO QR' y lea el codigo QR con su telefono celular para iniciar la sesion",
          },
          connected: {
            title: "Conexion establecida",
          },
          timeout: {
            title: "Se perdio la conexion con el telefono celular",
            content:
              "Asegurese de que su telefono celular este conectado a Internet y que WhatsApp este abierto, o haga clic en el boton 'Desconectar' para obtener un nuevo codigo QR",
          },
        },
        table: {
          name: "Nombre",
          status: "Estado",
          lastUpdate: "Ultima Actualizacion",
          default: "Por Defecto",
          actions: "Acciones",
          session: "Sesion",
        },
      },
      whatsappModal: {
        title: {
          add: "Agrega WhatsApp",
          edit: "Edita WhatsApp",
        },
        form: {
          name: "Nombre",
          default: "Por Defecto",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado satisfactoriamente.",
      },
      qrCode: {
        message: "Lee el codigo QR para empezar la sesion.",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "Contacto borrado satisfactoriamente!",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Borrar",
          importTitlte: "Importar contactos",
          deleteMessage:
            "Estas seguro que deseas borrar este contacto? Todos los mensajes relacionados se perderan.",
          importMessage:
            "Quieres importar los contactos con conversaciones visibles en WhatsApp?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Correo Electronico",
          actions: "Acciones",
        },
      },
      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Detalles del contacto",
          extraInfo: "Informacion adicional",
          name: "Nombre",
          number: "Numero de Whatsapp",
          email: "Correo Electronico",
          extraName: "Nombre del Campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Agregar informacion",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado satisfactoriamente.",
      },
      quickAnswersModal: {
        title: {
          add: "Agregar respuesta rapida",
          edit: "Editar respuesta rapida",
        },
        form: {
          shortcut: "Atajo",
          message: "Respuesta rapida",
          media: "Adjuntar archivo",
          removeMedia: "Quitar archivo",
        },
        errors: {
          required: "Se requiere mensaje o archivo.",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Respuesta rapida guardada correctamente.",
      },
      queueModal: {
        title: {
          add: "Agregar cola",
          edit: "Editar cola",
        },
        form: {
          name: "Nombre",
          color: "Color",
          greetingMessage: "Mensaje de saludo",
        },
        buttons: {
          okAdd: "Anadir",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
      },
      userModal: {
        title: {
          add: "Agregar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nombre",
          email: "Correo Electronico",
          password: "Contrasena",
          profile: "Perfil",
          whatsapp: "Conexion estandar",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado satisfactoriamente.",
      },
      chat: {
        noTicketMessage: "Selecciona un mensaje para empezar a chatear.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Lineas",
      },
      tickets: {
        toasts: {
          deleted: "El mensaje en el que estabas ha sido borrado.",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Bandeja" },
          closed: { title: "Resueltos" },
          search: { title: "Buscar" },
        },
        search: {
          placeholder: "Buscar mensajes.",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Mensaje",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir a la cola",
        fieldConnectionLabel: "Transferir to conexion",
        fieldQueuePlaceholder: "Seleccione una cola",
        fieldConnectionPlaceholder: "Seleccione una conexion",
        noOptions: "No se encontraron usuarios con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Cola",
        assignedHeader: "Trabajando en",
        noTicketsTitle: "Nada aca!",
        connectionTitle: "Conexion que se esta utilizando actualmente.",
        noTicketsMessage:
          "No se encontraron mensajes con este estado o termino de busqueda",
        buttons: {
          accept: "Aceptar",
        },
      },
      newTicketModal: {
        title: "Nuevo Mensaje",
        fieldLabel: "Escribe para buscar un contacto",
        add: "Anadir",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexiones",
          tickets: "Mensajes",
          contacts: "Contactos",
          quickAnswers: "Respuestas rapidas",
          campaigns: "Campañas masivas",
          campaignClients: "Clientes campanas",
          queues: "Lineas",
          administration: "Administracion",
          users: "Usuarios",
          settings: "Configuracion",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Cerrar Sesion",
          },
        },
      },
      notifications: {
        noTickets: "Sin mensajes.",
      },
      queues: {
        title: "Lineas",
        table: {
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de saludo",
          actions: "Comportamiento",
        },
        buttons: {
          add: "Agregar cola",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
            "Estas seguro? Esta accion no se puede revertir! Los mensajes en esa cola seguiran existiendo, pero ya no tendran ninguna cola asignada.",
        },
      },
      queueSelect: {
        inputLabel: "Lineas",
      },
      quickAnswers: {
        title: "Respuestas rapidas",
        table: {
          shortcut: "Atajo",
          message: "Respuesta rapida",
          media: "Archivo",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar respuesta rapida",
        },
        toasts: {
          deleted: "Respuesta rapida eliminada correctamente",
        },
        searchPlaceholder: "Buscar ...",
        confirmationModal: {
          deleteTitle:
            "Estas seguro de que desea eliminar esta respuesta rapida?",
          deleteMessage: "Esta accion no se puede deshacer.",
        },
        mediaLabel: "[Adjunto]",
      },
      campaigns: {
        title: "Campañas",
        table: {
          name: "Nombre",
          status: "Estado",
          senderMode: "Modo de emisor",
          createdAt: "Creado",
          actions: "Acciones",
        },
        buttons: {
          new: "Nueva campaña",
          quickSend: "Envío rápido",
          open: "Abrir",
          edit: "Editar",
          duplicate: "Duplicar",
          delete: "Eliminar",
          ready: "Enviar campaña",
          cancel: "Cancelar",
          back: "Volver",
          save: "Guardar borrador",
        },
        fields: {
          name: "Nombre",
          messageBody: "Mensaje",
          messageHelp: "Usa variables como {{name}} y {{phone}}.",
          senderMode: "Modo de emisor",
          sender: "Emisor",
          ratePerMin: "Tasa por min",
          estimatedSend: "Estimado {{minutes}} min para {{count}} destinatarios",
          estimatedSendEmpty: "Define una tasa para calcular el tiempo estimado",
          scheduleAt: "Programar",
          attachmentsEmpty: "Adjuntos opcionales (requiere habilitar envío en backend)",
          attachmentsSelected: "{{count}} adjunto(s) seleccionado(s)",
        },
        senderModes: {
          single: "Emisor único",
          roundRobin: "Rotación",
        },
        modal: {
          createTitle: "Crear campaña",
          editTitle: "Editar campaña",
          save: "Guardar",
          cancel: "Cancelar",
        },
        recipients: {
          title: "Destinatarios",
          fromContacts: "Agregar desde contactos",
          fromClients: "Agregar desde clientes",
          importCsv: "Importar CSV ({{count}})",
          imported: "Destinatarios importados",
          selectContacts: "Seleccionar contactos",
          selectClients: "Seleccionar clientes",
          search: "Buscar",
          loadMore: "Cargar más",
          import: "Importar",
          select: "Seleccionar",
          name: "Nombre",
          phone: "Teléfono",
          email: "Email",
          status: "Estado",
          count: "{{count}} destinatarios",
          manualName: "Nombre",
          manualPhone: "Teléfono (E.164)",
          manualPhoneHelp: "Ejemplo: +593987654321",
          manualAdd: "Agregar manual",
          manualRequired: "Completa nombre y teléfono",
        },
        preview: {
          title: "Vista previa",
          name: "Nombre",
          phone: "Teléfono",
          button: "Previsualizar",
          rendered: "Mensaje renderizado",
        },
        metrics: {
          title: "Métricas",
          total: "Total",
          sent: "Enviados",
          failed: "Fallidos",
          pending: "Pendientes",
          retrying: "Reintentos",
        },
        toasts: {
          created: "Campaña creada.",
          updated: "Campaña actualizada.",
          deleted: "Campaña eliminada.",
          duplicated: "Campaña duplicada como borrador.",
          ready: "Campaña READY.",
          canceled: "Campaña cancelada.",
          mediaUploaded: "Archivo cargado en la campaña.",
        },
        confirmDelete: {
          title: "Eliminar campaña",
          message: "¿Seguro? Esto eliminará la campaña y todos sus destinatarios.",
        },
        quickSend: {
          title: "Envío rápido",
          description: "Envía ahora (o programa) un mensaje masivo en un solo paso.",
          nameHelp: "Opcional. Si lo dejas vacío, se genera automáticamente.",
          attachment: "Adjuntar archivo",
          selectedCount: "{{count}} cliente(s) seleccionado(s)",
          sendNow: "Guardar y enviar",
          defaultName: "Campaña rápida",
          success: "Envío rápido creado y puesto en cola.",
          errors: {
            recipientsRequired: "Selecciona al menos un cliente.",
            messageRequired: "Escribe el mensaje.",
            senderRequired: "Selecciona un emisor."
          }
        },
        calendar: {
          title: "Calendario de campañas",
          dateLabel: "Fecha",
          upcomingCount: "{{count}} campaña(s) programada(s) pendiente(s)",
          empty: "No hay campañas programadas para esta fecha."
        }
      },
      campaignClients: {
        title: "Clientes campanas",
        table: {
          name: "Nombre",
          tradeName: "Nombre comercial",
          phone: "Teléfono",
          email: "Email",
          category: "Categoría",
          actions: "Acciones",
        },
        buttons: {
          new: "Nuevo cliente",
        },
        fields: {
          name: "Nombre",
          tradeName: "Nombre comercial",
          phone: "Teléfono",
          phoneHelp: "Usa formato E.164. Ejemplo: +593987654321",
          email: "Email",
          category: "Categoría",
        },
        modal: {
          title: "Cliente",
          save: "Guardar",
          cancel: "Cancelar",
        },
        toasts: {
          created: "Cliente creado correctamente.",
          updated: "Cliente actualizado correctamente.",
          deleted: "Cliente eliminado correctamente.",
        },
      },
      senders: {
        title: "Emisores",
        table: {
          name: "Nombre",
          phone: "Teléfono",
          whatsapp: "WhatsApp",
          status: "Estado",
          rate: "Tasa/min",
          actions: "Acciones",
        },
        fields: {
          name: "Nombre",
          phone: "Teléfono",
          whatsapp: "WhatsApp",
          status: "Estado",
          ratePerMin: "Tasa por min",
        },
        status: {
          online: "En línea",
          offline: "Fuera de línea",
        },
        buttons: {
          new: "Nuevo emisor",
        },
        modal: {
          title: "Crear emisor",
          save: "Guardar",
          cancel: "Cancelar",
        },
        toasts: {
          created: "Emisor creado.",
          updated: "Emisor actualizado.",
          deleted: "Emisor eliminado.",
        },
      },
      users: {
        title: "Usuarios",
        table: {
          name: "Nombre",
          email: "Correo Electronico",
          profile: "Perfil",
          whatsapp: "Conexion estandar",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar usuario",
        },
        toasts: {
          deleted: "Usuario borrado satisfactoriamente.",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage:
            "Toda la informacion del usuario se perdera. Los mensajes abiertos de los usuarios se moveran a la cola.",
        },
      },
      settings: {
        success: "Configuracion guardada satisfactoriamente.",
        title: "Configuracion",
        settings: {
          userCreation: {
            name: "Creacion de usuarios",
            options: {
              enabled: "Habilitado",
              disabled: "Deshabilitado",
            },
          },
          autoReplyEnabled: {
            name: "Respuestas automaticas del bot",
            options: {
              enabled: "Habilitado",
              disabled: "Deshabilitado",
            },
          },
          autoReplyRules: {
            name: "Reglas del bot",
            helper:
              "Una regla por linea. Formato: palabra=>respuesta. Puedes usar sinonimos con coma o |. Variables: {{name}}, {{firstName}}, {{phone}}, {{message}}. Ejemplo: precio,costos=>Hola {{firstName}}, te comparto nuestros precios.",
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Asignado a:",
          buttons: {
            return: "Devolver",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceptar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Escriba un mensaje o presione '' / '' para usar las respuestas rapidas registradas",
        placeholderClosed:
          "Vuelva a abrir o acepte este mensaje para enviar un mensaje.",
        signMessage: "Firmar",
      },
      contactDrawer: {
        header: "Detalles del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra informacion",
      },
      ticketOptionsMenu: {
        delete: "Borrar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Borrar mensaje #",
          titleFrom: "del contacto ",
          message:
            "Atencion! Todos los mensajes relacionados con el mensaje se perderan.",
        },
        buttons: {
          delete: "Borrar",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Borrar",
        reply: "Responder",
        confirmationModal: {
          title: "Borrar mensaje?",
          message: "Esta accion no puede ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "Debe haber al menos una conexion de WhatsApp predeterminada.",
        ERR_NO_DEF_WAPP_FOUND:
          "No se encontro WhatsApp predeterminado. Verifique la pagina de conexiones.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sesion de WhatsApp no esta inicializada. Verifique la pagina de conexiones.",
        ERR_WAPP_CHECK_CONTACT:
          "No se pudo verificar el contacto de WhatsApp. Verifique la pagina de conexiones.",
        ERR_WAPP_INVALID_CONTACT: "Este no es un numero de whatsapp valido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "No se pudieron descargar los medios de WhatsApp. Verifique la pagina de conexiones.",
        ERR_INVALID_CREDENTIALS: "Error de autenticacion. Vuelva a intentarlo.",
        ERR_SENDING_WAPP_MSG:
          "Error al enviar el mensaje de WhatsApp. Verifique la pagina de conexiones.",
        ERR_DELETE_WAPP_MSG: "No se pudo borrar el mensaje de WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ya hay un mensaje abierto para este contacto.",
        ERR_SESSION_EXPIRED: "Sesion caducada. Inicie sesion.",
        ERR_USER_CREATION_DISABLED:
          "La creacion de usuarios fue deshabilitada por el administrador.",
        ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este numero.",
        ERR_NO_SETTING_FOUND:
          "No se encontro ninguna configuracion con este ID.",
        ERR_NO_CONTACT_FOUND: "No se encontro ningun contacto con este ID.",
        ERR_NO_TICKET_FOUND: "No se encontro ningun mensaje con este ID.",
        ERR_WAPP_COMPANY_REQUIRED: "La conexion de WhatsApp no tiene una empresa asignada.",
        ERR_WAPP_COMPANY_NOT_ASSIGNED:
          "La conexion de WhatsApp no tiene empresa asignada.",
        ERR_WAPP_CONNECTION_LIMIT:
          "DismalCRM permite un maximo de dos conexiones de WhatsApp.",
        ERR_WAPP_COUNTRY_NOT_ALLOWED:
          "Esta instancia acepta unicamente numeros de WhatsApp de Ecuador.",
        ERR_WAPP_IMPORT_CONTACTS:
          "No se pudieron importar los contactos del telefono. Verifique que WhatsApp este conectado.",
        ERR_NO_USER_FOUND: "No se encontro ningun usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontro WhatsApp con este ID.",
        ERR_CREATING_MESSAGE: "Error al crear el mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear el mensaje en la base de datos.",
        ERR_FETCH_WAPP_MSG:
          "Error al obtener el mensaje en WhatsApp, tal vez sea demasiado antiguo.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Este color ya esta en uso, elija otro.",
        ERR_WAPP_GREETING_REQUIRED:
          "El mensaje de saludo es obligatorio cuando hay mas de una cola.",
      },
    },
  },
};

export { messages };

