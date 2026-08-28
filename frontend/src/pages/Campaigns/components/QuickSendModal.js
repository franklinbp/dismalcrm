import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  makeStyles
} from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import { i18n } from "../../../translate/i18n";

const useStyles = makeStyles(theme => ({
  helper: {
    color: theme.palette.text.secondary,
    fontSize: 12
  }
}));

const COUNTRY_OPTIONS = [
  { value: "", label: "Todos los paises" },
  { value: "EC", label: "Ecuador" },
];

const countryLabel = countryCode =>
  COUNTRY_OPTIONS.find(country => country.value === countryCode)?.label ||
  countryCode ||
  "-";

const emptyForm = {
  name: "",
  messageBody: "",
  senderMode: "SINGLE",
  senderId: "",
  ratePerMin: "",
  scheduleAt: ""
};

const QuickSendModal = ({ open, onClose, onSend, senders, clients }) => {
  const classes = useStyles();
  const [form, setForm] = useState(emptyForm);
  const [selectedClients, setSelectedClients] = useState({});
  const [searchParam, setSearchParam] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setSelectedClients({});
      setSearchParam("");
      setCountryCode("");
      setAttachment(null);
    }
  }, [open]);

  const filteredClients = useMemo(() => {
    return (clients || []).filter(client => {
      const text = `${client.name || ""} ${client.tradeName || ""} ${client.phoneE164 || ""}`.toLowerCase();
      const matchesSearch = text.includes(searchParam.toLowerCase());
      const matchesCountry = !countryCode || client.countryCode === countryCode;
      return matchesSearch && matchesCountry;
    });
  }, [clients, searchParam, countryCode]);

  const selectedCount = Object.values(selectedClients).filter(Boolean).length;
  const filteredSelectedCount = filteredClients.filter(client => Boolean(selectedClients[client.id])).length;
  const allFilteredSelected = filteredClients.length > 0 && filteredSelectedCount === filteredClients.length;
  const someFilteredSelected = filteredSelectedCount > 0 && !allFilteredSelected;

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleClient = client => {
    setSelectedClients(prev => ({
      ...prev,
      [client.id]: prev[client.id] ? undefined : client
    }));
  };

  const toggleFilteredClients = () => {
    setSelectedClients(prev => {
      const next = { ...prev };
      filteredClients.forEach(client => {
        next[client.id] = allFilteredSelected ? undefined : client;
      });
      return next;
    });
  };

  const handleSubmit = () => {
    onSend({
      name: form.name,
      messageBody: form.messageBody,
      senderMode: form.senderMode,
      senderId: form.senderId ? Number(form.senderId) : null,
      ratePerMin: form.ratePerMin ? Number(form.ratePerMin) : null,
      scheduleAt: form.scheduleAt ? new Date(form.scheduleAt) : null,
      recipients: Object.values(selectedClients)
        .filter(Boolean)
        .map(client => ({
          phoneE164: client.phoneE164,
          name: client.tradeName || client.name
        })),
      attachment
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{i18n.t("campaigns.quickSend.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" className={classes.helper}>
          {i18n.t("campaigns.quickSend.description")}
        </Typography>
        <TextField fullWidth margin="dense" label={i18n.t("campaigns.fields.name")} name="name" value={form.name} onChange={handleChange} helperText={i18n.t("campaigns.quickSend.nameHelp")} />
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="dense"
          label={i18n.t("campaigns.fields.messageBody")}
          name="messageBody"
          value={form.messageBody}
          onChange={handleChange}
          helperText={i18n.t("campaigns.fields.messageHelp")}
        />
        <TextField select fullWidth margin="dense" label={i18n.t("campaigns.fields.senderMode")} name="senderMode" value={form.senderMode} onChange={handleChange}>
          <MenuItem value="SINGLE">{i18n.t("campaigns.senderModes.single")}</MenuItem>
          <MenuItem value="ROUND_ROBIN">{i18n.t("campaigns.senderModes.roundRobin")}</MenuItem>
        </TextField>
        {form.senderMode === "SINGLE" && (
          <TextField select fullWidth margin="dense" label={i18n.t("campaigns.fields.sender")} name="senderId" value={form.senderId} onChange={handleChange}>
            {senders.map(sender => (
              <MenuItem key={sender.id} value={sender.id}>
                {sender.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField fullWidth margin="dense" label={i18n.t("campaigns.fields.ratePerMin")} name="ratePerMin" value={form.ratePerMin} onChange={handleChange} type="number" />
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaigns.fields.scheduleAt")}
          name="scheduleAt"
          value={form.scheduleAt}
          onChange={handleChange}
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
        />

        <div style={{ marginTop: 8 }}>
          <input
            id="quick-send-attachment"
            type="file"
            style={{ display: "none" }}
            onChange={event => setAttachment((event.target.files || [])[0] || null)}
          />
          <label htmlFor="quick-send-attachment">
            <Button component="span" variant="outlined" startIcon={<AttachFile />}>
              {i18n.t("campaigns.quickSend.attachment")}
            </Button>
          </label>
          <div className={classes.helper}>
            {attachment ? attachment.name : i18n.t("campaigns.fields.attachmentsEmpty")}
          </div>
        </div>

        <TextField fullWidth margin="dense" label={i18n.t("campaigns.recipients.search")} value={searchParam} onChange={event => setSearchParam(event.target.value)} />
        <TextField
          select
          fullWidth
          margin="dense"
          label="Pais"
          value={countryCode}
          onChange={event => {
            setCountryCode(event.target.value);
            setSelectedClients({});
          }}
        >
          {COUNTRY_OPTIONS.map(country => (
            <MenuItem key={country.value || "all"} value={country.value}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={allFilteredSelected}
                  indeterminate={someFilteredSelected}
                  onChange={toggleFilteredClients}
                />
                {i18n.t("campaigns.recipients.select")}
              </TableCell>
              <TableCell>{i18n.t("campaigns.recipients.name")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.phone")}</TableCell>
              <TableCell>Pais</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.email")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id} hover>
                <TableCell>
                  <Checkbox checked={Boolean(selectedClients[client.id])} onChange={() => toggleClient(client)} />
                </TableCell>
                <TableCell>{client.tradeName || client.name}</TableCell>
                <TableCell>{client.phoneE164}</TableCell>
                <TableCell>{countryLabel(client.countryCode)}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={classes.helper}>
          {i18n.t("campaigns.quickSend.selectedCount", { count: selectedCount })}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("campaigns.modal.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("campaigns.quickSend.sendNow")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickSendModal;
