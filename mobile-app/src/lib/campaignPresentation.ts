import { CampaignStatus } from "../types/crm";
import { colors } from "../theme/colors";

const labels: Record<CampaignStatus, string> = {
  DRAFT: "Borrador",
  READY: "Lista",
  RUNNING: "Enviando",
  COMPLETED: "Completada",
  FAILED: "Con errores",
  CANCELED: "Cancelada"
};

export function campaignStatusLabel(status: CampaignStatus) {
  return labels[status] || status;
}

export function campaignStatusColor(status: CampaignStatus) {
  if (status === "COMPLETED") return colors.success;
  if (status === "FAILED" || status === "CANCELED") return colors.danger;
  if (status === "READY" || status === "RUNNING") return colors.accent;
  return colors.textMuted;
}
