import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const ContactSelectModal = ({ open, onClose, onImport }) => {
  const [contacts, setContacts] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!open) {
      setContacts([]);
      setSelected({});
      setSearchParam("");
      setPageNumber(1);
      return;
    }

    const fetchContacts = async () => {
      try {
        const { data } = await api.get("/contacts/", {
          params: { searchParam, pageNumber }
        });

        if (pageNumber === 1) {
          setContacts(data.contacts || []);
        } else {
          setContacts(prev => [...prev, ...(data.contacts || [])]);
        }

        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      }
    };

    fetchContacts();
  }, [open, searchParam, pageNumber]);

  const toggleSelected = contact => {
    setSelected(prev => ({
      ...prev,
      [contact.id]: prev[contact.id] ? undefined : contact
    }));
  };

  const handleImport = () => {
    const recipients = Object.values(selected)
      .filter(Boolean)
      .map(contact => ({
        phoneE164: contact.number,
        name: contact.name
      }));

    onImport(recipients);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{i18n.t("campaigns.recipients.selectContacts")}</DialogTitle>
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

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("campaigns.recipients.select")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.name")}</TableCell>
              <TableCell>{i18n.t("campaigns.recipients.phone")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id} hover>
                <TableCell>
                  <Checkbox checked={Boolean(selected[contact.id])} onChange={() => toggleSelected(contact)} />
                </TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.number}</TableCell>
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

export default ContactSelectModal;
