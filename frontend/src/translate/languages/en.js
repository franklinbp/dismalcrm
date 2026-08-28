const messages = {
  en: {
    translations: {
      signup: {
        title: "Sign up",
        toasts: {
          success: "User created successfully! Please login!",
          fail: "Error creating user. Check the reported data.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Register",
          login: "Already have an account? Log in!",
        },
      },
      login: {
        title: "Login",
        form: {
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Enter",
          register: "Don't have an account? Register!",
        },
      },
      auth: {
        toasts: {
          success: "Login successfully!",
        },
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Messages today: ",
          },
        },
        messages: {
          inAttendance: {
            title: "In Service"
          },
          waiting: {
            title: "Waiting"
          },
          closed: {
            title: "Closed"
          }
        }
      },
      connections: {
        title: "Connections",
        toasts: {
          deleted: "WhatsApp connection deleted sucessfully!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? It cannot be reverted.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You'll need to read QR Code again.",
        },
        buttons: {
          add: "Add WhatsApp",
          disconnect: "Disconnect",
          tryAgain: "Try Again",
          qrcode: "QR CODE",
          newQr: "New QR CODE",
          connecting: "Connectiing",
        },
        toolTips: {
          disconnected: {
            title: "Failed to start WhatsApp session",
            content:
              "Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
          },
          qrcode: {
            title: "Waiting for QR Code read",
            content:
              "Click on 'QR CODE' button and read the QR Code with your cell phone to start session",
          },
          connected: {
            title: "Connection established",
          },
          timeout: {
            title: "Connection with cell phone has been lost",
            content:
              "Make sure your cell phone is connected to the internet and WhatsApp is open, or click on 'Disconnect' button to get a new QRcode",
          },
        },
        table: {
          name: "Name",
          status: "Status",
          lastUpdate: "Last Update",
          default: "Default",
          actions: "Actions",
          session: "Session",
        },
      },
      whatsappModal: {
        title: {
          add: "Add WhatsApp",
          edit: "Edit WhatsApp",
        },
        form: {
          name: "Name",
          default: "Default",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      qrCode: {
        message: "Read QrCode to start the session",
      },
      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact deleted sucessfully!",
        },
        searchPlaceholder: "Search ...",
        confirmationModal: {
          deleteTitle: "Delete",
          importTitlte: "Import contacts",
          deleteMessage:
            "Are you sure you want to delete this contact? All related messages will be lost.",
          importMessage: "Do you want to import contacts with visible WhatsApp conversations?",
        },
        buttons: {
          import: "Import Contacts",
          add: "Add Contact",
        },
        table: {
          name: "Name",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Actions",
        },
      },
      contactModal: {
        title: {
          add: "Add contact",
          edit: "Edit contact",
        },
        form: {
          mainInfo: "Contact details",
          extraInfo: "Additional information",
          name: "Name",
          number: "Whatsapp number",
          email: "Email",
          extraName: "Field name",
          extraValue: "Value",
        },
        buttons: {
          addExtraInfo: "Add information",
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Contact saved successfully.",
      },
      quickAnswersModal: {
        title: {
          add: "Add Quick Reply",
          edit: "Edit Quick Answer",
        },
        form: {
          shortcut: "Shortcut",
          message: "Quick Reply",
          media: "Attach media",
          removeMedia: "Remove media",
        },
        errors: {
          required: "Message or media is required.",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Quick Reply saved successfully.",
      },
      queueModal: {
        title: {
          add: "Add queue",
          edit: "Edit queue",
        },
        form: {
          name: "Name",
          color: "Color",
          greetingMessage: "Greeting Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
      },
      userModal: {
        title: {
          add: "Add user",
          edit: "Edit user",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
          profile: "Profile",
          whatsapp: "Default Connection",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "User saved successfully.",
      },
      chat: {
        noTicketMessage: "Select a message to start chatting.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "New",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Queues",
      },
      tickets: {
        toasts: {
          deleted: "The message you were on has been deleted.",
        },
        notification: {
          message: "Message from",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolved" },
          search: { title: "Search" },
        },
        search: {
          placeholder: "Search messages.",
        },
        buttons: {
          showAll: "All",
        },
      },
      transferTicketModal: {
        title: "Transfer Message",
        fieldLabel: "Type to search for users",
        fieldQueueLabel: "Transfer to queue",
        fieldConnectionLabel: "Transfer to connection",
        fieldQueuePlaceholder: "Please select a queue",
        fieldConnectionPlaceholder: "Please select a connection",
        noOptions: "No user found with this name",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        pendingHeader: "Queue",
        assignedHeader: "Working on",
        noMessagesTitle: "Nothing here!",
        noMessagesMessage: "No messages found with this status or search term.",
        connectionTitle: "Connection that is currently being used.",
        buttons: {
          accept: "Accept",
        },
      },
      newTicketModal: {
        title: "New Message",
        fieldLabel: "Type to search for a contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Connections",
          tickets: "Messages",
          contacts: "Contacts",
          quickAnswers: "Quick Answers",
          campaigns: "Bulk Campaigns",
          campaignClients: "Clients",
          queues: "Queues",
          administration: "Administration",
          users: "Users",
          settings: "Settings",
        },
        appBar: {
          user: {
            profile: "Profile",
            logout: "Logout",
          },
        },
      },
      notifications: {
        noMessages: "No messages.",
      },
      queues: {
        title: "Queues",
        table: {
          name: "Name",
          color: "Color",
          greeting: "Greeting message",
          actions: "Actions",
        },
        buttons: {
          add: "Add queue",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "Are you sure? It cannot be reverted! Messages in this queue will still exist, but will not have any queues assigned.",
        },
      },
      queueSelect: {
        inputLabel: "Queues",
      },
      quickAnswers: {
        title: "Quick Answers",
        table: {
          shortcut: "Shortcut",
          message: "Quick Reply",
          media: "Media",
          actions: "Actions",
        },
        buttons: {
          add: "Add Quick Reply",
        },
        toasts: {
          deleted: "Quick Reply deleted successfully.",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Quick Reply: ",
          deleteMessage: "This action cannot be undone.",
        },
        mediaLabel: "[Attachment]",
      },
      campaigns: {
        title: "Campaigns",
        table: {
          name: "Name",
          status: "Status",
          senderMode: "Sender mode",
          createdAt: "Created at",
          actions: "Actions",
        },
        buttons: {
          new: "New campaign",
          quickSend: "Quick send",
          open: "Open",
          edit: "Edit",
          duplicate: "Duplicate",
          delete: "Delete",
          ready: "Send campaign",
          cancel: "Cancel",
          back: "Back",
          save: "Save draft",
        },
        fields: {
          name: "Name",
          messageBody: "Message",
          messageHelp: "Use variables like {{name}} and {{phone}}.",
          senderMode: "Sender mode",
          sender: "Sender",
          ratePerMin: "Rate per min",
          estimatedSend: "Estimated {{minutes}} min for {{count}} recipients",
          estimatedSendEmpty: "Set a rate to estimate sending time",
          scheduleAt: "Schedule at",
          attachmentsEmpty: "Optional attachments (backend sending required)",
          attachmentsSelected: "{{count}} attachment(s) selected",
        },
        senderModes: {
          single: "Single sender",
          roundRobin: "Round robin",
        },
        modal: {
          createTitle: "Create campaign",
          editTitle: "Edit campaign",
          save: "Save",
          cancel: "Cancel",
        },
        recipients: {
          title: "Recipients",
          fromContacts: "Add from contacts",
          fromClients: "Add from clients",
          importCsv: "Import CSV ({{count}})",
          imported: "Recipients imported",
          selectContacts: "Select contacts",
          selectClients: "Select clients",
          search: "Search",
          loadMore: "Load more",
          import: "Import",
          select: "Select",
          name: "Name",
          phone: "Phone",
          email: "Email",
          status: "Status",
          count: "{{count}} recipients",
          manualName: "Name",
          manualPhone: "Phone (E.164)",
          manualPhoneHelp: "Example: +15551234567",
          manualAdd: "Add manually",
          manualRequired: "Complete name and phone",
        },
        preview: {
          title: "Preview",
          name: "Name",
          phone: "Phone",
          button: "Preview",
          rendered: "Rendered message",
        },
        metrics: {
          title: "Metrics",
          total: "Total",
          sent: "Sent",
          failed: "Failed",
          pending: "Pending",
          retrying: "Retrying",
        },
        toasts: {
          created: "Campaign created.",
          updated: "Campaign updated.",
          deleted: "Campaign deleted.",
          duplicated: "Campaign duplicated as draft.",
          ready: "Campaign READY.",
          canceled: "Campaign canceled.",
          mediaUploaded: "Media uploaded to campaign.",
        },
        confirmDelete: {
          title: "Delete campaign",
          message: "Are you sure? This will remove the campaign and all recipients.",
        },
        quickSend: {
          title: "Quick send",
          description: "Send now (or schedule) a bulk message in one step.",
          nameHelp: "Optional. If empty, a name will be generated automatically.",
          attachment: "Attach file",
          selectedCount: "{{count}} client(s) selected",
          sendNow: "Save and send",
          defaultName: "Quick Campaign",
          success: "Quick send created and queued.",
          errors: {
            recipientsRequired: "Select at least one client.",
            messageRequired: "Message is required.",
            senderRequired: "Select a sender."
          }
        },
        calendar: {
          title: "Campaign calendar",
          dateLabel: "Date",
          upcomingCount: "{{count}} scheduled campaign(s) pending",
          empty: "No campaigns scheduled for this date."
        }
      },
      campaignClients: {
        title: "Clients",
        table: {
          name: "Name",
          tradeName: "Trade name",
          phone: "Phone",
          email: "Email",
          category: "Category",
          actions: "Actions",
        },
        buttons: {
          new: "New client",
        },
        fields: {
          name: "Name",
          tradeName: "Trade name",
          phone: "Phone",
          phoneHelp: "Use E.164 format. Example: +15551234567",
          email: "Email",
          category: "Category",
        },
        modal: {
          title: "Client",
          save: "Save",
          cancel: "Cancel",
        },
        toasts: {
          created: "Client created successfully.",
          updated: "Client updated successfully.",
          deleted: "Client deleted successfully.",
        },
      },
      senders: {
        title: "Senders",
        table: {
          name: "Name",
          phone: "Phone",
          whatsapp: "WhatsApp",
          status: "Status",
          rate: "Rate/min",
          actions: "Actions",
        },
        fields: {
          name: "Name",
          phone: "Phone",
          whatsapp: "WhatsApp",
          status: "Status",
          ratePerMin: "Rate per min",
        },
        status: {
          online: "Online",
          offline: "Offline",
        },
        buttons: {
          new: "New sender",
        },
        modal: {
          title: "Create sender",
          save: "Save",
          cancel: "Cancel",
        },
        toasts: {
          created: "Sender created.",
          updated: "Sender updated.",
          deleted: "Sender deleted.",
        },
      },
      users: {
        title: "Users",
        table: {
          name: "Name",
          email: "Email",
          profile: "Profile",
          whatsapp: "Default Connection",
          actions: "Actions",
        },
        buttons: {
          add: "Add user",
        },
        toasts: {
          deleted: "User deleted sucessfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "All user data will be lost. Users' open messages will be moved to queue.",
        },
      },
      settings: {
        success: "Settings saved successfully.",
        title: "Settings",
        settings: {
          userCreation: {
            name: "User creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          autoReplyEnabled: {
            name: "Automatic bot replies",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          autoReplyRules: {
            name: "Bot rules",
            helper:
              "One rule per line. Format: keyword=>response. Example: price=>Hello {{name}}, our plans start at $10.",
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Assigned to:",
          buttons: {
            return: "Return",
            resolve: "Resolve",
            reopen: "Reopen",
            accept: "Accept",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Type a message or press ''/'' to use the registered quick responses",
        placeholderClosed: "Reopen or accept this message to send a message.",
        signMessage: "Sign",
      },
      contactDrawer: {
        header: "Contact details",
        buttons: {
          edit: "Edit contact",
        },
        extraInfo: "Other information",
      },
      ticketOptionsMenu: {
        delete: "Delete",
        transfer: "Transfer",
        confirmationModal: {
          title: "Delete message #",
          titleFrom: "from contact ",
          message: "Attention! All message-related items will be lost.",
        },
        buttons: {
          delete: "Delete",
          cancel: "Cancel",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancel",
        },
      },
      messageOptionsMenu: {
        delete: "Delete",
        reply: "Reply",
        confirmationModal: {
          title: "Delete message?",
          message: "This action cannot be reverted.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "There must be at lest one default WhatsApp connection.",
        ERR_NO_DEF_WAPP_FOUND:
          "No default WhatsApp found. Check connections page.",
        ERR_WAPP_NOT_INITIALIZED:
          "This WhatsApp session is not initialized. Check connections page.",
        ERR_WAPP_CHECK_CONTACT:
          "Could not check WhatsApp contact. Check connections page.",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid whatsapp number.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Could not download media from WhatsApp. Check connections page.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_SENDING_WAPP_MSG:
          "Error sending WhatsApp message. Check connections page.",
        ERR_DELETE_WAPP_MSG: "Couldn't delete message from WhatsApp.",
        ERR_OTHER_OPEN_TICKET:
          "There's already an open message for this contact.",
        ERR_SESSION_EXPIRED: "Session expired. Please login.",
        ERR_USER_CREATION_DISABLED:
          "User creation was disabled by administrator.",
        ERR_NO_PERMISSION: "You don't have permission to access this resource.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_NO_SETTING_FOUND: "No setting found with this ID.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_TICKET_FOUND: "No message found with this ID.",
        ERR_WAPP_COMPANY_REQUIRED: "The WhatsApp connection is not assigned to a company.",
        ERR_WAPP_COMPANY_NOT_ASSIGNED:
          "The WhatsApp connection is not assigned to a company.",
        ERR_WAPP_CONNECTION_LIMIT:
          "DismalCRM allows a maximum of two WhatsApp connections.",
        ERR_WAPP_COUNTRY_NOT_ALLOWED:
          "This instance only accepts WhatsApp numbers from Ecuador.",
        ERR_WAPP_IMPORT_CONTACTS:
          "Could not import contacts from the phone. Check that WhatsApp is connected.",
        ERR_NO_USER_FOUND: "No user found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_CREATING_MESSAGE: "Error while creating message on database.",
        ERR_CREATING_TICKET: "Error while creating message on database.",
        ERR_FETCH_WAPP_MSG:
          "Error fetching the message in WhtasApp, maybe it is too old.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "This color is already in use, pick another one.",
        ERR_WAPP_GREETING_REQUIRED:
          "Greeting message is required if there is more than one queue.",
      },
    },
  },
};

export { messages };
