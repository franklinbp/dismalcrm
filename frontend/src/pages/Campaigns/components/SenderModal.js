import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField
} from "@material-ui/core";
import { i18n } from "../../../translate/i18n";

const emptyForm = {
  name: "",
  phone: "",
  whatsappId: "",
  status: "offline",
  ratePerMin: ""
};

const SenderModal = ({ open, onClose, onSave, whatsapps, initialData }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      return;
    }

    if (initialData) {
      setForm({
        name: initialData.name || "",
        phone: initialData.phone || "",
        whatsappId: initialData.whatsappId || "",
        status: initialData.status || "offline",
        ratePerMin: initialData.ratePerMin || ""
      });
      return;
    }

    setForm(emptyForm);
  }, [initialData, open]);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({
      name: form.name,
      phone: form.phone,
      whatsappId: Number(form.whatsappId),
      status: form.status,
      ratePerMin: form.ratePerMin ? Number(form.ratePerMin) : null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{i18n.t("senders.modal.title")}</DialogTitle>
      <DialogContent>
        <TextField fullWidth margin="dense" label={i18n.t("senders.fields.name")} name="name" value={form.name} onChange={handleChange} />
        <TextField fullWidth margin="dense" label={i18n.t("senders.fields.phone")} name="phone" value={form.phone} onChange={handleChange} />
        <TextField select fullWidth margin="dense" label={i18n.t("senders.fields.whatsapp")} name="whatsappId" value={form.whatsappId} onChange={handleChange}>
          {whatsapps.map(whatsapp => (
            <MenuItem key={whatsapp.id} value={whatsapp.id}>
              {whatsapp.name || `WhatsApp ${whatsapp.id}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField select fullWidth margin="dense" label={i18n.t("senders.fields.status")} name="status" value={form.status} onChange={handleChange}>
          <MenuItem value="online">{i18n.t("senders.status.online")}</MenuItem>
          <MenuItem value="offline">{i18n.t("senders.status.offline")}</MenuItem>
        </TextField>
        <TextField fullWidth margin="dense" label={i18n.t("senders.fields.ratePerMin")} name="ratePerMin" value={form.ratePerMin} onChange={handleChange} type="number" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("senders.modal.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("senders.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SenderModal;
