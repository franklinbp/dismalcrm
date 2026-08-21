import React from "react";
import { Paper, makeStyles } from "@material-ui/core";
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
  grid: {
    display: "grid",
    gap: theme.spacing(1),
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
  }
}));

const MetricsPanel = ({ metrics, loading, error, onRetry }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Title>{i18n.t("campaigns.metrics.title")}</Title>

      <PanelState
        loading={loading}
        error={error}
        empty={!loading && !error && !metrics}
        emptyText="No metrics available yet."
        onRetry={onRetry}
      />

      {metrics && !loading && !error && (
        <div className={classes.grid}>
          <div>{i18n.t("campaigns.metrics.total")}: {metrics.recipients.total}</div>
          <div>{i18n.t("campaigns.metrics.sent")}: {metrics.recipients.sent}</div>
          <div>{i18n.t("campaigns.metrics.failed")}: {metrics.recipients.failed}</div>
          <div>{i18n.t("campaigns.metrics.pending")}: {metrics.recipients.pending}</div>
          <div>{i18n.t("campaigns.metrics.retrying")}: {metrics.recipients.retrying}</div>
        </div>
      )}
    </Paper>
  );
};

export default MetricsPanel;
