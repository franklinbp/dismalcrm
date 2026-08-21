import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
  makeStyles,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    width: "100%",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  textQuickAnswerContainer: {
    width: "100%",
  },
}));

const QuickAnswerSchema = Yup.object().shape({
  shortcut: Yup.string()
    .min(2, "Too Short!")
    .max(15, "Too Long!")
    .required("Required"),
  message: Yup.string()
    .max(30000, "Too Long!")
    .nullable()
    .test("min-if-present", "Too Short!", (value) => {
      if (!value) return true;
      return value.length >= 2;
    }),
});

const QuickAnswersModal = ({
  open,
  onClose,
  quickAnswerId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    shortcut: "",
    message: "",
    mediaUrl: "",
    mediaName: "",
  };

  const [quickAnswer, setQuickAnswer] = useState(initialState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchQuickAnswer = async () => {
      if (initialValues) {
        setQuickAnswer((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!quickAnswerId) return;

      try {
        const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
        if (isMounted.current) {
          setQuickAnswer(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchQuickAnswer();
    setSelectedFile(null);
    setRemoveMedia(false);
  }, [quickAnswerId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setQuickAnswer(initialState);
    setSelectedFile(null);
    setRemoveMedia(false);
  };

  const handleSaveQuickAnswer = async (values) => {
    try {
      const hasExistingMedia = Boolean(quickAnswer?.mediaUrl);
      const hasMessage = Boolean(values.message && values.message.trim());
      const hasMedia = Boolean(selectedFile || (hasExistingMedia && !removeMedia));
      if (!hasMessage && !hasMedia) {
        toast.error(i18n.t("quickAnswersModal.errors.required"));
        return;
      }

      const formData = new FormData();
      formData.append("shortcut", values.shortcut);
      if (values.message !== undefined) {
        formData.append("message", values.message);
      }
      if (selectedFile) {
        formData.append("media", selectedFile);
      }
      if (removeMedia) {
        formData.append("removeMedia", "true");
      }

      if (quickAnswerId) {
        await api.put(`/quickAnswers/${quickAnswerId}`, formData);
        handleClose();
      } else {
        const { data } = await api.post("/quickAnswers", formData);
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {quickAnswerId
            ? `${i18n.t("quickAnswersModal.title.edit")}`
            : `${i18n.t("quickAnswersModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={quickAnswer}
          enableReinitialize={true}
          validationSchema={QuickAnswerSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickAnswer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.textQuickAnswerContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.shortcut")}
                    name="shortcut"
                    autoFocus
                    error={touched.shortcut && Boolean(errors.shortcut)}
                    helperText={touched.shortcut && errors.shortcut}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    fullWidth
                  />
                </div>
                <div className={classes.textQuickAnswerContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.message")}
                    name="message"
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    multiline
                    rows={5}
                    fullWidth
                  />
                </div>
                <div className={classes.textQuickAnswerContainer}>
                  <input
                    id="quick-answer-media"
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      setSelectedFile(file);
                      setRemoveMedia(false);
                    }}
                  />
                  <label htmlFor="quick-answer-media">
                    <Button variant="outlined" color="primary" component="span">
                      {i18n.t("quickAnswersModal.form.media")}
                    </Button>
                  </label>
                  {(selectedFile || (quickAnswer.mediaUrl && !removeMedia)) && (
                    <div style={{ marginTop: 8 }}>
                      <span>
                        {selectedFile
                          ? selectedFile.name
                          : quickAnswer.mediaName || quickAnswer.mediaUrl}
                      </span>
                      <Button
                        style={{ marginLeft: 8 }}
                        size="small"
                        color="secondary"
                        onClick={() => {
                          setSelectedFile(null);
                          if (quickAnswer.mediaUrl) {
                            setRemoveMedia(true);
                          }
                        }}
                      >
                        {i18n.t("quickAnswersModal.form.removeMedia")}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("quickAnswersModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {quickAnswerId
                    ? `${i18n.t("quickAnswersModal.buttons.okEdit")}`
                    : `${i18n.t("quickAnswersModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default QuickAnswersModal;
