import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  makeStyles
} from "@material-ui/core";
import { i18n } from "../../../translate/i18n";
import PanelState from "./PanelState";

const useStyles = makeStyles(theme => ({
  cell: {
    padding: theme.spacing(0.75, 1),
    fontSize: 12
  },
  actions: {
    display: "inline-flex",
    gap: theme.spacing(0.5),
    alignItems: "center"
  }
}));

const CampaignList = ({
  campaigns,
  loading,
  error,
  onRetry,
  onOpenCampaign,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign
}) => {
  const classes = useStyles();
  const state = (
    <PanelState
      loading={loading}
      error={error}
      empty={!loading && !error && campaigns.length === 0}
      emptyText="No campaigns yet. Create your first campaign."
      onRetry={onRetry}
    />
  );

  if (loading || error || campaigns.length === 0) {
    return state;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell className={classes.cell}>{i18n.t("campaigns.table.name")}</TableCell>
          <TableCell className={classes.cell}>{i18n.t("campaigns.table.status")}</TableCell>
          <TableCell className={classes.cell}>{i18n.t("campaigns.table.senderMode")}</TableCell>
          <TableCell className={classes.cell}>{i18n.t("campaigns.table.createdAt")}</TableCell>
          <TableCell className={classes.cell} align="right">{i18n.t("campaigns.table.actions")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {campaigns.map(campaign => (
          <TableRow key={campaign.id} hover>
            <TableCell className={classes.cell}>{campaign.name}</TableCell>
            <TableCell className={classes.cell}>{campaign.status}</TableCell>
            <TableCell className={classes.cell}>{campaign.senderMode}</TableCell>
            <TableCell className={classes.cell}>
              {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : ""}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              <span className={classes.actions}>
                <Button size="small" color="primary" onClick={() => onOpenCampaign(campaign.id)}>
                  {i18n.t("campaigns.buttons.open")}
                </Button>
                {campaign.status === "DRAFT" && (
                  <Button size="small" onClick={() => onEditCampaign(campaign)}>
                    {i18n.t("campaigns.buttons.edit")}
                  </Button>
                )}
                <Button size="small" onClick={() => onDuplicateCampaign(campaign)}>
                  {i18n.t("campaigns.buttons.duplicate")}
                </Button>
                <Button size="small" color="secondary" onClick={() => onDeleteCampaign(campaign)}>
                  {i18n.t("campaigns.buttons.delete")}
                </Button>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CampaignList;
