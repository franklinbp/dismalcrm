import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import EventIcon from "@material-ui/icons/Event";
import SendIcon from "@material-ui/icons/Send";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { getSalesUrl } from "../../config";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles(theme => ({
  page: {
    padding: theme.spacing(2),
    overflowY: "auto"
  },
  kpi: {
    padding: theme.spacing(2),
    minHeight: 96
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700
  },
  panel: {
    padding: theme.spacing(2),
    height: "100%"
  },
  leadRow: {
    padding: theme.spacing(1.4),
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    }
  },
  leadRowActive: {
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(110, 168, 254, 0.14)"
        : "rgba(37, 99, 235, 0.08)"
  },
  leadRowSelected: {
    boxShadow: "inset 3px 0 0 #0b2f4f",
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(14, 165, 233, 0.1)"
        : "rgba(14, 165, 233, 0.08)"
  },
  leadRowBody: {
    flex: 1,
    minWidth: 0
  },
  list: {
    maxHeight: 530,
    overflowY: "auto"
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr"
    }
  },
  metaLine: {
    color: theme.palette.text.secondary,
    fontSize: 12
  },
  stageBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2)
  },
  task: {
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    marginBottom: theme.spacing(1)
  },
  campaignBox: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  followUpPanel: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: "1px solid rgba(15, 47, 79, 0.18)"
  },
  followUpDropZone: {
    minHeight: 128,
    borderRadius: 12,
    padding: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(255,255,255,0.03)" : "#f8fafc"
  },
  followUpDropZoneActive: {
    borderColor: "#0b2f4f",
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(14, 165, 233, 0.12)"
        : "rgba(14, 165, 233, 0.08)"
  },
  selectionActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  selectedLeadChip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  },
  messagePreview: {
    padding: theme.spacing(1.5),
    borderRadius: 8,
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
    border: "1px solid rgba(16, 185, 129, 0.24)"
  },
  botFlow: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark" ? "rgba(255,255,255,0.03)" : "#f8fafc"
  },
  botStep: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1)
  },
  botStepIndex: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    backgroundColor: "#0b2f4f",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0
  }
}));

const statusLabels = {
  NEW: "Nuevo",
  QUOTED: "Cotizado",
  FOLLOW_UP: "Seguimiento",
  WON: "Ganado",
  LOST: "Perdido",
  NO_RESPONSE: "No responde"
};

const customerLabels = {
  UNKNOWN: "Sin clasificar",
  FINAL: "Cliente final",
  WHOLESALE: "Mayorista"
};

const channelLabels = {
  whatsapp: "WhatsApp",
  facebook: "Messenger",
  instagram: "Instagram"
};

const getStatusColor = status => {
  if (status === "WON") return "primary";
  if (status === "FOLLOW_UP") return "secondary";
  return "default";
};

const botFlowSteps = [
  "Detectar interes del mensaje",
  "Responder menu o plantilla",
  "Etiquetar cliente",
  "Crear seguimiento",
  "Derivar a venta"
];

const formatDate = value => {
  if (!value) return "Sin programar";
  try {
    return format(parseISO(value), "dd/MM HH:mm");
  } catch {
    return "Sin programar";
  }
};

const normalizeCustomerType = customerType =>
  customerType === "WHOLESALE" ? "DISTRIBUTOR" : "FINAL";

const defaultFollowUpMessage =
  "Hola {nombre}, buen dia.\n\nTe contacto para dar seguimiento a tu consulta por Facebook/Meta. Tenemos licencias digitales con entrega inmediata y soporte de activacion.\n\nDeseas que te envie opciones y precios actualizados?";

const CommercialCenter = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [leads, setLeads] = useState([]);
  const [senders, setSenders] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState({});
  const [draggingLeadId, setDraggingLeadId] = useState(null);
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncInfo, setSyncInfo] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [taskTitle, setTaskTitle] = useState("Enviar catalogo de cierre");
  const [taskDate, setTaskDate] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("");
  const [followUpForm, setFollowUpForm] = useState({
    name: "Seguimiento Meta Ads",
    messageBody: defaultFollowUpMessage,
    senderMode: "SINGLE",
    senderId: "",
    ratePerMin: "12",
    scheduleAt: ""
  });

  const selectedLead = useMemo(
    () => leads.find(lead => lead.id === selectedLeadId) || leads[0],
    [leads, selectedLeadId]
  );
  const selectedFollowUpLeads = useMemo(
    () => leads.filter(lead => Boolean(selectedLeadIds[lead.id])),
    [leads, selectedLeadIds]
  );

  const selectedFollowUpCount = selectedFollowUpLeads.length;

  const isMetaLead = lead => {
    const text = `${lead.channel || ""} ${lead.origin || ""} ${lead.interest || ""}`.toLowerCase();
    return (
      text.includes("facebook") ||
      text.includes("meta") ||
      text.includes("instagram") ||
      text.includes("solicitud en fa")
    );
  };

  const fetchLeads = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/commercial/leads", {
        params: {
          searchParam,
          status: statusFilter,
          customerType: customerTypeFilter
        }
      });
      setLeads(data.leads || []);
      setStats(data.stats || {});
      setSyncInfo(data.sync || null);
      const leadIdFromUrl = new URLSearchParams(location.search).get("leadId");
      const requestedLead = leadIdFromUrl ? Number(leadIdFromUrl) : null;

      if (requestedLead && data.leads?.some(lead => lead.id === requestedLead)) {
        setSelectedLeadId(requestedLead);
      } else if (!selectedLeadId && data.leads?.length) {
        setSelectedLeadId(data.leads[0].id);
      }
    } catch (err) {
      setLoadError("No se pudo cargar el Centro Comercial. Revisa logs del backend.");
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [location.search, searchParam, statusFilter, customerTypeFilter]);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const { data } = await api.get("/senders");
        const nextSenders = data || [];
        setSenders(nextSenders);
        setFollowUpForm(prev => {
          if (prev.senderId || !nextSenders.length) return prev;
          const preferredSender =
            nextSenders.find(sender => sender.status === "online") || nextSenders[0];
          return { ...prev, senderId: String(preferredSender.id) };
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchSenders();
  }, []);

  const toggleLeadForFollowUp = (leadId, event) => {
    if (event) {
      event.stopPropagation();
    }

    setSelectedLeadIds(prev => ({
      ...prev,
      [leadId]: prev[leadId] ? undefined : true
    }));
  };

  const selectLeadsForFollowUp = predicate => {
    setSelectedLeadIds(prev => {
      const next = { ...prev };
      leads.filter(predicate).forEach(lead => {
        next[lead.id] = true;
      });
      return next;
    });
  };

  const removeLeadFromFollowUp = leadId => {
    setSelectedLeadIds(prev => ({ ...prev, [leadId]: undefined }));
  };

  const clearFollowUpSelection = () => {
    setSelectedLeadIds({});
  };

  const handleDropFollowUpLead = event => {
    event.preventDefault();
    if (!draggingLeadId) return;

    setSelectedLeadIds(prev => ({
      ...prev,
      [draggingLeadId]: true
    }));
    setDraggingLeadId(null);
  };

  const handleFollowUpFormChange = event => {
    const { name, value } = event.target;
    setFollowUpForm(prev => ({ ...prev, [name]: value }));
  };

  const createFollowUpCampaign = async () => {
    if (!selectedFollowUpCount) {
      toast.error("Selecciona o arrastra leads para seguimiento.");
      return;
    }

    if (!followUpForm.messageBody.trim()) {
      toast.error("Escribe el mensaje de seguimiento.");
      return;
    }

    if (followUpForm.senderMode === "SINGLE" && !followUpForm.senderId) {
      toast.error("Selecciona el remitente de WhatsApp.");
      return;
    }

    setSendingFollowUp(true);
    try {
      const { data } = await api.post("/commercial/leads/follow-up-campaign", {
        leadIds: selectedFollowUpLeads.map(lead => lead.id),
        name: followUpForm.name,
        messageBody: followUpForm.messageBody,
        senderMode: followUpForm.senderMode,
        senderId: followUpForm.senderId ? Number(followUpForm.senderId) : null,
        ratePerMin: followUpForm.ratePerMin ? Number(followUpForm.ratePerMin) : null,
        scheduleAt: followUpForm.scheduleAt || null,
        markReady: true
      });

      toast.success(
        `Campana creada con ${data.recipientsImported || 0} destinatarios.`
      );
      clearFollowUpSelection();
      await fetchLeads();
      if (data.campaign?.id) {
        history.push(`/campaigns/${data.campaign.id}`);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSendingFollowUp(false);
    }
  };

  const updateLead = async payload => {
    if (!selectedLead) return;

    try {
      const { data } = await api.put(`/commercial/leads/${selectedLead.id}`, payload);
      setLeads(prev => prev.map(lead => (lead.id === data.id ? data : lead)));
      toast.success("Lead actualizado.");
    } catch (err) {
      toastError(err);
    }
  };

  const createTask = async () => {
    if (!selectedLead || !taskTitle) return;

    try {
      await api.post(`/commercial/leads/${selectedLead.id}/tasks`, {
        title: taskTitle,
        dueAt: taskDate || null,
        priority: "normal"
      });
      toast.success("Seguimiento programado.");
      await fetchLeads();
    } catch (err) {
      toastError(err);
    }
  };

  const scheduleCatalogFollowUp = async () => {
    if (!selectedLead) return;

    try {
      await api.post(`/commercial/leads/${selectedLead.id}/tasks`, {
        title: "Enviar catalogo y dar seguimiento",
        dueAt: taskDate || null,
        priority: "normal",
        notes: "Tarea creada desde Centro Comercial para evitar envios repetidos."
      });
      toast.success("Catalogo agregado como seguimiento.");
      await fetchLeads();
    } catch (err) {
      toastError(err);
    }
  };

  const openSale = () => {
    if (!selectedLead) return;

    const salesUrl = getSalesUrl();
    if (!salesUrl) {
      toast.info("El sistema de ventas de Dismal aun no esta configurado.");
      return;
    }

    const params = new URLSearchParams();
    params.set("intent", "crm-sale");
    params.set("crmLeadId", String(selectedLead.id));
    params.set("name", selectedLead.contact?.name || "");
    params.set("phone", selectedLead.contact?.number || "");
    params.set("email", selectedLead.contact?.email || "");
    params.set("interest", selectedLead.interest || "");
    params.set(
      "customerType",
      normalizeCustomerType(selectedLead.customerType)
    );
    if (selectedLead.estimatedValue) {
      params.set("estimatedValue", String(selectedLead.estimatedValue));
    }

    window.open(`${salesUrl}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Centro Comercial Omnicanal</Title>
      </MainHeader>
      <Box className={classes.page}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper className={classes.kpi} variant="outlined">
              <Typography variant="caption">Leads de hoy</Typography>
              <Typography className={classes.kpiValue}>{stats.today || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper className={classes.kpi} variant="outlined">
              <Typography variant="caption">En seguimiento</Typography>
              <Typography className={classes.kpiValue}>{stats.followUp || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper className={classes.kpi} variant="outlined">
              <Typography variant="caption">Mayoristas activos</Typography>
              <Typography className={classes.kpiValue}>{stats.wholesale || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper className={classes.kpi} variant="outlined">
              <Typography variant="caption">Tareas de hoy</Typography>
              <Typography className={classes.kpiValue}>{stats.tasksToday || 0}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper className={classes.followUpPanel} variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Seguimiento Meta y cierre</Typography>
              <Typography color="textSecondary">
                Arrastra aqui los leads consultados por Facebook/Meta o seleccionalos
                desde la bandeja.
              </Typography>
              <Box
                mt={2}
                className={`${classes.followUpDropZone} ${
                  draggingLeadId ? classes.followUpDropZoneActive : ""
                }`}
                onDragOver={event => event.preventDefault()}
                onDrop={handleDropFollowUpLead}
              >
                <Typography variant="subtitle2">
                  Leads agrupados: {selectedFollowUpCount}
                </Typography>
                <Box mt={1}>
                  {selectedFollowUpLeads.map(lead => (
                    <Chip
                      key={lead.id}
                      size="small"
                      className={classes.selectedLeadChip}
                      label={lead.contact?.name || lead.contact?.number || "Cliente"}
                      onDelete={() => removeLeadFromFollowUp(lead.id)}
                    />
                  ))}
                  {!selectedFollowUpLeads.length && (
                    <Typography color="textSecondary" variant="body2">
                      Sin leads seleccionados.
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box className={classes.selectionActions}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    selectLeadsForFollowUp(
                      lead => lead.status === "NEW" && isMetaLead(lead)
                    )
                  }
                >
                  Meta nuevos
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    selectLeadsForFollowUp(lead => lead.status === "QUOTED")
                  }
                >
                  Cotizados
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    selectLeadsForFollowUp(lead => lead.customerType === "WHOLESALE")
                  }
                >
                  Mayoristas
                </Button>
                <Button size="small" onClick={clearFollowUpSelection}>
                  Limpiar
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                margin="dense"
                variant="outlined"
                label="Nombre de campana"
                name="name"
                value={followUpForm.name}
                onChange={handleFollowUpFormChange}
              />
              <TextField
                fullWidth
                multiline
                rows={7}
                margin="dense"
                variant="outlined"
                label="Mensaje de seguimiento"
                name="messageBody"
                value={followUpForm.messageBody}
                onChange={handleFollowUpFormChange}
                helperText="Puedes usar {nombre}. El envio se realiza con el motor de campanas."
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                margin="dense"
                variant="outlined"
                label="Modo de envio"
                name="senderMode"
                value={followUpForm.senderMode}
                onChange={handleFollowUpFormChange}
              >
                <MenuItem value="SINGLE">Un solo remitente</MenuItem>
                <MenuItem value="ROUND_ROBIN">Rotar remitentes disponibles</MenuItem>
              </TextField>
              {followUpForm.senderMode === "SINGLE" && (
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="WhatsApp remitente"
                  name="senderId"
                  value={followUpForm.senderId}
                  onChange={handleFollowUpFormChange}
                >
                  {senders.map(sender => (
                    <MenuItem key={sender.id} value={String(sender.id)}>
                      {sender.name} - {sender.status}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                fullWidth
                margin="dense"
                variant="outlined"
                label="Mensajes por minuto"
                name="ratePerMin"
                type="number"
                value={followUpForm.ratePerMin}
                onChange={handleFollowUpFormChange}
              />
              <TextField
                fullWidth
                margin="dense"
                variant="outlined"
                label="Programar envio"
                name="scheduleAt"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={followUpForm.scheduleAt}
                onChange={handleFollowUpFormChange}
              />
              <Box className={classes.messagePreview} mt={1.5}>
                <Typography variant="subtitle2">Vista previa</Typography>
                <Typography variant="body2" style={{ whiteSpace: "pre-line", marginTop: 8 }}>
                  {followUpForm.messageBody.replace(
                    "{nombre}",
                    selectedFollowUpLeads[0]?.contact?.name || "Cliente"
                  )}
                </Typography>
              </Box>
              <Button
                fullWidth
                color="primary"
                variant="contained"
                startIcon={<SendIcon />}
                style={{ marginTop: 12 }}
                disabled={sendingFollowUp || !selectedFollowUpCount}
                onClick={createFollowUpCampaign}
              >
                {sendingFollowUp ? "Creando campana..." : "Crear y enviar seguimiento"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper className={classes.panel} variant="outlined">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Bandeja de oportunidades</Typography>
                <Button size="small" onClick={fetchLeads} disabled={loading}>
                  Actualizar
                </Button>
              </Box>
              {syncInfo && (
                <Typography className={classes.metaLine}>
                  Tickets revisados: {syncInfo.scannedTickets || 0} · Nuevos:{" "}
                  {syncInfo.createdLeads || 0} · Existentes:{" "}
                  {syncInfo.existingLeads || 0} · Omitidos:{" "}
                  {syncInfo.skippedTickets || 0}
                </Typography>
              )}
              <Box className={classes.filters}>
                <TextField
                  size="small"
                  variant="outlined"
                  label="Buscar lead"
                  value={searchParam}
                  onChange={e => setSearchParam(e.target.value)}
                />
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  label="Estado"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  label="Cliente"
                  value={customerTypeFilter}
                  onChange={e => setCustomerTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(customerLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {loadError && (
                <Box mt={1} mb={1}>
                  <Typography color="error" variant="body2">
                    {loadError}
                  </Typography>
                </Box>
              )}
              <Box className={classes.list}>
                {leads.map(lead => (
                  <Box
                    key={lead.id}
                    className={`${classes.leadRow} ${
                      selectedLead?.id === lead.id ? classes.leadRowActive : ""
                    } ${
                      selectedLeadIds[lead.id] ? classes.leadRowSelected : ""
                    }`}
                    draggable
                    onDragStart={() => setDraggingLeadId(lead.id)}
                    onDragEnd={() => setDraggingLeadId(null)}
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <Box display="flex" alignItems="flex-start">
                      <Checkbox
                        size="small"
                        checked={Boolean(selectedLeadIds[lead.id])}
                        onClick={event => event.stopPropagation()}
                        onChange={event => toggleLeadForFollowUp(lead.id, event)}
                      />
                      <Box className={classes.leadRowBody}>
                        <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2">
                        {lead.contact?.name || "Cliente sin nombre"}
                      </Typography>
                      <Chip
                        size="small"
                        label={statusLabels[lead.status] || lead.status}
                        color={getStatusColor(lead.status)}
                      />
                    </Box>
                    <Typography className={classes.metaLine}>
                      {channelLabels[lead.channel] || lead.channel} · {lead.origin}
                    </Typography>
                    <Typography className={classes.metaLine}>
                      {customerLabels[lead.customerType]} · {formatDate(lead.nextActionAt)}
                    </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                {!leads.length && (
                  <Box p={2}>
                    <Typography color="textSecondary">
                      Aun no hay oportunidades comerciales.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className={classes.panel} variant="outlined">
              <Typography variant="h6">Ficha comercial</Typography>
              {selectedLead ? (
                <>
                  <Box mt={2}>
                    <Typography variant="h5">
                      {selectedLead.contact?.name || "Cliente"}
                    </Typography>
                    <Typography className={classes.metaLine}>
                      {selectedLead.contact?.number} · {selectedLead.contact?.email}
                    </Typography>
                  </Box>

                  <Box className={classes.stageBar}>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <Chip
                        key={value}
                        size="small"
                        clickable
                        color={
                          selectedLead.status === value
                            ? getStatusColor(value)
                            : "default"
                        }
                        variant={selectedLead.status === value ? "default" : "outlined"}
                        label={label}
                        onClick={() => updateLead({ status: value })}
                      />
                    ))}
                  </Box>

                  <Box mt={2}>
                    <TextField
                      select
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      label="Estado comercial"
                      value={selectedLead.status || "NEW"}
                      onChange={e => updateLead({ status: e.target.value })}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      label="Tipo de cliente"
                      value={selectedLead.customerType || "UNKNOWN"}
                      onChange={e => updateLead({ customerType: e.target.value })}
                    >
                      {Object.entries(customerLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      label="Interes"
                      value={selectedLead.interest || ""}
                      onChange={e =>
                        setLeads(prev =>
                          prev.map(lead =>
                            lead.id === selectedLead.id
                              ? { ...lead, interest: e.target.value }
                              : lead
                          )
                        )
                      }
                      onBlur={e => updateLead({ interest: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      label="Valor estimado"
                      type="number"
                      value={selectedLead.estimatedValue || ""}
                      onChange={e =>
                        setLeads(prev =>
                          prev.map(lead =>
                            lead.id === selectedLead.id
                              ? { ...lead, estimatedValue: e.target.value }
                              : lead
                          )
                        )
                      }
                      onBlur={e => updateLead({ estimatedValue: Number(e.target.value) })}
                    />
                  </Box>

                  <Box className={classes.actions}>
                    {getSalesUrl() ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCartIcon />}
                        onClick={openSale}
                      >
                        Crear venta
                      </Button>
                    ) : null}
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EventIcon />}
                      onClick={createTask}
                    >
                      Programar
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={scheduleCatalogFollowUp}
                    >
                      Enviar catalogo
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ color: "#059669", borderColor: "#059669" }}
                      startIcon={<TrendingUpIcon />}
                      onClick={() => updateLead({ status: "WON" })}
                    >
                      Ganado
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography color="textSecondary">Selecciona un lead.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className={classes.panel} variant="outlined">
              <Typography variant="h6">Seguimientos y tareas</Typography>
              <Box mt={2}>
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Nueva tarea"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  label="Fecha y hora"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={createTask}
                >
                  Nueva tarea
                </Button>
              </Box>
              <Box mt={2}>
                {(selectedLead?.tasks || []).map(task => (
                  <Box key={task.id} className={classes.task}>
                    <Box display="flex" alignItems="center">
                      <AssignmentTurnedInIcon fontSize="small" color="primary" />
                      <Box ml={1}>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography className={classes.metaLine}>
                          {formatDate(task.dueAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                {selectedLead && !selectedLead.tasks?.length && (
                  <Typography color="textSecondary">Sin tareas pendientes.</Typography>
                )}
              </Box>
              <Box className={classes.botFlow}>
                <Box display="flex" alignItems="center">
                  <AccountTreeIcon color="primary" fontSize="small" />
                  <Box ml={1}>
                    <Typography variant="subtitle2">Flujo sugerido del bot</Typography>
                    <Typography className={classes.metaLine}>
                      Guia operativa antes de automatizar respuestas.
                    </Typography>
                  </Box>
                </Box>
                {botFlowSteps.map((step, index) => (
                  <Box key={step} className={classes.botStep}>
                    <span className={classes.botStepIndex}>{index + 1}</span>
                    <Typography variant="body2">{step}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper className={classes.campaignBox} variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Envio de catalogo al final del dia</Typography>
              <Typography color="textSecondary">
                Segmenta antes de enviar para no saturar WhatsApp ni repetir mensajes.
              </Typography>
              <Box mt={2}>
                <Chip label="Leads nuevos" color="primary" style={{ marginRight: 8 }} />
                <Chip label="Cotizados sin compra" style={{ marginRight: 8 }} />
                <Chip label="Mayoristas" style={{ marginRight: 8 }} />
                <Chip label="Clientes finales" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                label="Mensaje a enviar"
                defaultValue={
                  "Hola {nombre},\n\nTe compartimos nuestro catalogo de productos y precios actualizados. Contamos con licencias originales, entrega inmediata y soporte tecnico.\n\n¿En que podemos ayudarte hoy?"
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className={classes.messagePreview}>
                <Typography variant="subtitle2">Vista previa WhatsApp</Typography>
                <Typography variant="body2" style={{ whiteSpace: "pre-line", marginTop: 8 }}>
                  Hola Franklin,{"\n\n"}Te compartimos nuestro catalogo de productos y precios
                  actualizados. Contamos con licencias originales, entrega inmediata y soporte
                  tecnico.
                </Typography>
              </Box>
              <Button
                fullWidth
                color="primary"
                variant="contained"
                startIcon={<SendIcon />}
                style={{ marginTop: 12 }}
                onClick={scheduleCatalogFollowUp}
              >
                Programar seguimiento
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MainContainer>
  );
};

export default CommercialCenter;
