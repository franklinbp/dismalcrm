import React, { useMemo, useState } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { i18n } from "../../../translate/i18n";

const toInputDate = date => format(date, "yyyy-MM-dd");

const CampaignCalendarPanel = ({ campaigns, onOpenCampaign }) => {
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));

  const scheduledCampaigns = useMemo(() => {
    return (campaigns || [])
      .filter(campaign => Boolean(campaign.scheduleAt))
      .map(campaign => ({
        ...campaign,
        scheduleDate: parseISO(campaign.scheduleAt)
      }));
  }, [campaigns]);

  const selectedDateCampaigns = useMemo(() => {
    const selected = parseISO(`${selectedDate}T00:00:00`);
    return scheduledCampaigns.filter(campaign =>
      isSameDay(campaign.scheduleDate, selected)
    );
  }, [scheduledCampaigns, selectedDate]);

  const upcomingCount = scheduledCampaigns.filter(
    campaign => campaign.scheduleDate >= new Date()
  ).length;

  return (
    <Paper variant="outlined" style={{ marginTop: 16, padding: 12 }}>
      <Typography variant="subtitle1">
        {i18n.t("campaigns.calendar.title")}
      </Typography>

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <TextField
          type="date"
          label={i18n.t("campaigns.calendar.dateLabel")}
          value={selectedDate}
          onChange={event => setSelectedDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </div>

      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
        {i18n.t("campaigns.calendar.upcomingCount", { count: upcomingCount })}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{i18n.t("campaigns.table.name")}</TableCell>
            <TableCell>{i18n.t("campaigns.fields.scheduleAt")}</TableCell>
            <TableCell>{i18n.t("campaigns.table.status")}</TableCell>
            <TableCell>{i18n.t("campaigns.table.actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedDateCampaigns.map(campaign => (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>{format(campaign.scheduleDate, "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => onOpenCampaign(campaign.id)}
                >
                  {i18n.t("campaigns.buttons.open")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {selectedDateCampaigns.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                {i18n.t("campaigns.calendar.empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default CampaignCalendarPanel;
