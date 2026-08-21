import React from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  makeStyles
} from "@material-ui/core";
import Title from "../../../components/Title";
import { i18n } from "../../../translate/i18n";
import PanelState from "../components/PanelState";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(0.75),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(1)
  },
  helper: {
    color: theme.palette.text.secondary,
    fontSize: 11
  },
  grid: {
    display: "grid",
    gap: theme.spacing(1),
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    marginTop: 4
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    flexWrap: "wrap"
  }
}));

const RecipientsPanel = ({
  isDraft,
  recipients,
  recipientsLoading,
  recipientsError,
  onRetry,
  csvRecipients,
  manualRecipient,
  onOpenContacts,
  onOpenClients,
  onCsvFile,
  onImportCsv,
  onChangeManualRecipient,
  onAddManualRecipient
}) => {
  const classes = useStyles();
  const recipientsCount = recipients.length || 0;

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Title>{i18n.t("campaigns.recipients.title")}</Title>
      <div className={classes.helper}>
        {i18n.t("campaigns.recipients.count", { count: recipientsCount })}
      </div>

      {isDraft && (
        <div className={classes.actionButtons}>
          <Button variant="outlined" onClick={onOpenContacts}>
            {i18n.t("campaigns.recipients.fromContacts")}
          </Button>
          <Button variant="outlined" onClick={onOpenClients}>
            {i18n.t("campaigns.recipients.fromClients")}
          </Button>
          <input type="file" accept=".csv" onChange={onCsvFile} />
          {csvRecipients.length > 0 && (
            <Button variant="outlined" color="primary" onClick={onImportCsv}>
              {i18n.t("campaigns.recipients.importCsv", { count: csvRecipients.length })}
            </Button>
          )}

          <div className={classes.grid}>
            <TextField
              margin="dense"
              label={i18n.t("campaigns.recipients.manualName")}
              value={manualRecipient.name}
              onChange={event => onChangeManualRecipient({ name: event?.target?.value || "" })}
            />
            <TextField
              margin="dense"
              label={i18n.t("campaigns.recipients.manualPhone")}
              value={manualRecipient.phone}
              onChange={event => onChangeManualRecipient({ phone: event?.target?.value || "" })}
              helperText={i18n.t("campaigns.recipients.manualPhoneHelp")}
            />
            <Button size="small" variant="outlined" color="primary" onClick={onAddManualRecipient}>
              {i18n.t("campaigns.recipients.manualAdd")}
            </Button>
          </div>
        </div>
      )}

      <PanelState
        loading={recipientsLoading}
        error={recipientsError}
        empty={!recipientsLoading && !recipientsError && recipients.length === 0}
        emptyText="No recipients imported yet."
        onRetry={onRetry}
      />

      {!recipientsLoading && !recipientsError && recipients.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("campaigns.recipients.name")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.phone")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipients.map(recipient => (
              <TableRow key={recipient.id} hover>
                <TableCell>{recipient.name}</TableCell>
                <TableCell>{recipient.phoneE164}</TableCell>
                <TableCell>{recipient.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default RecipientsPanel;
