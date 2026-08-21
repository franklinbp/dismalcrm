import React, { useEffect, useMemo, useState } from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";
import PanelState from "./components/PanelState";
import DraftForm from "./campaignDetailsComponents/DraftForm";
import MetricsPanel from "./campaignDetailsComponents/MetricsPanel";
import RecipientsPanel from "./campaignDetailsComponents/RecipientsPanel";
import PreviewPanel from "./campaignDetailsComponents/PreviewPanel";
import ContactSelectModal from "./campaignDetailsComponents/ContactSelectModal";
import ClientSelectModal from "./campaignDetailsComponents/ClientSelectModal";

const useStyles = makeStyles(() => ({
  rootState: {
    marginTop: 8
  }
}));

const CampaignDetails = () => {
  const classes = useStyles();
  const history = useHistory();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [senders, setSenders] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [csvRecipients, setCsvRecipients] = useState([]);
  const [manualRecipient, setManualRecipient] = useState({ name: "", phone: "" });
  const [attachment, setAttachment] = useState(null);

  const [previewVars, setPreviewVars] = useState({ name: "", phone: "" });
  const [previewRendered, setPreviewRendered] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [draftForm, setDraftForm] = useState({
    name: "",
    messageBody: "",
    senderMode: "SINGLE",
    senderId: "",
    ratePerMin: "",
    scheduleAt: ""
  });

  const fetchData = async () => {
    setLoading(true);
    setPageError("");

    try {
      const [campaignRes, sendersRes, recipientsRes, metricsRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get("/senders"),
        api.get(`/campaigns/${campaignId}/recipients`),
        api.get(`/campaigns/${campaignId}/metrics`)
      ]);

      const campaignData = campaignRes.data;
      setCampaign(campaignData);
      setSenders(sendersRes.data || []);
      setRecipients(recipientsRes.data || []);
      setMetrics(metricsRes.data || null);
      setAttachment(campaignData.mediaUrl ? { name: campaignData.mediaUrl, fromServer: true } : null);

      setDraftForm({
        name: campaignData.name || "",
        messageBody: campaignData.messageBody || "",
        senderMode: campaignData.senderMode || "SINGLE",
        senderId: campaignData.senderId || "",
        ratePerMin: campaignData.ratePerMin || "",
        scheduleAt: campaignData.scheduleAt
          ? new Date(campaignData.scheduleAt).toISOString().slice(0, 16)
          : ""
      });
    } catch (err) {
      setPageError("Could not load campaign details.");
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const handleUpdateDraft = async () => {
    try {
      const payload = {
        name: draftForm.name,
        messageBody: draftForm.messageBody,
        senderMode: draftForm.senderMode,
        senderId: draftForm.senderId ? Number(draftForm.senderId) : null,
        ratePerMin: draftForm.ratePerMin ? Number(draftForm.ratePerMin) : null,
        scheduleAt: draftForm.scheduleAt ? new Date(draftForm.scheduleAt) : null
      };

      const { data } = await api.put(`/campaigns/${campaignId}`, payload);
      setCampaign(data);
      toast.success(i18n.t("campaigns.toasts.updated"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleImportRecipients = async recipientsToImport => {
    try {
      await api.post(`/campaigns/${campaignId}/recipients`, recipientsToImport);
      toast.success(i18n.t("campaigns.recipients.imported"));
      setContactModalOpen(false);
      setClientModalOpen(false);
      setCsvRecipients([]);
      fetchData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleCsvFile = async event => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed = lines
      .map(line => {
        const parts = line.split(/[,;\t]/).map(part => part.trim());
        const phone = parts[0];
        const name = parts[1] || "";

        if (!phone || phone.toLowerCase() === "phone") {
          return null;
        }

        return { phoneE164: phone, name };
      })
      .filter(Boolean);

    setCsvRecipients(parsed);
  };

  const handlePreview = async () => {
    try {
      const { data } = await api.post(`/campaigns/${campaignId}/preview`, {
        name: previewVars.name,
        phone: previewVars.phone
      });

      setPreviewRendered(data.rendered || "");
    } catch (err) {
      toastError(err);
    }
  };

  const handleAddManualRecipient = async () => {
    const name = manualRecipient.name.trim();
    const phone = manualRecipient.phone.trim();

    if (!name || !phone) {
      toast.error(i18n.t("campaigns.recipients.manualRequired"));
      return;
    }

    if (!phone.startsWith("+")) {
      toast.error(i18n.t("campaigns.recipients.manualPhoneHelp"));
      return;
    }

    await handleImportRecipients([{ phoneE164: phone, name }]);
    setManualRecipient({ name: "", phone: "" });
  };

  const handleAttachments = event => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    api
      .post(`/campaigns/${campaignId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then(response => {
        setCampaign(response.data);
        setAttachment({ name: file.name, fromServer: false });
        toast.success(i18n.t("campaigns.toasts.mediaUploaded"));
      })
      .catch(err => toastError(err));
  };

  const recipientsCount = recipients.length || 0;
  const onlineSenders = senders.filter(sender => sender.status === "online").length;
  const ratePerMinValue = draftForm.ratePerMin ? Number(draftForm.ratePerMin) : null;

  const effectiveRate = useMemo(() => {
    if (ratePerMinValue && draftForm.senderMode === "ROUND_ROBIN" && onlineSenders > 1) {
      return ratePerMinValue * onlineSenders;
    }

    return ratePerMinValue;
  }, [draftForm.senderMode, onlineSenders, ratePerMinValue]);

  const estimatedMinutes =
    effectiveRate && recipientsCount > 0 ? Math.ceil(recipientsCount / effectiveRate) : null;

  const handleReady = async () => {
    try {
      const { data } = await api.post(`/campaigns/${campaignId}/ready`);
      setCampaign(data);
      toast.success(i18n.t("campaigns.toasts.ready"));
      fetchData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleCancel = async () => {
    try {
      const { data } = await api.post(`/campaigns/${campaignId}/cancel`);
      setCampaign(data);
      toast.success(i18n.t("campaigns.toasts.canceled"));
      fetchData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
      history.push("/campaigns");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicate = async () => {
    try {
      const { data } = await api.post(`/campaigns/${campaignId}/duplicate`);
      toast.success(i18n.t("campaigns.toasts.duplicated"));
      history.push(`/campaigns/${data.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  if (loading) {
    return (
      <MainContainer>
        <div className={classes.rootState}>
          <PanelState loading error="" empty={false} />
        </div>
      </MainContainer>
    );
  }

  if (pageError || !campaign) {
    return (
      <MainContainer>
        <div className={classes.rootState}>
          <PanelState loading={false} error={pageError || "Campaign not found."} empty={false} onRetry={fetchData} />
        </div>
      </MainContainer>
    );
  }

  const isDraft = campaign.status === "DRAFT";
  const isReadyEnabled =
    isDraft &&
    draftForm.name.trim().length > 0 &&
    draftForm.messageBody.trim().length > 0 &&
    recipientsCount > 0 &&
    (draftForm.senderMode !== "SINGLE" || Boolean(draftForm.senderId));

  return (
    <MainContainer>
      <MainHeader>
        <Title>{campaign.name}</Title>
        <MainHeaderButtonsWrapper>
          <Button size="small" onClick={() => history.push("/campaigns")}>
            {i18n.t("campaigns.buttons.back")}
          </Button>
          <Button size="small" onClick={() => setDeleteOpen(true)} color="secondary">
            {i18n.t("campaigns.buttons.delete")}
          </Button>
          <Button size="small" onClick={handleDuplicate}>
            {i18n.t("campaigns.buttons.duplicate")}
          </Button>
          {campaign.status !== "CANCELED" && campaign.status !== "COMPLETED" && (
            <Button size="small" onClick={handleCancel} color="secondary">
              {i18n.t("campaigns.buttons.cancel")}
            </Button>
          )}
          {isDraft && (
            <Button
              size="small"
              onClick={handleReady}
              color="primary"
              variant="contained"
              disabled={!isReadyEnabled}
            >
              {i18n.t("campaigns.buttons.ready")}
            </Button>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <DraftForm
        isDraft={isDraft}
        draftForm={draftForm}
        senders={senders}
        attachment={attachment}
        recipientsCount={recipientsCount}
        estimatedMinutes={estimatedMinutes}
        onChange={partial => setDraftForm(prev => ({ ...prev, ...partial }))}
        onSave={handleUpdateDraft}
        onUploadAttachment={handleAttachments}
      />

      <MetricsPanel metrics={metrics} loading={false} error="" onRetry={fetchData} />

      <RecipientsPanel
        isDraft={isDraft}
        recipients={recipients}
        recipientsLoading={false}
        recipientsError=""
        onRetry={fetchData}
        csvRecipients={csvRecipients}
        manualRecipient={manualRecipient}
        onOpenContacts={() => setContactModalOpen(true)}
        onOpenClients={() => setClientModalOpen(true)}
        onCsvFile={handleCsvFile}
        onImportCsv={() => handleImportRecipients(csvRecipients)}
        onChangeManualRecipient={partial => setManualRecipient(prev => ({ ...prev, ...partial }))}
        onAddManualRecipient={handleAddManualRecipient}
      />

      <PreviewPanel
        previewVars={previewVars}
        previewRendered={previewRendered}
        onChangePreviewVars={partial => setPreviewVars(prev => ({ ...prev, ...partial }))}
        onPreview={handlePreview}
      />

      <ContactSelectModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onImport={handleImportRecipients}
      />

      <ClientSelectModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onImport={handleImportRecipients}
      />

      <ConfirmationModal
        open={deleteOpen}
        title={i18n.t("campaigns.confirmDelete.title")}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          handleDelete();
        }}
      >
        {i18n.t("campaigns.confirmDelete.message")}
      </ConfirmationModal>
    </MainContainer>
  );
};

export default CampaignDetails;
