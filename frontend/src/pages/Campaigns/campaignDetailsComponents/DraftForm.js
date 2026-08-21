import React from "react";
import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  makeStyles
} from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import { i18n } from "../../../translate/i18n";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(0.75),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  grid: {
    display: "grid",
    gap: theme.spacing(1),
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
  },
  composerRow: {
    display: "flex",
    gap: theme.spacing(0.5),
    alignItems: "center",
    marginTop: theme.spacing(0.5)
  },
  helper: {
    color: theme.palette.text.secondary,
    fontSize: 11
  }
}));

const DraftForm = ({
  isDraft,
  draftForm,
  senders,
  attachment,
  recipientsCount,
  estimatedMinutes,
  onChange,
  onSave,
  onUploadAttachment
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <div className={classes.grid}>
        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.name")}
          value={draftForm.name}
          onChange={event => onChange({ name: event?.target?.value || "" })}
          disabled={!isDraft}
        />

        <TextField
          select
          margin="dense"
          label={i18n.t("campaigns.fields.senderMode")}
          value={draftForm.senderMode}
          onChange={event => onChange({ senderMode: event?.target?.value || "" })}
          disabled={!isDraft}
        >
          <MenuItem value="SINGLE">{i18n.t("campaigns.senderModes.single")}</MenuItem>
          <MenuItem value="ROUND_ROBIN">{i18n.t("campaigns.senderModes.roundRobin")}</MenuItem>
        </TextField>

        {draftForm.senderMode === "SINGLE" && (
          <TextField
            select
            margin="dense"
            label={i18n.t("campaigns.fields.sender")}
            value={draftForm.senderId}
            onChange={event => onChange({ senderId: event?.target?.value || "" })}
            disabled={!isDraft}
          >
            {senders.map(sender => (
              <MenuItem key={sender.id} value={sender.id}>
                {sender.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.ratePerMin")}
          value={draftForm.ratePerMin}
          onChange={event => onChange({ ratePerMin: event?.target?.value || "" })}
          type="number"
          disabled={!isDraft}
          helperText={
            estimatedMinutes
              ? i18n.t("campaigns.fields.estimatedSend", {
                  minutes: estimatedMinutes,
                  count: recipientsCount
                })
              : i18n.t("campaigns.fields.estimatedSendEmpty")
          }
        />

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.scheduleAt")}
          value={draftForm.scheduleAt}
          onChange={event => onChange({ scheduleAt: event?.target?.value || "" })}
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          disabled={!isDraft}
        />
      </div>

      <TextField
        fullWidth
        multiline
        rows={4}
        margin="dense"
        label={i18n.t("campaigns.fields.messageBody")}
        value={draftForm.messageBody}
        onChange={event => onChange({ messageBody: event?.target?.value || "" })}
        helperText={i18n.t("campaigns.fields.messageHelp")}
        disabled={!isDraft}
      />

      <div className={classes.composerRow}>
        <input
          id="campaign-attachments"
          type="file"
          onChange={onUploadAttachment}
          style={{ display: "none" }}
          disabled={!isDraft}
        />
        <label htmlFor="campaign-attachments">
          <IconButton color="primary" component="span" disabled={!isDraft}>
            <AttachFile />
          </IconButton>
        </label>
        <div className={classes.helper}>
          {attachment
            ? i18n.t("campaigns.fields.attachmentsSelected", { count: 1 })
            : i18n.t("campaigns.fields.attachmentsEmpty")}
        </div>
      </div>

      {isDraft && (
        <Button size="small" variant="outlined" color="primary" onClick={onSave}>
          {i18n.t("campaigns.buttons.save")}
        </Button>
      )}
    </Paper>
  );
};

export default DraftForm;
