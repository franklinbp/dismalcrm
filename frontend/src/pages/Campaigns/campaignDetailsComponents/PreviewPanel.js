import React from "react";
import { Button, Paper, TextField, makeStyles } from "@material-ui/core";
import Title from "../../../components/Title";
import { i18n } from "../../../translate/i18n";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(0.75),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(1)
  },
  grid: {
    display: "grid",
    gap: theme.spacing(1),
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
  }
}));

const PreviewPanel = ({ previewVars, previewRendered, onChangePreviewVars, onPreview }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <Title>{i18n.t("campaigns.preview.title")}</Title>
      <div className={classes.grid}>
        <TextField
          margin="dense"
          label={i18n.t("campaigns.preview.name")}
          value={previewVars.name}
          onChange={event => onChangePreviewVars({ name: event?.target?.value || "" })}
        />
        <TextField
          margin="dense"
          label={i18n.t("campaigns.preview.phone")}
          value={previewVars.phone}
          onChange={event => onChangePreviewVars({ phone: event?.target?.value || "" })}
        />
        <Button size="small" variant="outlined" color="primary" onClick={onPreview}>
          {i18n.t("campaigns.preview.button")}
        </Button>
      </div>
      <TextField
        fullWidth
        multiline
        rows={3}
        margin="dense"
        value={previewRendered}
        label={i18n.t("campaigns.preview.rendered")}
        InputProps={{ readOnly: true }}
      />
    </Paper>
  );
};

export default PreviewPanel;
