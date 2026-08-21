import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import SendOutlinedIcon from "@material-ui/icons/Send";
import BusinessOutlinedIcon from "@material-ui/icons/BusinessOutlined";
import TrackChangesOutlinedIcon from "@material-ui/icons/TrackChangesOutlined";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

const useStyles = makeStyles((theme) => ({
  navItem: {
    borderRadius: 12,
    margin: theme.spacing(0.5, 1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: theme.palette.text.primary,
    transition: "background-color 160ms ease, box-shadow 160ms ease",
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(110, 168, 254, 0.12)"
          : "rgba(31, 75, 153, 0.08)",
    },
  },
  navItemActive: {
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(110, 168, 254, 0.18)"
        : "rgba(31, 75, 153, 0.12)",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 8px 20px rgba(0, 0, 0, 0.35)"
        : "0 8px 20px rgba(15, 23, 42, 0.12)",
  },
  navItemIcon: {
    minWidth: 40,
    color: "inherit",
  },
  subheader: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: 11,
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className, selected, selectedClassName } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        className={className}
        selected={selected}
        classes={{ selected: selectedClassName }}
      >
        {icon ? (
          <ListItemIcon className={clsx(selected && selectedClassName)}>
            {icon}
          </ListItemIcon>
        ) : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const classes = useStyles();
  const location = useLocation();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const isActive = (to) => {
    if (to === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div onClick={drawerClose}>
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        icon={
          <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
            <SyncAltIcon />
          </Badge>
        }
        className={classes.navItem}
        selected={isActive("/connections")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
        className={classes.navItem}
        selected={isActive("/tickets")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/commercial"
        primary="Centro comercial"
        icon={<TrackChangesOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/commercial")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/bot-flows"
        primary="Automatizaciones Bot"
        icon={<AccountTreeOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/bot-flows")}
        selectedClassName={classes.navItemActive}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/contacts")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/quickAnswers")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/campaigns"
        primary={i18n.t("mainDrawer.listItems.campaigns")}
        icon={<SendOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/campaigns")}
        selectedClassName={classes.navItemActive}
      />
      <ListItemLink
        to="/campaign-clients"
        primary={i18n.t("mainDrawer.listItems.campaignClients")}
        icon={<BusinessOutlinedIcon />}
        className={classes.navItem}
        selected={isActive("/campaign-clients")}
        selectedClassName={classes.navItemActive}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset className={classes.subheader}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
              className={classes.navItem}
              selected={isActive("/users")}
              selectedClassName={classes.navItemActive}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon />}
              className={classes.navItem}
              selected={isActive("/queues")}
              selectedClassName={classes.navItemActive}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
              className={classes.navItem}
              selected={isActive("/settings")}
              selectedClassName={classes.navItemActive}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
