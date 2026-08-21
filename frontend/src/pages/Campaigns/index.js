import React, { useContext, useEffect, useState } from "react";
import { Button, makeStyles, Paper } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";
import CampaignModal from "./components/CampaignModal";
import SenderModal from "./components/SenderModal";
import QuickSendModal from "./components/QuickSendModal";
import CampaignList from "./components/CampaignList";
import SenderList from "./components/SenderList";
import CampaignCalendarPanel from "./components/CampaignCalendarPanel";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(0.5),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  sectionTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5)
  },
  actionsRow: {
    display: "flex",
    gap: theme.spacing(0.5)
  }
}));

const Campaigns = () => {
  const classes = useStyles();
  const history = useHistory();
  const { isAuth, loading: authLoading } = useContext(AuthContext);

  const [campaigns, setCampaigns] = useState([]);
  const [senders, setSenders] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [clients, setClients] = useState([]);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [senderModalOpen, setSenderModalOpen] = useState(false);
  const [quickSendOpen, setQuickSendOpen] = useState(false);
  const [editingSender, setEditingSender] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deleteCampaign, setDeleteCampaign] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [campaignsRes, sendersRes, whatsappRes, clientsRes] = await Promise.all([
        api.get("/campaigns"),
        api.get("/senders"),
        api.get("/whatsapp/"),
        api.get("/campaign-clients", { params: { pageNumber: "all" } })
      ]);

      setCampaigns(campaignsRes.data || []);
      setSenders(sendersRes.data || []);
      setWhatsapps(whatsappRes.data || []);
      setClients(clientsRes?.data?.clients || []);
    } catch (err) {
      setError("Could not load campaigns data.");
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuth) {
      return;
    }

    fetchData();
  }, [authLoading, isAuth]);

  const handleSaveCampaign = async payload => {
    try {
      if (editingCampaign) {
        const { data } = await api.put(`/campaigns/${editingCampaign.id}`, payload);
        setCampaigns(prev => prev.map(item => (item.id === data.id ? data : item)));
        setEditingCampaign(null);
        setCampaignModalOpen(false);
        toast.success(i18n.t("campaigns.toasts.updated"));
        return;
      }

      const { data } = await api.post("/campaigns", payload);
      setCampaigns(prev => [data, ...prev]);
      setCampaignModalOpen(false);
      toast.success(i18n.t("campaigns.toasts.created"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteCampaign = async campaignId => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      setCampaigns(prev => prev.filter(item => item.id !== campaignId));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateCampaign = async campaign => {
    try {
      const { data } = await api.post(`/campaigns/${campaign.id}/duplicate`);
      setCampaigns(prev => [data, ...prev]);
      toast.success(i18n.t("campaigns.toasts.duplicated"));
      history.push(`/campaigns/${data.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCreateSender = async payload => {
    try {
      const { data } = await api.post("/senders", payload);
      setSenders(prev => [data, ...prev]);
      setSenderModalOpen(false);
      setEditingSender(null);
      toast.success(i18n.t("senders.toasts.created"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateSender = async payload => {
    try {
      const { data } = await api.put(`/senders/${editingSender.id}`, payload);
      setSenders(prev => prev.map(sender => (sender.id === data.id ? data : sender)));
      setSenderModalOpen(false);
      setEditingSender(null);
      toast.success(i18n.t("senders.toasts.updated"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteSender = async senderId => {
    try {
      await api.delete(`/senders/${senderId}`);
      setSenders(prev => prev.filter(sender => sender.id !== senderId));
      toast.success(i18n.t("senders.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleQuickSend = async payload => {
    const hasRecipients = (payload.recipients || []).length > 0;

    if (!hasRecipients) {
      toast.error(i18n.t("campaigns.quickSend.errors.recipientsRequired"));
      return;
    }

    if (!payload.messageBody || !payload.messageBody.trim()) {
      toast.error(i18n.t("campaigns.quickSend.errors.messageRequired"));
      return;
    }

    if (payload.senderMode === "SINGLE" && !payload.senderId) {
      toast.error(i18n.t("campaigns.quickSend.errors.senderRequired"));
      return;
    }

    try {
      const campaignName =
        payload.name && payload.name.trim()
          ? payload.name.trim()
          : `${i18n.t("campaigns.quickSend.defaultName")} ${new Date().toLocaleString()}`;

      const createPayload = {
        name: campaignName,
        messageBody: payload.messageBody,
        senderMode: payload.senderMode,
        senderId: payload.senderId || null,
        ratePerMin: payload.ratePerMin || null,
        scheduleAt: payload.scheduleAt || null
      };

      const { data: createdCampaign } = await api.post("/campaigns", createPayload);

      if (payload.attachment) {
        const formData = new FormData();
        formData.append("media", payload.attachment);
        await api.post(`/campaigns/${createdCampaign.id}/media`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      await api.post(`/campaigns/${createdCampaign.id}/recipients`, payload.recipients);
      await api.post(`/campaigns/${createdCampaign.id}/ready`);

      setQuickSendOpen(false);
      toast.success(i18n.t("campaigns.quickSend.success"));
      fetchData();
      history.push(`/campaigns/${createdCampaign.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("campaigns.title")}</Title>
        <MainHeaderButtonsWrapper>
          <div className={classes.actionsRow}>
            <Button size="small" variant="outlined" color="primary" onClick={() => setQuickSendOpen(true)}>
              {i18n.t("campaigns.buttons.quickSend")}
            </Button>
          </div>
          <Button size="small" variant="contained" color="primary" onClick={() => setCampaignModalOpen(true)}>
            {i18n.t("campaigns.buttons.new")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <CampaignList
          campaigns={campaigns}
          loading={loading}
          error={error}
          onRetry={fetchData}
          onOpenCampaign={campaignId => history.push(`/campaigns/${campaignId}`)}
          onEditCampaign={campaign => {
            setEditingCampaign(campaign);
            setCampaignModalOpen(true);
          }}
          onDuplicateCampaign={handleDuplicateCampaign}
          onDeleteCampaign={campaign => setDeleteCampaign(campaign)}
        />
      </Paper>

      <CampaignCalendarPanel
        campaigns={campaigns}
        onOpenCampaign={campaignId => history.push(`/campaigns/${campaignId}`)}
      />

      <Title className={classes.sectionTitle}>{i18n.t("senders.title")}</Title>
      <Paper className={classes.mainPaper} variant="outlined">
        <MainHeaderButtonsWrapper>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => {
              setEditingSender(null);
              setSenderModalOpen(true);
            }}
          >
            {i18n.t("senders.buttons.new")}
          </Button>
        </MainHeaderButtonsWrapper>

        <SenderList
          senders={senders}
          loading={loading}
          error={error}
          onRetry={fetchData}
          onEditSender={sender => {
            setEditingSender(sender);
            setSenderModalOpen(true);
          }}
          onDeleteSender={handleDeleteSender}
        />
      </Paper>

      <CampaignModal
        open={campaignModalOpen}
        onClose={() => {
          setCampaignModalOpen(false);
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
        senders={senders}
        initialData={editingCampaign}
      />

      <SenderModal
        open={senderModalOpen}
        onClose={() => setSenderModalOpen(false)}
        onSave={editingSender ? handleUpdateSender : handleCreateSender}
        whatsapps={whatsapps}
        initialData={editingSender}
      />

      <QuickSendModal
        open={quickSendOpen}
        onClose={() => setQuickSendOpen(false)}
        onSend={handleQuickSend}
        senders={senders}
        clients={clients}
      />

      <ConfirmationModal
        open={Boolean(deleteCampaign)}
        title={i18n.t("campaigns.confirmDelete.title")}
        onClose={() => setDeleteCampaign(null)}
        onConfirm={() => {
          if (!deleteCampaign) return;
          const campaignId = deleteCampaign.id;
          setDeleteCampaign(null);
          handleDeleteCampaign(campaignId);
        }}
      >
        {i18n.t("campaigns.confirmDelete.message")}
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Campaigns;
