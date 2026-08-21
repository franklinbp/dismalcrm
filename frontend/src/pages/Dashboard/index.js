import React, { useContext } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import useTickets from "../../hooks/useTickets";

import { AuthContext } from "../../context/Auth/AuthContext";

import { i18n } from "../../translate/i18n";

import Chart from "./Chart";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: theme.spacing(3),
  },
  title: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  statCard: {
    padding: theme.spacing(2.5),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    borderRadius: 16,
    border: `1px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"
    }`,
    background:
      theme.palette.type === "dark"
        ? "linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(17, 24, 39, 0.9))"
        : "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
  },
  statLabel: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  statValue: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  chartPaper: {
    padding: theme.spacing(2.5),
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: 16,
    border: `1px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"
    }`,
  },
}));

const Dashboard = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);
  let userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  const GetTickets = (status, showAll, withUnreadMessages) => {
    const { count } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
    });
    return count;
  };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.header}>
          <Typography component="h1" variant="h4" className={classes.title}>
            {i18n.t("mainDrawer.listItems.dashboard")}
          </Typography>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper className={classes.statCard} elevation={0}>
              <Typography component="p" variant="subtitle2" className={classes.statLabel}>
                {i18n.t("dashboard.messages.inAttendance.title")}
              </Typography>
              <Typography component="h2" variant="h3" className={classes.statValue}>
                {GetTickets("open", "true", "false")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className={classes.statCard} elevation={0}>
              <Typography component="p" variant="subtitle2" className={classes.statLabel}>
                {i18n.t("dashboard.messages.waiting.title")}
              </Typography>
              <Typography component="h2" variant="h3" className={classes.statValue}>
                {GetTickets("pending", "true", "false")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className={classes.statCard} elevation={0}>
              <Typography component="p" variant="subtitle2" className={classes.statLabel}>
                {i18n.t("dashboard.messages.closed.title")}
              </Typography>
              <Typography component="h2" variant="h3" className={classes.statValue}>
                {GetTickets("closed", "true", "false")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.chartPaper} elevation={0}>
              <Chart />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
