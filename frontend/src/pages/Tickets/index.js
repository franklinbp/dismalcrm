import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },

  chatPapper: {
    display: "flex",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 18,
    overflow: "hidden",
    border: `1px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"
    }`,
  },

  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  contactsWrapperSmall: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default,
  },
  welcomeMsg: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    borderRadius: 0,
    color: theme.palette.text.secondary,
  },
  ticketsManager: {},
  ticketsManagerClosed: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          <Grid
            item
            xs={12}
            md={4}
            className={
              ticketId ? classes.contactsWrapperSmall : classes.contactsWrapper
            }
          >
            <TicketsManager />
          </Grid>
          <Grid item xs={12} md={8} className={classes.messagessWrapper}>
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg} elevation={0}>
                  <span>{i18n.t("chat.noTicketMessage")}</span>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
