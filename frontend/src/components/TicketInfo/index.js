import React from "react";

import { Avatar, CardHeader, makeStyles } from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import CameraAltIcon from "@material-ui/icons/CameraAlt";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
	channelBadge: {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		marginLeft: 8,
		color: theme.palette.text.secondary,
		fontSize: "0.78rem",
		fontWeight: 600,
		verticalAlign: "middle",
	},
	channelIcon: {
		width: 18,
		height: 18,
		borderRadius: "50%",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#ffffff",
		opacity: 0.82,
		"& svg": {
			fontSize: 12,
		},
	},
}));

const channelMetaByName = {
	whatsapp: {
		background: "#25D366",
		Icon: WhatsAppIcon,
	},
	facebook: {
		background: "#168AFF",
		Icon: ChatBubbleIcon,
	},
	messenger: {
		background: "#168AFF",
		Icon: ChatBubbleIcon,
	},
	instagram: {
		background:
			"linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #515BD4 100%)",
		Icon: CameraAltIcon,
	},
};

const getChannelMeta = (channel) =>
	channelMetaByName[(channel || "whatsapp").toLowerCase()] ||
	channelMetaByName.whatsapp;

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	const contactName = contact?.name || contact?.number || "Cliente";
	const contactNumber = contact?.number || "";
	const channelMeta = getChannelMeta(ticket?.channel || ticket?.whatsapp?.channel);
	const ChannelIcon = channelMeta.Icon;
	const profileName = ticket?.whatsapp?.name || "Dismal";
	const assignedTo =
		ticket.user &&
		`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`;
	const subheader = [contactNumber, assignedTo].filter(Boolean).join(" - ");

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
			title={`${contactName} #${ticket.id}`}
			subheader={
				<span>
					{subheader}
					<span className={classes.channelBadge}>
						<span
							className={classes.channelIcon}
							style={{ background: channelMeta.background }}
						>
							<ChannelIcon />
						</span>
						{profileName}
					</span>
				</span>
			}
		/>
	);
};

export default TicketInfo;
