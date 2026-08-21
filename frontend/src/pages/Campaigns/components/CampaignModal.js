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
  messageBody: "",
  senderMode: "SINGLE",
  senderId: "",
  ratePerMin: "",
  scheduleAt: ""
};

const CampaignModal = ({ open, onClose, onSave, senders, initialData }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      return;
    }

    if (initialData) {
      setForm({
        name: initialData.name || "",
        messageBody: initialData.messageBody || "",
        senderMode: initialData.senderMode || "SINGLE",
        senderId: initialData.senderId || "",
        ratePerMin: initialData.ratePerMin || "",
        scheduleAt: initialData.scheduleAt
          ? new Date(initialData.scheduleAt).toISOString().slice(0, 16)
          : ""
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
      messageBody: form.messageBody,
      senderMode: form.senderMode,
      senderId: form.senderId ? Number(form.senderId) : null,
      ratePerMin: form.ratePerMin ? Number(form.ratePerMin) : null,
      scheduleAt: form.scheduleAt ? new Date(form.scheduleAt) : null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData
          ? i18n.t("campaigns.modal.editTitle")
          : i18n.t("campaigns.modal.createTitle")}
      </DialogTitle>
      <DialogContent>
        <TextField fullWidth margin="dense" label={i18n.t("campaigns.fields.name")} name="name" value={form.name} onChange={handleChange} />
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("campaigns.modal.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("campaigns.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignModal;
