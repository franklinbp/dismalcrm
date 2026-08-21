import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
} from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  ticketsListWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.background.paper,
  },

  ticketsList: {
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderTop: `1px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"
    }`,
    backgroundColor: theme.palette.background.paper,
  },

  ticketsListHeader: {
    color: theme.palette.text.primary,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0"
    }`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ticketsCount: {
    fontWeight: "normal",
    color: theme.palette.text.secondary,
    marginLeft: "8px",
    fontSize: "14px",
  },

  noTicketsText: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_TICKETS") {
    const newTickets = action.payload;

    newTickets.forEach((ticket) => {
      const ticketIndex = state.findIndex((t) => t.id === ticket.id);
      if (ticketIndex !== -1) {
        state[ticketIndex] = ticket;
        if (ticket.unreadMessages > 0) {
          state.unshift(state.splice(ticketIndex, 1)[0]);
        }
      } else {
        state.push(ticket);
      }
    });

    return [...state];
  }

  if (action.type === "REFRESH_TICKETS") {
    const refreshedTickets = action.payload;
    const refreshedTicketIds = new Set(refreshedTickets.map((ticket) => ticket.id));
    const remainingTickets = state.filter((ticket) => !refreshedTicketIds.has(ticket.id));

    return [...refreshedTickets, ...remainingTickets];
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const TicketsList = (props) => {
  const { status, searchParam, showAll, selectedQueueIds, updateCount, style } =
    props;
  const classes = useStyles();
  const [pageNumber, setPageNumber] = useState(1);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, selectedQueueIds]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    queueIds: JSON.stringify(selectedQueueIds),
  });

  useEffect(() => {
    if (!status && !searchParam) return;
    dispatch({
      type: "LOAD_TICKETS",
      payload: tickets,
    });
  }, [tickets]);

  useEffect(() => {
    const socket = openSocket();
    let isActive = true;

    const syncLatestTickets = async () => {
      if ((!status && !searchParam) || document.hidden) return;

      try {
        const { data } = await api.get("/tickets", {
          params: {
            pageNumber: 1,
            searchParam,
            status,
            showAll,
            queueIds: JSON.stringify(selectedQueueIds),
          },
        });

        if (!isActive) return;

        dispatch({
          type: "REFRESH_TICKETS",
          payload: data.tickets || [],
        });
      } catch (err) {
        console.warn("No se pudo sincronizar la bandeja por socket.", err);
      }
    };

    const joinTicketRooms = () => {
      if (status) {
        socket.emit("joinTickets", status);
      } else {
        socket.emit("joinNotification");
      }
    };

    const shouldUpdateTicket = (ticket) =>
      !searchParam &&
      (!ticket.userId || ticket.userId === user?.id || showAll) &&
      (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

    const handleConnect = () => {
      joinTicketRooms();
      syncLatestTickets();
    };

    socket.on("connect", handleConnect);

    if (socket.connected) {
      joinTicketRooms();
      syncLatestTickets();
    }

    socket.on("ticket", (data) => {
      if (data.action === "updateUnread") {
        dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
        });
      }

      if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
        });
      }

      if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
        dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }
    });

    socket.on("appMessage", (data) => {
      if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
        });
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
        });
      }
    });

    return () => {
      isActive = false;
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, [status, searchParam, showAll, user, selectedQueueIds]);

  useEffect(() => {
    if (!status && !searchParam) return;

    let isMounted = true;

    const refreshLatestTickets = async () => {
      if (document.hidden) return;

      try {
        const { data } = await api.get("/tickets", {
          params: {
            pageNumber: 1,
            searchParam,
            status,
            showAll,
            queueIds: JSON.stringify(selectedQueueIds),
          },
        });

        if (!isMounted) return;

        dispatch({
          type: "REFRESH_TICKETS",
          payload: data.tickets || [],
        });
      } catch (err) {
        console.warn("No se pudo refrescar la bandeja de tickets.", err);
      }
    };

    const refreshWhenVisible = () => {
      if (!document.hidden) {
        refreshLatestTickets();
      }
    };

    const interval = setInterval(refreshLatestTickets, 15000);

    window.addEventListener("focus", refreshLatestTickets);
    window.addEventListener("online", refreshLatestTickets);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", refreshLatestTickets);
      window.removeEventListener("online", refreshLatestTickets);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [status, searchParam, showAll, selectedQueueIds]);

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      e.currentTarget.scrollTop = scrollTop - 100;
      loadMore();
    }
  };

  return (
    <Paper className={classes.ticketsListWrapper} style={style} elevation={0}>
      <Paper
        square
        name="closed"
        elevation={0}
        className={classes.ticketsList}
        onScroll={handleScroll}
      >
        <List style={{ paddingTop: 0 }}>
          {ticketsList.length === 0 && !loading ? (
            <div className={classes.noTicketsDiv}>
              <span className={classes.noTicketsTitle}>
                {i18n.t("ticketsList.noTicketsTitle")}
              </span>
              <p className={classes.noTicketsText}>
                {i18n.t("ticketsList.noTicketsMessage")}
              </p>
            </div>
          ) : (
            <>
              {ticketsList.map((ticket) => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </>
          )}
          {loading && <TicketsListSkeleton />}
        </List>
      </Paper>
    </Paper>
  );
};

export default TicketsList;
