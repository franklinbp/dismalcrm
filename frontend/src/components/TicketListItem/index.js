import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import CameraAltIcon from "@material-ui/icons/CameraAlt";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
  },
  ticketRow: {
    margin: theme.spacing(0.5, 1),
    borderRadius: 14,
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(1),
    minHeight: 58,
    transition: "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(110, 168, 254, 0.08)"
          : "rgba(31, 75, 153, 0.06)",
      boxShadow:
        theme.palette.type === "dark"
          ? "0 6px 16px rgba(0, 0, 0, 0.35)"
          : "0 6px 16px rgba(15, 23, 42, 0.12)",
      transform: "translateY(-1px)",
    },
  },
  ticketRowSelected: {
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(110, 168, 254, 0.16)"
        : "rgba(31, 75, 153, 0.12)",
  },
  pendingTicket: {
    cursor: "unset",
  },
  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  contactName: {
    minWidth: 0,
    flex: 1,
    fontWeight: 600,
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    flex: "none",
    fontSize: "0.72rem",
  },
  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 8,
    marginLeft: "auto",
  },
  contactLastMessage: {
    paddingRight: 20,
    minWidth: 0,
    flex: 1,
  },
  acceptButton: {
    position: "absolute",
    right: 16,
    bottom: 12,
  },
  ticketQueueColor: {
    flex: "none",
    width: "6px",
    height: "70%",
    position: "absolute",
    top: "15%",
    left: "8px",
    borderRadius: 999,
  },
  channelIconSlot: {
    width: 28,
    flex: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing(0.5),
  },
  channelIcon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    opacity: 0.82,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 0 0 1px rgba(255, 255, 255, 0.14)"
        : "0 0 0 1px rgba(15, 23, 42, 0.08)",
    "& svg": {
      fontSize: 15,
    },
  },
  avatar: {
    width: 38,
    height: 38,
    border: `2px solid ${
      theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0"
    }`,
  },
  userTag: {
    flex: "none",
    color: theme.palette.text.secondary,
    maxWidth: 92,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "0.72rem",
    fontWeight: 600,
  },
  rightMeta: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    minWidth: 112,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flex: "none",
    opacity: 0.85,
    boxShadow: "0 0 0 3px rgba(37, 211, 102, 0.12)",
  },
}));

const channelMetaByName = {
  whatsapp: {
    label: "WhatsApp",
    color: "#25D366",
    background: "#25D366",
    Icon: WhatsAppIcon,
  },
  facebook: {
    label: "Messenger",
    color: "#168AFF",
    background: "#168AFF",
    Icon: ChatBubbleIcon,
  },
  messenger: {
    label: "Messenger",
    color: "#168AFF",
    background: "#168AFF",
    Icon: ChatBubbleIcon,
  },
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    background: "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #515BD4 100%)",
    Icon: CameraAltIcon,
  },
};

const getChannelMeta = (channel) =>
  channelMetaByName[(channel || "whatsapp").toLowerCase()] ||
  channelMetaByName.whatsapp;

const TicketListItem = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${id}`);
  };

  const handleSelectTicket = (id) => {
    history.push(`/tickets/${id}`);
  };

  const isSelected = ticketId && +ticketId === ticket.id;
  const contactName = ticket.contact?.name || ticket.contact?.number || "Cliente";
  const contactNumber = ticket.contact?.number || "";
  const channelMeta = getChannelMeta(ticket.channel || ticket.whatsapp?.channel);
  const ChannelIcon = channelMeta.Icon;
  const profileName = ticket.whatsapp?.name || "Dismal";
  const hasUnreadMessages = Number(ticket.unreadMessages) > 0;

  return (
    <React.Fragment key={ticket.id}>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket.id);
        }}
        selected={isSelected}
        className={clsx(classes.ticket, classes.ticketRow, {
          [classes.pendingTicket]: ticket.status === "pending",
          [classes.ticketRowSelected]: isSelected,
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={`${channelMeta.label} - ${profileName}`}
        >
          <span className={classes.channelIconSlot}>
            <span
              className={classes.channelIcon}
              style={{ background: channelMeta.background }}
            >
              <ChannelIcon />
            </span>
          </span>
        </Tooltip>
        <ListItemAvatar>
          <Tooltip arrow placement="right" title={contactNumber || contactName}>
            <Avatar src={ticket?.contact?.profilePicUrl} className={classes.avatar} />
          </Tooltip>
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
                className={classes.contactName}
              >
                {contactName}
              </Typography>
              {ticket.status === "closed" && (
                <Badge
                  className={classes.closedBadge}
                  badgeContent={"closed"}
                  color="primary"
                />
              )}
              {ticket.lastMessage && (
                <Typography
                  className={classes.lastMessageTime}
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              )}
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {ticket.lastMessage ? (
                  <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                ) : (
                  <br />
                )}
              </Typography>

              <span className={classes.rightMeta}>
                <span
                  className={classes.unreadDot}
                  title={`${ticket.unreadMessages || 0} mensajes nuevos`}
                  style={{
                    backgroundColor: hasUnreadMessages
                      ? channelMeta.color
                      : "transparent",
                    boxShadow: hasUnreadMessages
                      ? `0 0 0 3px ${channelMeta.color}22`
                      : "none",
                  }}
                />
                <span
                  className={classes.userTag}
                  title={i18n.t("ticketsList.connectionTitle")}
                >
                  {profileName}
                </span>
              </span>
            </span>
          }
        />
        {ticket.status === "pending" && (
          <ButtonWithSpinner
            color="primary"
            variant="contained"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket(ticket.id)}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItem;
