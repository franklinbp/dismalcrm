import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { Edit, DeleteOutline } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    marginBottom: theme.spacing(1),
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: theme.palette.background.paper,
    padding: theme.spacing(1, 0),
  },
  searchInput: {
    maxWidth: 360,
    flex: 1,
  },
  filterInput: {
    minWidth: 150,
  },
  fileHelper: {
    color: theme.palette.text.secondary,
    fontSize: 12,
    marginTop: theme.spacing(1),
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
}));

const COUNTRY_OPTIONS = [
  { value: "", label: "Todos los paises" },
  { value: "EC", label: "Ecuador" },
];

const countryLabel = countryCode =>
  COUNTRY_OPTIONS.find(country => country.value === countryCode)?.label ||
  countryCode ||
  "-";

const ClientModal = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    name: "",
    tradeName: "",
    phone: "",
    countryCode: "EC",
    email: "",
    category: "",
    source: "",
    segment: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        tradeName: initialData.tradeName || "",
        phone: initialData.phoneE164 || "",
        countryCode: initialData.countryCode || "EC",
        email: initialData.email || "",
        category: initialData.category || "",
        source: initialData.source || "",
        segment: initialData.segment || ""
      });
    } else if (open) {
      setForm({
        name: "",
        tradeName: "",
        phone: "",
        countryCode: "EC",
        email: "",
        category: "",
        source: "",
        segment: ""
      });
    }
  }, [initialData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({
      name: form.name,
      tradeName: form.tradeName || null,
      phone: form.phone,
      countryCode: form.countryCode || null,
      email: form.email || null,
      category: form.category || null,
      source: form.source || null,
      segment: form.segment || null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{i18n.t("campaignClients.modal.title")}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaignClients.fields.name")}
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaignClients.fields.tradeName")}
          name="tradeName"
          value={form.tradeName}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaignClients.fields.phone")}
          name="phone"
          value={form.phone}
          onChange={handleChange}
          helperText={i18n.t("campaignClients.fields.phoneHelp")}
        />
        <TextField
          select
          fullWidth
          margin="dense"
          label="Pais"
          name="countryCode"
          value={form.countryCode}
          onChange={handleChange}
          helperText="Se usa para segmentar campanas y normalizar numeros locales."
        >
          {COUNTRY_OPTIONS.filter(country => country.value).map(country => (
            <MenuItem key={country.value} value={country.value}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaignClients.fields.email")}
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={i18n.t("campaignClients.fields.category")}
          name="category"
          value={form.category}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Origen"
          name="source"
          value={form.source}
          onChange={handleChange}
          helperText="Ejemplo: Gmail principal, Gmail ventas o WhatsApp."
        />
        <TextField
          fullWidth
          margin="dense"
          label="Segmento"
          name="segment"
          value={form.segment}
          onChange={handleChange}
          helperText="Ejemplo: Mayoristas, clientes finales o prospectos."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("campaignClients.modal.cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {i18n.t("campaignClients.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ImportClientsModal = ({ open, onClose, onImport, loading }) => {
  const classes = useStyles();
  const [form, setForm] = useState({
    countryCode: "EC",
    source: "",
    segment: "",
    category: ""
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({ countryCode: "EC", source: "", segment: "", category: "" });
      setFile(null);
    }
  }, [open]);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onImport({ ...form, file });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importar clientes desde CSV</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Pais por defecto"
          name="countryCode"
          value={form.countryCode}
          onChange={handleChange}
        >
          {COUNTRY_OPTIONS.filter(country => country.value).map(country => (
            <MenuItem key={country.value} value={country.value}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="dense"
          label="Origen"
          name="source"
          value={form.source}
          onChange={handleChange}
          helperText="Ejemplo: Gmail Franklin, Gmail ventas o base antigua."
        />
        <TextField
          fullWidth
          margin="dense"
          label="Segmento"
          name="segment"
          value={form.segment}
          onChange={handleChange}
          helperText="Ejemplo: Mayoristas, finales, prospectos Meta."
        />
        <TextField
          fullWidth
          margin="dense"
          label="Categoria"
          name="category"
          value={form.category}
          onChange={handleChange}
          helperText="Etiqueta comercial adicional."
        />
        <input
          type="file"
          accept=".csv,.txt"
          onChange={event => setFile(event.target.files?.[0] || null)}
        />
        <div className={classes.fileHelper}>
          Columnas aceptadas: phone,name,email,empresa,pais,origen,segmento,categoria.
          Tambien reconoce CSV exportado desde Google Contacts.
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={18} /> : "Importar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CampaignClients = () => {
  const classes = useStyles();

  const [clients, setClients] = useState([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchParam, setSearchParam] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [source, setSource] = useState("");
  const [segment, setSegment] = useState("");
  const [category, setCategory] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/campaign-clients", {
        params: { searchParam, pageNumber, countryCode, source, segment, category }
      });
      const nextClients = data.clients || [];
      setClients((prev) =>
        pageNumber === 1 ? nextClients : [...prev, ...nextClients]
      );
      setHasMore(Boolean(data.hasMore));
      setCount(data.count || 0);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, searchParam, countryCode, source, segment, category, refreshKey]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
    setPageNumber(1);
  };

  const handleCountryFilter = event => {
    setCountryCode(event.target.value);
    setPageNumber(1);
  };

  const handleTextFilter = setter => event => {
    setter(event.target.value);
    setPageNumber(1);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPageNumber((prev) => prev + 1);
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - (scrollTop + clientHeight) < 80) {
      loadMore();
    }
  };

  const handleCreate = async (payload) => {
    try {
      const { data } = await api.post("/campaign-clients", payload);
      setClients((prev) => [data, ...prev]);
      setCount((prev) => prev + 1);
      setClientModalOpen(false);
      setEditingClient(null);
      toast.success(i18n.t("campaignClients.toasts.created"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const { data } = await api.put(
        `/campaign-clients/${editingClient.id}`,
        payload
      );
      setClients((prev) =>
        prev.map((client) => (client.id === data.id ? data : client))
      );
      setClientModalOpen(false);
      setEditingClient(null);
      setPageNumber(1);
      toast.success(i18n.t("campaignClients.toasts.updated"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await api.delete(`/campaign-clients/${clientId}`);
      setClients((prev) => prev.filter((client) => client.id !== clientId));
      setCount((prev) => Math.max(prev - 1, 0));
      toast.success(i18n.t("campaignClients.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleImportClients = async ({ file, countryCode, source, segment, category }) => {
    if (!file) {
      toast.error("Selecciona un archivo CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("countryCode", countryCode || "EC");
    formData.append("source", source || "");
    formData.append("segment", segment || "");
    formData.append("category", category || "");

    setImportLoading(true);
    try {
      const { data } = await api.post("/campaign-clients/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(
        `Importacion completada: ${data.created || 0} nuevos, ${data.updated || 0} actualizados, ${data.existing || 0} existentes, ${data.skipped || 0} omitidos.`
      );
      setImportModalOpen(false);
      setPageNumber(1);
      setClients([]);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toastError(err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("campaignClients.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setImportModalOpen(true)}
          >
            Importar CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingClient(null);
              setClientModalOpen(true);
            }}
          >
            {i18n.t("campaignClients.buttons.new")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <div className={classes.toolbar}>
          <TextField
            className={classes.searchInput}
            size="small"
            variant="outlined"
            placeholder="Buscar por nombre, empresa, telefono o email"
            value={searchParam}
            onChange={handleSearch}
          />
          <TextField
            className={classes.filterInput}
            select
            size="small"
            variant="outlined"
            label="Pais"
            value={countryCode}
            onChange={handleCountryFilter}
          >
            {COUNTRY_OPTIONS.map(country => (
              <MenuItem key={country.value || "all"} value={country.value}>
                {country.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            className={classes.filterInput}
            size="small"
            variant="outlined"
            label="Origen"
            value={source}
            onChange={handleTextFilter(setSource)}
          />
          <TextField
            className={classes.filterInput}
            size="small"
            variant="outlined"
            label="Segmento"
            value={segment}
            onChange={handleTextFilter(setSegment)}
          />
          <TextField
            className={classes.filterInput}
            size="small"
            variant="outlined"
            label="Categoria"
            value={category}
            onChange={handleTextFilter(setCategory)}
          />
          <Typography variant="body2" color="textSecondary">
            {clients.length} de {count} clientes
          </Typography>
        </div>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("campaignClients.table.name")}</TableCell>
              <TableCell>{i18n.t("campaignClients.table.tradeName")}</TableCell>
              <TableCell>{i18n.t("campaignClients.table.phone")}</TableCell>
              <TableCell>Pais</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Segmento</TableCell>
              <TableCell>{i18n.t("campaignClients.table.email")}</TableCell>
              <TableCell>{i18n.t("campaignClients.table.category")}</TableCell>
              <TableCell align="right">
                {i18n.t("campaignClients.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} hover>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.tradeName || "-"}</TableCell>
                <TableCell>{client.phoneE164}</TableCell>
                <TableCell>{countryLabel(client.countryCode)}</TableCell>
                <TableCell>{client.source || "-"}</TableCell>
                <TableCell>{client.segment || "-"}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
                <TableCell>{client.category || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingClient(client);
                      setClientModalOpen(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(client.id)}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={classes.footer}>
          {hasMore ? (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Cargar mas clientes"}
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              {loading ? "Cargando..." : "No hay mas clientes para mostrar."}
            </Typography>
          )}
        </div>
      </Paper>

      <ClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSave={editingClient ? handleUpdate : handleCreate}
        initialData={editingClient}
      />
      <ImportClientsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportClients}
        loading={importLoading}
      />
    </MainContainer>
  );
};

export default CampaignClients;
