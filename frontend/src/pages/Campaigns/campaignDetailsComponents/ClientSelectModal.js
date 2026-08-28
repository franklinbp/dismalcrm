import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from "@material-ui/core";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import toastError from "../../../errors/toastError";

const COUNTRY_OPTIONS = [
  { value: "", label: "Todos los paises" },
  { value: "EC", label: "Ecuador" },
];

const countryLabel = countryCode =>
  COUNTRY_OPTIONS.find(country => country.value === countryCode)?.label ||
  countryCode ||
  "-";

const ClientSelectModal = ({ open, onClose, onImport }) => {
  const [clients, setClients] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!open) {
      setClients([]);
      setSelected({});
      setSearchParam("");
      setCountryCode("");
      setPageNumber(1);
      return;
    }

    const fetchClients = async () => {
      try {
        const { data } = await api.get("/campaign-clients", {
          params: { searchParam, pageNumber, countryCode }
        });

        if (pageNumber === 1) {
          setClients(data.clients || []);
        } else {
          setClients(prev => [...prev, ...(data.clients || [])]);
        }

        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      }
    };

    fetchClients();
  }, [open, searchParam, pageNumber, countryCode]);

  const toggleSelected = client => {
    setSelected(prev => ({
      ...prev,
      [client.id]: prev[client.id] ? undefined : client
    }));
  };

  const visibleClients = clients || [];
  const visibleSelectedCount = visibleClients.filter(client => Boolean(selected[client.id])).length;
  const allVisibleSelected = visibleClients.length > 0 && visibleSelectedCount === visibleClients.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  const toggleVisibleClients = () => {
    setSelected(prev => {
      const next = { ...prev };
      visibleClients.forEach(client => {
        next[client.id] = allVisibleSelected ? undefined : client;
      });
      return next;
    });
  };

  const handleImport = () => {
    const recipients = Object.values(selected)
      .filter(Boolean)
      .map(client => ({
        phoneE164: client.phoneE164,
        name: client.tradeName || client.name
      }));

    onImport(recipients);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{i18n.t("campaigns.recipients.selectClients")}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaigns.recipients.search")}
          value={searchParam}
          onChange={event => {
            setSearchParam(event.target.value);
            setPageNumber(1);
          }}
        />
        <TextField
          select
          fullWidth
          margin="dense"
          label="Pais"
          value={countryCode}
          onChange={event => {
            setCountryCode(event.target.value);
            setPageNumber(1);
            setClients([]);
            setSelected({});
          }}
        >
          {COUNTRY_OPTIONS.map(country => (
            <MenuItem key={country.value || "all"} value={country.value}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onChange={toggleVisibleClients}
                />
                {i18n.t("campaigns.recipients.select")}
              </TableCell>
              <TableCell>{i18n.t("campaigns.recipients.name")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.phone")}</TableCell>
              <TableCell>Pais</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.email")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id} hover>
                <TableCell>
                  <Checkbox checked={Boolean(selected[client.id])} onChange={() => toggleSelected(client)} />
                </TableCell>
                <TableCell>{client.tradeName || client.name}</TableCell>
                <TableCell>{client.phoneE164}</TableCell>
                <TableCell>{countryLabel(client.countryCode)}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {hasMore && (
          <Button onClick={() => setPageNumber(prev => prev + 1)}>
            {i18n.t("campaigns.recipients.loadMore")}
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("campaigns.modal.cancel")}
        </Button>
        <Button onClick={handleImport} color="primary" variant="contained">
          {i18n.t("campaigns.recipients.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientSelectModal;
