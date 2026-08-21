import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,

	},

	settingOption: {
		marginLeft: "auto",
	},
	section: {
		display: "block",
		padding: theme.spacing(2),
		marginBottom: 12,
	},
	field: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	margin: {
		margin: theme.spacing(1),
	},

}));

const Settings = () => {
	const classes = useStyles();

	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("settings", data => {
			if (data.action === "update") {
				setSettings(prevState => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex(s => s.key === data.setting.key);
					if (settingIndex === -1) {
						aux.push(data.setting);
						return aux;
					}
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleLocalSettingChange = e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		setSettings(prevState => {
			const aux = [...prevState];
			const settingIndex = aux.findIndex(s => s.key === settingKey);
			if (settingIndex === -1) {
				aux.push({ key: settingKey, value: selectedValue });
				return aux;
			}
			aux[settingIndex] = { ...aux[settingIndex], value: selectedValue };
			return aux;
		});
	};

	const handlePersistMetaSettings = async () => {
		const metaSettings = [
			"metaVerifyToken",
			"metaAppId",
			"metaAppSecret",
			"metaGraphVersion",
		];

		try {
			await Promise.all(
				metaSettings.map(settingKey =>
					api.put(`/settings/${settingKey}`, {
						value: getSettingValue(settingKey),
					})
				)
			);
			toast.success("Configuracion Meta guardada correctamente.");
		} catch (err) {
			toastError(err);
		}
	};

	const handlePersistBotSettings = async () => {
		const botSettings = [
			"autoReplyRules",
			"autoReplyDefaultResponse",
			"autoReplyOncePerTicket",
		];

		try {
			await Promise.all(
				botSettings.map(settingKey =>
					api.put(`/settings/${settingKey}`, {
						value: getSettingValue(settingKey),
					})
				)
			);
			toast.success("Configuracion del bot guardada correctamente.");
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = key => {
		const setting = settings.find(s => s.key === key);
		return setting ? setting.value : "";
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>
				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.userCreation.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="userCreation-setting"
						name="userCreation"
						value={
							settings && settings.length > 0 && getSettingValue("userCreation")
						}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.userCreation.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.userCreation.options.disabled")}
						</option>
					</Select>

				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="api-token-setting"
						readonly
						label="Token Api"
						margin="dense"
						variant="outlined"
						fullWidth
						value={settings && settings.length > 0 && getSettingValue("userApiToken")}
					/>
				</Paper>

				<Paper className={classes.section}>
					<Typography variant="body1" gutterBottom>
						Meta Messenger e Instagram
					</Typography>
					<Typography variant="body2" color="textSecondary" gutterBottom>
						Configura aqui la app de Meta. Las paginas y cuentas se agregan en Conexiones.
					</Typography>
					<Divider />
					<Box mt={1}>
						<TextField
							id="meta-verify-token-setting"
							name="metaVerifyToken"
							label="Verify Token"
							margin="dense"
							variant="outlined"
							fullWidth
							className={classes.field}
							value={getSettingValue("metaVerifyToken")}
							onChange={handleLocalSettingChange}
							helperText="Debe ser igual al token usado en el webhook de Meta."
						/>
						<TextField
							id="meta-app-id-setting"
							name="metaAppId"
							label="Meta App ID"
							margin="dense"
							variant="outlined"
							fullWidth
							className={classes.field}
							value={getSettingValue("metaAppId")}
							onChange={handleLocalSettingChange}
						/>
						<TextField
							id="meta-app-secret-setting"
							name="metaAppSecret"
							label="Meta App Secret"
							type="password"
							margin="dense"
							variant="outlined"
							fullWidth
							className={classes.field}
							value={getSettingValue("metaAppSecret")}
							onChange={handleLocalSettingChange}
						/>
						<TextField
							id="meta-graph-version-setting"
							name="metaGraphVersion"
							label="Version Graph API"
							margin="dense"
							variant="outlined"
							fullWidth
							className={classes.field}
							value={getSettingValue("metaGraphVersion") || "v13.0"}
							onChange={handleLocalSettingChange}
							helperText="Ejemplo: v13.0. Cambiar solo si se valida previamente."
						/>
						<Box mt={1} display="flex" justifyContent="flex-end">
							<Button
								variant="contained"
								color="primary"
								onClick={handlePersistMetaSettings}
							>
								Guardar configuracion Meta
							</Button>
						</Box>
					</Box>
				</Paper>

				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.autoReplyEnabled.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="autoReplyEnabled-setting"
						name="autoReplyEnabled"
						value={getSettingValue("autoReplyEnabled") || "disabled"}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.autoReplyEnabled.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.autoReplyEnabled.options.disabled")}
						</option>
					</Select>
				</Paper>

				<Paper className={classes.paper}>
					<Typography variant="body1">
						Enviar menu inicial una sola vez por ticket
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="autoReplyOncePerTicket-setting"
						name="autoReplyOncePerTicket"
						value={getSettingValue("autoReplyOncePerTicket") || "enabled"}
						className={classes.settingOption}
						onChange={handleLocalSettingChange}
					>
						<option value="enabled">Habilitado</option>
						<option value="disabled">Deshabilitado</option>
					</Select>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="auto-reply-rules-setting"
						name="autoReplyRules"
						label={i18n.t("settings.settings.autoReplyRules.name")}
						margin="dense"
						variant="outlined"
						fullWidth
						multiline
						rows={7}
						value={getSettingValue("autoReplyRules")}
						onChange={handleLocalSettingChange}
						helperText={`${i18n.t("settings.settings.autoReplyRules.helper")} Tambien puedes enviar una respuesta rapida con adjunto usando: 1,office=>@quick:Office365`}
					/>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="auto-reply-default-response-setting"
						name="autoReplyDefaultResponse"
						label="Mensaje inicial o menu del bot"
						margin="dense"
						variant="outlined"
						fullWidth
						multiline
						rows={6}
						value={getSettingValue("autoReplyDefaultResponse")}
						onChange={handleLocalSettingChange}
						helperText="Se envia cuando el bot esta habilitado y no encuentra una regla. Recomendado: usarlo como menu inicial con opciones 1, 2, 3."
					/>
				</Paper>

				<Box mt={1} mb={2} display="flex" justifyContent="flex-end">
					<Button
						variant="contained"
						color="primary"
						onClick={handlePersistBotSettings}
					>
						Guardar configuracion del bot
					</Button>
				</Box>

			</Container>
		</div>
	);
};

export default Settings;
