import React from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import { Edit, DeleteOutline } from "@material-ui/icons";
import { i18n } from "../../../translate/i18n";
import PanelState from "./PanelState";

const SenderList = ({ senders, loading, error, onRetry, onEditSender, onDeleteSender }) => {
  const state = (
    <PanelState
      loading={loading}
      error={error}
      empty={!loading && !error && senders.length === 0}
      emptyText="No senders configured yet."
      onRetry={onRetry}
    />
  );

  if (loading || error || senders.length === 0) {
    return state;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{i18n.t("senders.table.name")}</TableCell>
          <TableCell>{i18n.t("senders.table.phone")}</TableCell>
          <TableCell>{i18n.t("senders.table.whatsapp")}</TableCell>
          <TableCell>{i18n.t("senders.table.status")}</TableCell>
          <TableCell>{i18n.t("senders.table.rate")}</TableCell>
          <TableCell align="right">{i18n.t("senders.table.actions")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {senders.map(sender => (
          <TableRow key={sender.id} hover>
            <TableCell>{sender.name}</TableCell>
            <TableCell>{sender.phone}</TableCell>
            <TableCell>{sender.whatsapp?.name || sender.whatsappId}</TableCell>
            <TableCell>{sender.status}</TableCell>
            <TableCell>{sender.ratePerMin || "-"}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onEditSender(sender)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDeleteSender(sender.id)}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SenderList;
