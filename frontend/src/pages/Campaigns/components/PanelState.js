import React from "react";
import { Button, CircularProgress, Typography } from "@material-ui/core";

const PanelState = ({ loading, error, empty, emptyText, onRetry }) => {
  if (loading) {
    return (
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        {onRetry && (
          <Button style={{ marginTop: 8 }} variant="outlined" color="primary" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div style={{ padding: 16 }}>
        <Typography variant="body2" color="textSecondary">
          {emptyText}
        </Typography>
      </div>
    );
  }

  return null;
};

export default PanelState;
