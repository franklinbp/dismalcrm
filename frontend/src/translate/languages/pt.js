const messages = {
  pt: {
    translations: {
      signup: {
        title: "Cadastre-se",
        toasts: {
          success: "Usuario criado com sucesso! Fa?a seu login!",
          fail: "Erro ao criar usuario. Verifique os dados informados.",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
        },
        buttons: {
          submit: "Cadastrar",
          login: "Ja tem uma conta? Entre!",
        },
      },
      login: {
        title: "Login",
        form: {
          email: "Email",
          password: "Senha",
        },
        buttons: {
          submit: "Entrar",
          register: "Nao tem um conta? Cadastre-se!",
        },
      },
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Mensagens hoje: ",
          },
        },
        messages: {
          inAttendance: {
            title: "Em Atendimento"
          },
          waiting: {
            title: "Aguardando"
          },
          closed: {
            title: "Finalizado"
          }
        }
      },
      connections: {
        title: "Conexoes",
        toasts: {
          deleted: "Conexao com o WhatsApp excluida com sucesso!",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteMessage: "Voce tem certeza? Essa acao nao pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "Tem certeza? Voce precisara ler o QR Code novamente.",
        },
        buttons: {
          add: "Adicionar WhatsApp",
          disconnect: "Desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "Falha ao iniciar sessao do WhatsApp",
            content:
              "Certifique-se de que seu celular esteja conectado a internet e tente novamente, ou solicite um novo QR Code",
          },
          qrcode: {
            title: "Esperando leitura do QR Code",
            content:
              "Clique no botao 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessao",
          },
          connected: {
            title: "Conexao estabelecida!",
          },
          timeout: {
            title: "A conexao com o celular foi perdida",
            content:
              "Certifique-se de que seu celular esteja conectado a internet e o WhatsApp esteja aberto, ou clique no botao 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          name: "Nome",
          status: "Status",
          lastUpdate: "Ultima atualizacao",
          default: "Padrao",
          actions: "Acoes",
          session: "Sessao",
        },
      },
      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nome",
          default: "Padrao",
          farewellMessage: "Mensagem de despedida"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
      },
      qrCode: {
        message: "Leia o QrCode para iniciar a sessao",
      },
      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluido com sucesso!",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Deletar",
          importTitlte: "Importar contatos",
          deleteMessage:
            "Tem certeza que deseja deletar este contato? Todas as mensagens relacionadas serao perdidas.",
          importMessage: "Deseja importar contatos com conversas visiveis no WhatsApp?",
        },
        buttons: {
          import: "Importar Contatos",
          add: "Adicionar Contato",
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Acoes",
        },
      },
      contactModal: {
        title: {
          add: "Adicionar contato",
          edit: "Editar contato",
        },
        form: {
          mainInfo: "Dados do contato",
          extraInfo: "Informacoes adicionais",
          name: "Nome",
          number: "Numero do Whatsapp",
          email: "Email",
          extraName: "Nome do campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Adicionar informacao",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Contato salvo com sucesso.",
      },
      quickAnswersModal: {
        title: {
          add: "Adicionar Resposta Rapida",
          edit: "Editar Resposta Rapida",
        },
        form: {
          shortcut: "Atalho",
          message: "Resposta Rapida",
          media: "Anexar arquivo",
          removeMedia: "Remover arquivo",
        },
        errors: {
          required: "Mensagem ou arquivo e obrigatorio.",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Resposta Rapida salva com sucesso.",
      },
      queueModal: {
        title: {
          add: "Adicionar fila",
          edit: "Editar fila",
        },
        form: {
          name: "Nome",
          color: "Cor",
          greetingMessage: "Mensagem de saudacao",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
      },
      userModal: {
        title: {
          add: "Adicionar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
          profile: "Perfil",
          whatsapp: "Conexao Padrao",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Usuario salvo com sucesso.",
      },
      chat: {
        noTicketMessage: "Selecione um mensagem para comecar a conversar.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Novo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Filas",
      },
      tickets: {
        toasts: {
          deleted: "A mensagem que voce estava foi deletada.",
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar mensagens",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Mensagem",
        fieldLabel: "Digite para buscar usuarios",
        fieldQueueLabel: "Transferir para fila",
        fieldConnectionLabel: "Transferir para conexao",
        fieldQueuePlaceholder: "Selecione uma fila",
        fieldConnectionPlaceholder: "Selecione uma conexao",
        noOptions: "Nenhum usuario encontrado com esse nome",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage:
          "Nenhuma mensagem encontrada com esse status ou termo pesquisado",
        connectionTitle: "Conexao que esta sendo utilizada atualmente.",
        buttons: {
          accept: "Aceitar",
        },
      },
      newTicketModal: {
        title: "Nova Mensagem",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexoes",
          tickets: "Mensagens",
          contacts: "Contatos",
          quickAnswers: "Respostas Rapidas",
          campaigns: "Campanhas em massa",
          campaignClients: "Clientes",
          queues: "Filas",
          administration: "Administracao",
          users: "Usuarios",
          settings: "Configuracoes",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Sair",
          },
        },
      },
      notifications: {
        noTickets: "Nenhuma notificacao.",
      },
      queues: {
        title: "Filas",
        table: {
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudacao",
          actions: "Acoes",
        },
        buttons: {
          add: "Adicionar fila",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Voce tem certeza? Essa acao nao pode ser revertida! As mensagens dessa fila continuarao existindo, mas nao terao mais nenhuma fila atribuida.",
        },
      },
      queueSelect: {
        inputLabel: "Filas",
      },
      quickAnswers: {
        title: "Respostas Rapidas",
        table: {
          shortcut: "Atalho",
          message: "Resposta Rapida",
          media: "Arquivo",
          actions: "Acoes",
        },
        buttons: {
          add: "Adicionar Resposta Rapida",
        },
        toasts: {
          deleted: "Resposta Rapida excluida com sucesso.",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle:
            "Voce tem certeza que quer excluir esta Resposta Rapida: ",
          deleteMessage: "Esta acao nao pode ser revertida.",
        },
        mediaLabel: "[Anexo]",
      },
      campaigns: {
        title: "Campanhas",
        table: {
          name: "Nome",
          status: "Status",
          senderMode: "Modo de envio",
          createdAt: "Criado em",
          actions: "Acoes",
        },
        buttons: {
          new: "Nova campanha",
          quickSend: "Envio rapido",
          open: "Abrir",
          edit: "Editar",
          duplicate: "Duplicar",
          delete: "Excluir",
          ready: "Enviar campanha",
          cancel: "Cancelar",
          back: "Voltar",
          save: "Salvar rascunho",
        },
        fields: {
          name: "Nome",
          messageBody: "Mensagem",
          messageHelp: "Use variaveis como {{name}} e {{phone}}.",
          senderMode: "Modo de envio",
          sender: "Remetente",
          ratePerMin: "Taxa por min",
          estimatedSend: "Estimado {{minutes}} min para {{count}} destinatarios",
          estimatedSendEmpty: "Defina a taxa para estimar o tempo",
          scheduleAt: "Agendar",
          attachmentsEmpty: "Anexos opcionais (envio requer backend)",
          attachmentsSelected: "{{count}} anexo(s) selecionado(s)",
        },
        senderModes: {
          single: "Remetente unico",
          roundRobin: "Rotacao",
        },
        modal: {
          createTitle: "Criar campanha",
          editTitle: "Editar campanha",
          save: "Salvar",
          cancel: "Cancelar",
        },
        recipients: {
          title: "Destinatarios",
          fromContacts: "Adicionar dos contatos",
          fromClients: "Adicionar de clientes",
          importCsv: "Importar CSV ({{count}})",
          imported: "Destinatarios importados",
          selectContacts: "Selecionar contatos",
          selectClients: "Selecionar clientes",
          search: "Buscar",
          loadMore: "Carregar mais",
          import: "Importar",
          select: "Selecionar",
          name: "Nome",
          phone: "Telefone",
          email: "Email",
          status: "Status",
          count: "{{count}} destinatarios",
          manualName: "Nome",
          manualPhone: "Telefone (E.164)",
          manualPhoneHelp: "Exemplo: +5511999999999",
          manualAdd: "Adicionar manual",
          manualRequired: "Preencha nome e telefone",
        },
        preview: {
          title: "Preview",
          name: "Nome",
          phone: "Telefone",
          button: "Prever",
          rendered: "Mensagem renderizada",
        },
        metrics: {
          title: "Metricas",
          total: "Total",
          sent: "Enviados",
          failed: "Falharam",
          pending: "Pendentes",
          retrying: "Reenvios",
        },
        toasts: {
          created: "Campanha criada.",
          updated: "Campanha atualizada.",
          deleted: "Campanha excluida.",
          duplicated: "Campanha duplicada como rascunho.",
          ready: "Campanha READY.",
          canceled: "Campanha cancelada.",
          mediaUploaded: "Arquivo enviado para a campanha.",
        },
        confirmDelete: {
          title: "Excluir campanha",
          message: "Voce tem certeza? Isso vai remover a campanha e todos os destinatarios.",
        },
        quickSend: {
          title: "Envio rapido",
          description: "Envie agora (ou agende) uma mensagem em massa em um passo.",
          nameHelp: "Opcional. Se vazio, um nome sera gerado automaticamente.",
          attachment: "Anexar arquivo",
          selectedCount: "{{count}} cliente(s) selecionado(s)",
          sendNow: "Salvar e enviar",
          defaultName: "Campanha Rapida",
          success: "Envio rapido criado e enfileirado.",
          errors: {
            recipientsRequired: "Selecione ao menos um cliente.",
            messageRequired: "Preencha a mensagem.",
            senderRequired: "Selecione um remetente."
          }
        },
        calendar: {
          title: "Calendario de campanhas",
          dateLabel: "Data",
          upcomingCount: "{{count}} campanha(s) agendada(s) pendente(s)",
          empty: "Nao ha campanhas agendadas para esta data."
        }
      },
      campaignClients: {
        title: "Clientes",
        table: {
          name: "Nome",
          tradeName: "Nome comercial",
          phone: "Telefone",
          email: "Email",
          category: "Categoria",
          actions: "Acoes",
        },
        buttons: {
          new: "Novo cliente",
        },
        fields: {
          name: "Nome",
          tradeName: "Nome comercial",
          phone: "Telefone",
          phoneHelp: "Use formato E.164. Exemplo: +5511999999999",
          email: "Email",
          category: "Categoria",
        },
        modal: {
          title: "Cliente",
          save: "Salvar",
          cancel: "Cancelar",
        },
        toasts: {
          created: "Cliente criado com sucesso.",
          updated: "Cliente atualizado com sucesso.",
          deleted: "Cliente excluido com sucesso.",
        },
      },
      senders: {
        title: "Remetentes",
        table: {
          name: "Nome",
          phone: "Telefone",
          whatsapp: "WhatsApp",
          status: "Status",
          rate: "Taxa/min",
          actions: "Acoes",
        },
        fields: {
          name: "Nome",
          phone: "Telefone",
          whatsapp: "WhatsApp",
          status: "Status",
          ratePerMin: "Taxa por min",
        },
        status: {
          online: "Online",
          offline: "Offline",
        },
        buttons: {
          new: "Novo remetente",
        },
        modal: {
          title: "Criar remetente",
          save: "Salvar",
          cancel: "Cancelar",
        },
        toasts: {
          created: "Remetente criado.",
          updated: "Remetente atualizado.",
          deleted: "Remetente excluido.",
        },
      },
      users: {
        title: "Usuarios",
        table: {
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          whatsapp: "Conexao Padrao",
          actions: "Acoes",
        },
        buttons: {
          add: "Adicionar usuario",
        },
        toasts: {
          deleted: "Usuario excluido com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados do usuario serao perdidos. As mensagens abertas deste usuario serao movidas para a fila.",
        },
      },
      settings: {
        success: "Configuracoes salvas com sucesso.",
        title: "Configuracoes",
        settings: {
          userCreation: {
            name: "Criacao de usuario",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          autoReplyEnabled: {
            name: "Respostas automaticas do bot",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          autoReplyRules: {
            name: "Regras do bot",
            helper:
              "Uma regra por linha. Formato: palavra=>resposta. Exemplo: preco=>Ola {{name}}, nossos planos comecam em R$10.",
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Atribuido a:",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Digite uma mensagem ou tecle ''/'' para utilizar as respostas rapidas cadastrada",
        placeholderClosed:
          "Reabra ou aceite essa mensagem para enviar uma mensagem.",
        signMessage: "Assinar",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informacoes",
      },
      ticketOptionsMenu: {
        delete: "Deletar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Deletar a mensagem do contato",
          message:
            "Atencao! Todas as mensagens relacionadas a mensagem serao perdidas.",
        },
        buttons: {
          delete: "Excluir",
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
        delete: "Deletar",
        reply: "Responder",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta acao nao pode ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrao.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrao encontrado. Verifique a pagina de conexoes.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessao do WhatsApp nao foi inicializada. Verifique a pagina de conexoes.",
        ERR_WAPP_CHECK_CONTACT:
          "Nao foi possivel verificar o contato do WhatsApp. Verifique a pagina de conexoes",
        ERR_WAPP_INVALID_CONTACT: "Este nao e um numero de Whatsapp valido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Nao foi possivel baixar midia do WhatsApp. Verifique a pagina de conexoes.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticacao. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a pagina de conexoes.",
        ERR_DELETE_WAPP_MSG: "Nao foi possivel excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ja existe uma mensagem aberta para este contato.",
        ERR_SESSION_EXPIRED: "Sessao expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criacao do usuario foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Voce nao tem permissao para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Ja existe um contato com este numero.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuracao encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhuma mensagem encontrada com este ID.",
        ERR_WAPP_COMPANY_REQUIRED: "A conexao do WhatsApp nao esta vinculada a uma empresa.",
        ERR_WAPP_COMPANY_NOT_ASSIGNED:
          "A conexao do WhatsApp nao esta vinculada a uma empresa.",
        ERR_WAPP_CONNECTION_LIMIT:
          "O DismalCRM permite no maximo duas conexoes do WhatsApp.",
        ERR_WAPP_COUNTRY_NOT_ALLOWED:
          "Esta instancia aceita apenas numeros do WhatsApp do Equador.",
        ERR_WAPP_IMPORT_CONTACTS:
          "Nao foi possivel importar os contatos do telefone. Verifique se o WhatsApp esta conectado.",
        ERR_NO_USER_FOUND: "Nenhum usuario encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar mensagem no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhatsApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor ja esta em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudacao e obrigatorio quando ha mais de uma fila.",
      },
    },
  },
};

export { messages };
