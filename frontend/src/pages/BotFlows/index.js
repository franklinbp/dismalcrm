import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ForumIcon from "@material-ui/icons/Forum";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SaveIcon from "@material-ui/icons/Save";
import SecurityIcon from "@material-ui/icons/Security";
import StorefrontIcon from "@material-ui/icons/Storefront";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  page: {
    height: "100%",
    overflow: "auto",
    padding: theme.spacing(2),
    background:
      theme.palette.type === "dark"
        ? "linear-gradient(180deg, #111827 0%, #0b1220 100%)"
        : "linear-gradient(180deg, #f7faff 0%, #eef3f8 100%)",
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  headerCopy: {
    color: theme.palette.text.secondary,
    fontSize: 13,
  },
  panel: {
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
    background:
      theme.palette.type === "dark"
        ? "rgba(15, 23, 42, 0.86)"
        : "rgba(255, 255, 255, 0.92)",
  },
  kpi: {
    padding: theme.spacing(2),
    minHeight: 104,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    color: "#0f2e4d",
    background: "rgba(37, 99, 235, 0.1)",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
  section: {
    padding: theme.spacing(2),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  flowList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  flowItem: {
    padding: theme.spacing(1.25),
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.28)",
    cursor: "pointer",
    transition: "background 160ms ease, border 160ms ease",
  },
  flowItemActive: {
    borderColor: "#2563eb",
    background: "rgba(37, 99, 235, 0.08)",
  },
  canvas: {
    position: "relative",
    height: 520,
    minWidth: 1240,
    borderRadius: 12,
    overflow: "hidden",
    background:
      theme.palette.type === "dark"
        ? "linear-gradient(135deg, rgba(30,41,59,0.94), rgba(15,23,42,0.94))"
        : "linear-gradient(135deg, rgba(248,250,252,0.96), rgba(226,232,240,0.96))",
  },
  canvasWrap: {
    overflowX: "auto",
  },
  connectorLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  nodeCard: {
    position: "absolute",
    width: 184,
    minHeight: 78,
    borderRadius: 12,
    padding: theme.spacing(1.25),
    border: "1px solid rgba(148, 163, 184, 0.34)",
    background:
      theme.palette.type === "dark"
        ? "rgba(15, 23, 42, 0.84)"
        : "rgba(255, 255, 255, 0.84)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 12px 22px rgba(15, 23, 42, 0.08)",
    cursor: "pointer",
  },
  nodeCardActive: {
    borderColor: "#0ea5e9",
    boxShadow: "0 14px 28px rgba(14, 165, 233, 0.18)",
  },
  nodeType: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.palette.text.secondary,
  },
  nodeTitle: {
    marginTop: 6,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  nodeSummary: {
    marginTop: 4,
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  inspectorBody: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
  },
  jsonBox: {
    borderRadius: 10,
    padding: theme.spacing(1.5),
    background:
      theme.palette.type === "dark"
        ? "rgba(2, 6, 23, 0.42)"
        : "rgba(241, 245, 249, 0.9)",
    color: theme.palette.text.secondary,
    whiteSpace: "pre-wrap",
    fontSize: 12,
    maxHeight: 220,
    overflow: "auto",
  },
  editorActions: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.75),
  },
  simulator: {
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  chatPreview: {
    borderRadius: 12,
    minHeight: 250,
    padding: theme.spacing(2),
    background:
      theme.palette.type === "dark"
        ? "rgba(2, 6, 23, 0.36)"
        : "rgba(239, 246, 255, 0.72)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
  },
  customerBubble: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    padding: theme.spacing(1.25),
    borderRadius: "12px 12px 12px 2px",
    background:
      theme.palette.type === "dark" ? "rgba(51,65,85,0.86)" : "#ffffff",
  },
  botBubble: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    padding: theme.spacing(1.25),
    borderRadius: "12px 12px 2px 12px",
    background:
      theme.palette.type === "dark"
        ? "rgba(20, 83, 45, 0.62)"
        : "rgba(220, 252, 231, 0.94)",
  },
  muted: {
    color: theme.palette.text.secondary,
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
  },
  rulesGrid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.4fr 1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
    },
  },
  ruleItem: {
    padding: theme.spacing(1.25),
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.28)",
    cursor: "pointer",
  },
  ruleItemActive: {
    borderColor: "#16a34a",
    background: "rgba(22, 163, 74, 0.08)",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
  },
  activityRow: {
    display: "grid",
    gridTemplateColumns:
      "110px minmax(160px, 0.8fr) minmax(220px, 1.4fr) 150px",
    gap: theme.spacing(1.5),
    alignItems: "center",
    padding: theme.spacing(1.25, 0),
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    "&:last-child": { borderBottom: 0 },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
      gap: theme.spacing(0.5),
    },
  },
  activityDetail: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      whiteSpace: "normal",
      overflowWrap: "anywhere",
    },
  },
}));

const safeJson = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (err) {
    return {};
  }
};

const nodeLabel = (type) => {
  const labels = {
    START: "Inicio",
    INTENT: "Clasificador",
    MENU: "Menu",
    RESPONSE: "Respuesta",
    ACTION: "Accion",
    HUMAN_HANDOFF: "Asesor",
  };

  return labels[type] || type;
};

const nodeColor = (type) => {
  const colors = {
    START: "#2563eb",
    INTENT: "#7c3aed",
    MENU: "#0891b2",
    RESPONSE: "#16a34a",
    ACTION: "#ea580c",
    HUMAN_HANDOFF: "#db2777",
  };

  return colors[type] || "#64748b";
};

const getNodes = (flow) => flow?.nodes || flow?.BotNodes || [];
const getConnections = (flow) =>
  flow?.connections || flow?.BotConnections || [];

const defaultRuleEditor = {
  name: "Nueva regla BotMaster",
  active: true,
  priority: 100,
  operand: "CONTAINS",
  keyword: "",
  responseText: "Escribe aqui la respuesta de la regla.",
  attachmentsJson: "[]",
  buttonsJson: "[]",
  catalogJson: "[]",
  actionsJson: "[]",
  nextStepJson: "{}",
};

const BotFlows = () => {
  const classes = useStyles();
  const [flows, setFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [contactName, setContactName] = useState("Franklin");
  const [messageBody, setMessageBody] = useState(
    "Hola, necesito precios de Office 365"
  );
  const [simulation, setSimulation] = useState(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorType, setEditorType] = useState("RESPONSE");
  const [editorConfig, setEditorConfig] = useState("{}");
  const [savingNode, setSavingNode] = useState(false);
  const [savingFlow, setSavingFlow] = useState(false);
  const [rules, setRules] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [ruleEditor, setRuleEditor] = useState(defaultRuleEditor);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [observing, setObserving] = useState(false);
  const [observation, setObservation] = useState(null);
  const [runtimeStatus, setRuntimeStatus] = useState({
    serverEnabled: false,
    readyFlows: 0,
    publishedFlows: 0,
    recentFailures: 0,
    recentReplies: 0,
  });
  const [runtimeExecutions, setRuntimeExecutions] = useState([]);

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    try {
      const [flowResponse, statusResponse, executionResponse] =
        await Promise.all([
          api.get("/bot-flows"),
          api.get("/bot-flows/runtime/status"),
          api.get("/bot-flows/runtime/executions?limit=8"),
        ]);
      const nextFlows = flowResponse.data.flows || [];
      setFlows(nextFlows);
      setRuntimeStatus(statusResponse.data);
      setRuntimeExecutions(executionResponse.data.executions || []);

      if (!selectedFlowId && nextFlows.length) {
        setSelectedFlowId(nextFlows[0].id);
        const firstNodes = getNodes(nextFlows[0]);
        setSelectedNodeId(firstNodes[0]?.id || null);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedFlowId]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const selectedFlow = useMemo(
    () => flows.find((flow) => flow.id === selectedFlowId) || flows[0],
    [flows, selectedFlowId]
  );

  const nodes = useMemo(() => getNodes(selectedFlow), [selectedFlow]);
  const connections = useMemo(
    () => getConnections(selectedFlow),
    [selectedFlow]
  );
  const selectedRule = useMemo(
    () => rules.find((rule) => rule.id === selectedRuleId) || null,
    [rules, selectedRuleId]
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  const selectedConfig = useMemo(
    () => safeJson(selectedNode?.configJson),
    [selectedNode]
  );

  useEffect(() => {
    if (!selectedNode) {
      setEditorTitle("");
      setEditorType("RESPONSE");
      setEditorConfig("{}");
      return;
    }

    setEditorTitle(selectedNode.title || "");
    setEditorType(selectedNode.type || "RESPONSE");
    setEditorConfig(JSON.stringify(safeJson(selectedNode.configJson), null, 2));
  }, [selectedNode]);

  const nodeMap = useMemo(() => {
    return nodes.reduce((map, node) => {
      map[node.id] = node;
      return map;
    }, {});
  }, [nodes]);

  const fetchRules = useCallback(async () => {
    const flowId = selectedFlow?.id;

    if (!flowId) {
      setRules([]);
      return;
    }

    setLoadingRules(true);
    try {
      const { data } = await api.get(`/bot-flows/${flowId}/rules`);
      const nextRules = data.rules || [];
      setRules(nextRules);
      setSelectedRuleId((current) =>
        nextRules.some((rule) => rule.id === current)
          ? current
          : nextRules[0]?.id || null
      );
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingRules(false);
    }
  }, [selectedFlow?.id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (!selectedRule) {
      setRuleEditor(defaultRuleEditor);
      return;
    }

    setRuleEditor({
      name: selectedRule.name || "",
      active: Boolean(selectedRule.active),
      priority: selectedRule.priority || 100,
      operand: selectedRule.operand || "CONTAINS",
      keyword: selectedRule.keyword || "",
      responseText: selectedRule.responseText || "",
      attachmentsJson: selectedRule.attachmentsJson || "[]",
      buttonsJson: selectedRule.buttonsJson || "[]",
      catalogJson: selectedRule.catalogJson || "[]",
      actionsJson: selectedRule.actionsJson || "[]",
      nextStepJson: selectedRule.nextStepJson || "{}",
    });
  }, [selectedRule]);

  const installDemoFlow = async () => {
    setInstalling(true);
    try {
      const { data } = await api.post("/bot-flows/demo");
      await fetchFlows();
      setSelectedFlowId(data.id);
      setSelectedNodeId(getNodes(data)[0]?.id || null);
      toast.success("Flujo base instalado correctamente");
    } catch (err) {
      toastError(err);
    } finally {
      setInstalling(false);
    }
  };

  const toggleFlowReady = async () => {
    if (!selectedFlow) return;

    setSavingFlow(true);
    try {
      const { data } = await api.put(`/bot-flows/${selectedFlow.id}`, {
        active: !selectedFlow.active,
      });
      setFlows((current) =>
        current.map((flow) => (flow.id === data.id ? data : flow))
      );
      await fetchFlows();
      toast.success(
        data.active
          ? "Flujo marcado como listo para revision"
          : "Flujo regresado a modo diseno"
      );
    } catch (err) {
      toastError(err);
    } finally {
      setSavingFlow(false);
    }
  };

  const toggleFlowProduction = async () => {
    if (!selectedFlow) return;

    const publishing = !selectedFlow.runtimeEnabled;
    if (
      publishing &&
      !window.confirm(
        "Este flujo respondera mensajes reales de WhatsApp. Confirma que las reglas y adjuntos fueron probados."
      )
    ) {
      return;
    }

    setSavingFlow(true);
    try {
      const { data } = await api.put(`/bot-flows/${selectedFlow.id}`, {
        runtimeEnabled: publishing,
      });
      setFlows((current) =>
        current.map((flow) => (flow.id === data.id ? data : flow))
      );
      await fetchFlows();
      toast.success(
        data.runtimeEnabled
          ? "Flujo publicado en WhatsApp"
          : "Flujo retirado de produccion"
      );
    } catch (err) {
      toastError(err);
    } finally {
      setSavingFlow(false);
    }
  };

  const createResponseNode = async () => {
    if (!selectedFlow) return;

    try {
      const maxY = nodes.reduce(
        (value, node) => Math.max(value, Number(node.positionY || 0)),
        80
      );
      const { data } = await api.post(`/bot-flows/${selectedFlow.id}/nodes`, {
        type: "RESPONSE",
        title: "Nueva respuesta",
        positionX: 520,
        positionY: maxY + 120,
      });

      await fetchFlows();
      setSelectedNodeId(data.id);
      toast.success("Nodo creado");
    } catch (err) {
      toastError(err);
    }
  };

  const saveSelectedNode = async () => {
    if (!selectedNode) return;

    try {
      JSON.parse(editorConfig);
    } catch (err) {
      toast.error("La configuracion del nodo no es JSON valido");
      return;
    }

    setSavingNode(true);
    try {
      const { data } = await api.put(`/bot-flows/nodes/${selectedNode.id}`, {
        title: editorTitle,
        type: editorType,
        configJson: editorConfig,
      });

      setFlows((current) =>
        current.map((flow) => {
          if (flow.id !== selectedFlow?.id) return flow;

          return {
            ...flow,
            nodes: getNodes(flow).map((node) =>
              node.id === data.id ? data : node
            ),
          };
        })
      );
      toast.success("Nodo guardado correctamente");
    } catch (err) {
      toastError(err);
    } finally {
      setSavingNode(false);
    }
  };

  const updateRuleField = (field, value) => {
    setRuleEditor((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateRuleJson = () => {
    const fields = [
      "attachmentsJson",
      "buttonsJson",
      "catalogJson",
      "actionsJson",
      "nextStepJson",
    ];

    try {
      fields.forEach((field) => JSON.parse(ruleEditor[field] || "null"));
      return true;
    } catch (err) {
      toast.error("Una configuracion JSON de la regla no es valida");
      return false;
    }
  };

  const installDefaultRules = async () => {
    if (!selectedFlow) return;

    setLoadingRules(true);
    try {
      const { data } = await api.post(
        `/bot-flows/${selectedFlow.id}/rules/defaults`
      );
      const nextRules = data.rules || [];
      setRules(nextRules);
      setSelectedRuleId(nextRules[0]?.id || null);
      toast.success("Reglas BotMaster instaladas");
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingRules(false);
    }
  };

  const newRule = () => {
    setSelectedRuleId(null);
    setRuleEditor(defaultRuleEditor);
  };

  const saveRule = async () => {
    if (!selectedFlow || !validateRuleJson()) return;

    setSavingRule(true);
    try {
      const endpoint = selectedRule
        ? `/bot-flows/${selectedFlow.id}/rules/${selectedRule.id}`
        : `/bot-flows/${selectedFlow.id}/rules`;
      const { data } = selectedRule
        ? await api.put(endpoint, ruleEditor)
        : await api.post(endpoint, ruleEditor);

      await fetchRules();
      setSelectedRuleId(data.id);
      toast.success("Regla BotMaster guardada");
    } catch (err) {
      toastError(err);
    } finally {
      setSavingRule(false);
    }
  };

  const observeBotMaster = async () => {
    if (!selectedFlow) return;

    setObserving(true);
    try {
      const { data } = await api.post(`/bot-flows/${selectedFlow.id}/observe`, {
        contactName,
        messageBody,
        channel: "observer",
      });
      setObservation(data);
      if (data.rule?.id) {
        setSelectedRuleId(data.rule.id);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setObserving(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedFlow) return;

    setSimulating(true);
    try {
      const { data } = await api.post(
        `/bot-flows/${selectedFlow.id}/simulate`,
        {
          contactName,
          messageBody,
          channel: "simulator",
        }
      );
      setSimulation(data);
      setSelectedNodeId(data.matchedNode?.id || selectedNodeId);
    } catch (err) {
      toastError(err);
    } finally {
      setSimulating(false);
    }
  };

  const metrics = [
    {
      label: "Bot Guard",
      value: runtimeStatus.serverEnabled ? "Habilitado" : "Bloqueado",
      icon: <SecurityIcon />,
      text: `${runtimeStatus.publishedFlows || 0} flujos publicados`,
    },
    {
      label: "Flow Engine",
      value: nodes.length,
      icon: <AccountTreeIcon />,
      text: "Nodos configurados",
    },
    {
      label: "Response Builder",
      value: runtimeStatus.recentReplies || 0,
      icon: <ForumIcon />,
      text: "Respuestas en 24 horas",
    },
    {
      label: "Comercial",
      value: runtimeStatus.recentFailures || 0,
      icon: <StorefrontIcon />,
      text: "Fallos en 24 horas",
    },
  ];

  return (
    <MainContainer>
      <div className={classes.page}>
        <MainHeader>
          <Grid container className={classes.header}>
            <Grid item>
              <Title>Automatizaciones Bot</Title>
              <Typography className={classes.headerCopy}>
                Disena y prueba respuestas, catalogos, adjuntos y seguimiento
                comercial. Solo los flujos publicados responden mensajes reales
                de WhatsApp.
              </Typography>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="outlined"
                onClick={toggleFlowReady}
                disabled={!selectedFlow || savingFlow}
                style={{ marginRight: 8 }}
              >
                {selectedFlow?.active ? "Volver a diseno" : "Marcar listo"}
              </Button>
              <Button
                color={selectedFlow?.runtimeEnabled ? "secondary" : "primary"}
                variant="contained"
                onClick={toggleFlowProduction}
                disabled={
                  !selectedFlow ||
                  !selectedFlow.active ||
                  savingFlow ||
                  (!selectedFlow.runtimeEnabled && !runtimeStatus.serverEnabled)
                }
                style={{ marginRight: 8 }}
              >
                {selectedFlow?.runtimeEnabled
                  ? "Retirar de produccion"
                  : "Publicar en WhatsApp"}
              </Button>
              <Button
                color="primary"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={installDemoFlow}
                disabled={installing}
              >
                {installing ? "Instalando..." : "Instalar flujo base"}
              </Button>
            </Grid>
          </Grid>
        </MainHeader>

        {loading ? (
          <Paper className={`${classes.panel} ${classes.emptyState}`}>
            <CircularProgress size={28} />
            <Typography className={classes.muted}>
              Cargando automatizaciones...
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              {metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.label}>
                  <Paper className={`${classes.panel} ${classes.kpi}`}>
                    <div className={classes.kpiIcon}>{metric.icon}</div>
                    <div>
                      <Typography className={classes.kpiLabel}>
                        {metric.label}
                      </Typography>
                      <Typography className={classes.kpiValue}>
                        {metric.value}
                      </Typography>
                      <Typography className={classes.kpiLabel}>
                        {metric.text}
                      </Typography>
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper
              className={`${classes.panel} ${classes.section}`}
              style={{ marginTop: 16 }}
            >
              <div className={classes.sectionHeader}>
                <div>
                  <Typography variant="h6">Actividad de produccion</Typography>
                  <Typography variant="caption" className={classes.muted}>
                    Ultimas decisiones persistidas por el motor para esta
                    empresa.
                  </Typography>
                </div>
                <Chip
                  size="small"
                  color={runtimeStatus.serverEnabled ? "primary" : "default"}
                  label={
                    runtimeStatus.serverEnabled
                      ? "Motor habilitado"
                      : "Motor apagado en servidor"
                  }
                />
              </div>
              <div className={classes.activityList}>
                {runtimeExecutions.length ? (
                  runtimeExecutions.map((execution) => (
                    <div key={execution.id} className={classes.activityRow}>
                      <Chip
                        size="small"
                        color={
                          execution.status === "FAILED"
                            ? "secondary"
                            : ["REPLIED", "HANDOFF"].includes(execution.status)
                            ? "primary"
                            : "default"
                        }
                        label={execution.status}
                      />
                      <div>
                        <Typography variant="subtitle2">
                          {execution.flow?.name || `Flujo #${execution.flowId}`}
                        </Typography>
                        <Typography variant="caption" className={classes.muted}>
                          {execution.rule?.name || "Sin regla coincidente"}
                        </Typography>
                      </div>
                      <Typography
                        variant="body2"
                        className={classes.activityDetail}
                      >
                        {execution.errorMessage ||
                          execution.lastOutput ||
                          execution.lastInput ||
                          "Sin detalle"}
                      </Typography>
                      <Typography variant="caption" className={classes.muted}>
                        {new Date(execution.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  ))
                ) : (
                  <Typography className={classes.muted}>
                    Todavia no hay ejecuciones registradas.
                  </Typography>
                )}
              </div>
            </Paper>

            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12} md={3}>
                <Paper className={`${classes.panel} ${classes.section}`}>
                  <div className={classes.sectionHeader}>
                    <Typography variant="h6">Flujos</Typography>
                    <Chip
                      size="small"
                      color={
                        selectedFlow?.runtimeEnabled || selectedFlow?.active
                          ? "primary"
                          : "default"
                      }
                      label={
                        selectedFlow?.runtimeEnabled
                          ? "Produccion"
                          : selectedFlow?.active
                          ? "Listo"
                          : "Diseno"
                      }
                    />
                  </div>
                  <div className={classes.flowList}>
                    {flows.length === 0 ? (
                      <Typography className={classes.muted}>
                        Aun no hay flujos. Instala el flujo base para empezar.
                      </Typography>
                    ) : (
                      flows.map((flow) => (
                        <div
                          key={flow.id}
                          className={`${classes.flowItem} ${
                            flow.id === selectedFlow?.id
                              ? classes.flowItemActive
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedFlowId(flow.id);
                            setSelectedNodeId(getNodes(flow)[0]?.id || null);
                            setSelectedRuleId(null);
                            setObservation(null);
                            setSimulation(null);
                          }}
                        >
                          <Typography variant="subtitle2">
                            {flow.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            className={classes.muted}
                          >
                            {getNodes(flow).length} nodos - canal {flow.channel}{" "}
                            -{" "}
                            {flow.runtimeEnabled
                              ? "produccion"
                              : flow.active
                              ? "listo"
                              : "diseno"}
                          </Typography>
                        </div>
                      ))
                    )}
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper className={`${classes.panel} ${classes.section}`}>
                  <div className={classes.sectionHeader}>
                    <div>
                      <Typography variant="h6">
                        {selectedFlow?.name || "Canvas de automatizacion"}
                      </Typography>
                      <Typography variant="caption" className={classes.muted}>
                        Disena primero, simula despues, conecta a WhatsApp solo
                        cuando este validado.
                      </Typography>
                    </div>
                    <div className={classes.editorActions}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={createResponseNode}
                        disabled={!selectedFlow}
                      >
                        Nodo
                      </Button>
                      <Chip size="small" label="Modo seguro" />
                    </div>
                  </div>
                  <div className={classes.canvasWrap}>
                    <div className={classes.canvas}>
                      <svg className={classes.connectorLayer}>
                        {connections.map((connection) => {
                          const source = nodeMap[connection.sourceNodeId];
                          const target = nodeMap[connection.targetNodeId];
                          if (!source || !target) return null;

                          return (
                            <line
                              key={connection.id}
                              x1={source.positionX + 184}
                              y1={source.positionY + 39}
                              x2={target.positionX}
                              y2={target.positionY + 39}
                              stroke="rgba(37, 99, 235, 0.42)"
                              strokeWidth="2"
                              strokeDasharray="5 5"
                            />
                          );
                        })}
                      </svg>
                      {nodes.map((node) => {
                        const config = safeJson(node.configJson);
                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`${classes.nodeCard} ${
                              node.id === selectedNode?.id
                                ? classes.nodeCardActive
                                : ""
                            }`}
                            style={{
                              left: node.positionX,
                              top: node.positionY,
                              borderTop: `4px solid ${nodeColor(node.type)}`,
                            }}
                          >
                            <Typography className={classes.nodeType}>
                              {nodeLabel(node.type)}
                            </Typography>
                            <Typography className={classes.nodeTitle}>
                              {node.title}
                            </Typography>
                            <Typography className={classes.nodeSummary} noWrap>
                              {config.response ||
                                config.fallback ||
                                "Configura reglas, acciones o respuestas"}
                            </Typography>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper className={`${classes.panel} ${classes.section}`}>
                  <div className={classes.sectionHeader}>
                    <Typography variant="h6">Inspector</Typography>
                    <Chip
                      size="small"
                      label={
                        selectedNode ? nodeLabel(selectedNode.type) : "Nodo"
                      }
                    />
                  </div>
                  {selectedNode ? (
                    <div className={classes.inspectorBody}>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Titulo del nodo"
                        value={editorTitle}
                        onChange={(event) => setEditorTitle(event.target.value)}
                      />
                      <TextField
                        select
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Tipo de nodo"
                        value={editorType}
                        onChange={(event) => setEditorType(event.target.value)}
                      >
                        {[
                          "START",
                          "INTENT",
                          "MENU",
                          "RESPONSE",
                          "ACTION",
                          "HUMAN_HANDOFF",
                        ].map((type) => (
                          <MenuItem key={type} value={type}>
                            {nodeLabel(type)}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Typography variant="caption" className={classes.muted}>
                        Aqui se definen palabras clave, mensaje, botones,
                        adjuntos y acciones.
                      </Typography>

                      {selectedConfig.keywords?.length ? (
                        <div className={classes.chips}>
                          {selectedConfig.keywords.map((keyword) => (
                            <Chip key={keyword} size="small" label={keyword} />
                          ))}
                        </div>
                      ) : null}

                      {selectedConfig.actions?.length ? (
                        <div className={classes.chips}>
                          {selectedConfig.actions.map((action) => (
                            <Chip
                              key={action}
                              size="small"
                              color="primary"
                              variant="outlined"
                              label={action}
                            />
                          ))}
                        </div>
                      ) : null}

                      <TextField
                        fullWidth
                        multiline
                        rows={10}
                        rowsMax={18}
                        variant="outlined"
                        label="Configuracion JSON"
                        value={editorConfig}
                        onChange={(event) =>
                          setEditorConfig(event.target.value)
                        }
                      />
                      <div className={classes.editorActions}>
                        <Button
                          color="primary"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={saveSelectedNode}
                          disabled={savingNode}
                        >
                          {savingNode ? "Guardando..." : "Guardar nodo"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Typography className={classes.muted}>
                      Selecciona un nodo.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Paper
              className={`${classes.panel} ${classes.section}`}
              style={{ marginTop: 16 }}
            >
              <div className={classes.sectionHeader}>
                <div>
                  <Typography variant="h6">Reglas BotMaster</Typography>
                  <Typography variant="caption" className={classes.muted}>
                    Reglas con operador, palabra clave, respuesta, botones,
                    adjuntos y siguiente paso.
                  </Typography>
                </div>
                <div className={classes.editorActions}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={installDefaultRules}
                    disabled={!selectedFlow || loadingRules}
                  >
                    Instalar reglas base
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={newRule}
                    disabled={!selectedFlow}
                  >
                    Nueva regla
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={saveRule}
                    disabled={!selectedFlow || savingRule}
                  >
                    {savingRule ? "Guardando..." : "Guardar regla"}
                  </Button>
                </div>
              </div>

              <div className={classes.rulesGrid}>
                <div className={classes.flowList}>
                  {loadingRules ? (
                    <Typography className={classes.muted}>
                      Cargando reglas...
                    </Typography>
                  ) : rules.length === 0 ? (
                    <Typography className={classes.muted}>
                      Aun no hay reglas BotMaster para este flujo.
                    </Typography>
                  ) : (
                    rules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`${classes.ruleItem} ${
                          rule.id === selectedRuleId
                            ? classes.ruleItemActive
                            : ""
                        }`}
                        onClick={() => setSelectedRuleId(rule.id)}
                      >
                        <Typography variant="subtitle2">{rule.name}</Typography>
                        <Typography variant="caption" className={classes.muted}>
                          #{rule.priority} - {rule.operand} -{" "}
                          {rule.active ? "Activa" : "Pausada"}
                        </Typography>
                      </div>
                    ))
                  )}
                </div>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      label="Nombre de regla"
                      value={ruleEditor.name}
                      onChange={(event) =>
                        updateRuleField("name", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      variant="outlined"
                      label="Prioridad"
                      value={ruleEditor.priority}
                      onChange={(event) =>
                        updateRuleField("priority", Number(event.target.value))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      variant="outlined"
                      label="Operador"
                      value={ruleEditor.operand}
                      onChange={(event) =>
                        updateRuleField("operand", event.target.value)
                      }
                    >
                      {[
                        "CONTAINS",
                        "EQUALS",
                        "STARTS_WITH",
                        "ENDS_WITH",
                        "REGEX",
                      ].map((operand) => (
                        <MenuItem key={operand} value={operand}>
                          {operand}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ruleEditor.active}
                          onChange={(event) =>
                            updateRuleField("active", event.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        ruleEditor.active ? "Regla activa" : "Regla pausada"
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      label="Palabras clave separadas por coma"
                      value={ruleEditor.keyword}
                      onChange={(event) =>
                        updateRuleField("keyword", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Respuesta"
                      value={ruleEditor.responseText}
                      onChange={(event) =>
                        updateRuleField("responseText", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Botones JSON"
                      value={ruleEditor.buttonsJson}
                      onChange={(event) =>
                        updateRuleField("buttonsJson", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Adjuntos JSON"
                      value={ruleEditor.attachmentsJson}
                      onChange={(event) =>
                        updateRuleField("attachmentsJson", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Catalogo JSON"
                      value={ruleEditor.catalogJson}
                      onChange={(event) =>
                        updateRuleField("catalogJson", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label="Acciones JSON"
                      value={ruleEditor.actionsJson}
                      onChange={(event) =>
                        updateRuleField("actionsJson", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      label="Siguiente paso JSON"
                      value={ruleEditor.nextStepJson}
                      onChange={(event) =>
                        updateRuleField("nextStepJson", event.target.value)
                      }
                    />
                  </Grid>
                </Grid>

                <div>
                  <div className={classes.sectionHeader}>
                    <Typography variant="subtitle1">Modo observador</Typography>
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={observeBotMaster}
                      disabled={!selectedFlow || observing}
                    >
                      {observing ? "Observando..." : "Probar regla"}
                    </Button>
                  </div>
                  <Typography variant="caption" className={classes.muted}>
                    Usa el mensaje del simulador y no envia nada real.
                  </Typography>
                  <div className={classes.jsonBox} style={{ marginTop: 12 }}>
                    {observation
                      ? JSON.stringify(
                          {
                            matched: observation.matched,
                            rule: observation.rule?.name || null,
                            reply: observation.reply,
                            payload: observation.payload,
                          },
                          null,
                          2
                        )
                      : "Sin observacion ejecutada."}
                  </div>
                </div>
              </div>
            </Paper>

            <Paper
              className={`${classes.panel} ${classes.section}`}
              style={{ marginTop: 16, marginBottom: 24 }}
            >
              <div className={classes.sectionHeader}>
                <div>
                  <Typography variant="h6">
                    Simulador de conversacion
                  </Typography>
                  <Typography variant="caption" className={classes.muted}>
                    Prueba menus, respuestas, catalogos y acciones antes de
                    activar cualquier automatizacion.
                  </Typography>
                </div>
                <Button
                  color="primary"
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={runSimulation}
                  disabled={!selectedFlow || simulating}
                >
                  {simulating ? "Simulando..." : "Simular"}
                </Button>
              </div>

              <div className={classes.simulator}>
                <div>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Nombre del cliente"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Mensaje recibido"
                        value={messageBody}
                        onChange={(event) => setMessageBody(event.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Divider style={{ margin: "16px 0" }} />

                  <Typography variant="subtitle2">Resultado tecnico</Typography>
                  <Typography className={classes.muted} variant="body2">
                    Nodo detectado:{" "}
                    {simulation?.matchedNode?.title || "Sin simulacion"}
                  </Typography>
                  <Typography className={classes.muted} variant="body2">
                    Recorrido:{" "}
                    {(simulation?.timeline || []).join(" -> ") || "Pendiente"}
                  </Typography>

                  <div className={classes.chips} style={{ marginTop: 12 }}>
                    {(simulation?.actions || []).map((action) => (
                      <Chip
                        key={action}
                        size="small"
                        icon={
                          action.toLowerCase().includes("lead") ? (
                            <PersonAddIcon />
                          ) : (
                            <AttachFileIcon />
                          )
                        }
                        label={action}
                      />
                    ))}
                  </div>
                </div>

                <div className={classes.chatPreview}>
                  <div className={classes.customerBubble}>
                    <Typography variant="caption" className={classes.muted}>
                      {contactName || "Cliente"}
                    </Typography>
                    <Typography>{messageBody}</Typography>
                  </div>
                  <div className={classes.botBubble}>
                    <Typography variant="caption" className={classes.muted}>
                      Asistente Dismal
                    </Typography>
                    <Typography style={{ whiteSpace: "pre-wrap" }}>
                      {simulation?.reply ||
                        "Ejecuta una simulacion para ver la respuesta que entregaria el bot."}
                    </Typography>
                  </div>
                </div>
              </div>
            </Paper>
          </>
        )}
      </div>
    </MainContainer>
  );
};

export default BotFlows;
