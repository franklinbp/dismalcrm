import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	mediaError: {
		width: 250,
		minHeight: 96,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(2),
		boxSizing: "border-box",
		backgroundColor: "#fff4f2",
		border: "1px solid #fecdca",
		borderRadius: 8,
		color: "#b42318",
		fontSize: 12,
		textAlign: "center",
	},
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		if (!imageUrl) return;
		let isMounted = true;
		let objectUrl = "";
		setFetching(true);
		setLoadError(false);
		const fetchImage = async () => {
			try {
				const response = await fetch(imageUrl, { credentials: "include" });
				if (!response.ok) {
					throw new Error("Failed to load image");
				}
				const blob = await response.blob();
				if (!isMounted) return;
				objectUrl = window.URL.createObjectURL(blob);
				setBlobUrl(objectUrl);
			} catch (_error) {
				if (!isMounted) return;
				setBlobUrl("");
				setLoadError(true);
			} finally {
				if (isMounted) {
					setFetching(false);
				}
			}
		};
		fetchImage();
		return () => {
			isMounted = false;
			if (objectUrl) {
				window.URL.revokeObjectURL(objectUrl);
			}
		};
	}, [imageUrl]);

	if (loadError) {
		return (
			<div className={classes.mediaError}>
				Imagen no disponible en el servidor.
			</div>
		);
	}

	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={fetching ? imageUrl : blobUrl}
			medium={fetching ? imageUrl : blobUrl}
			large={fetching ? imageUrl : blobUrl}
			alt="image"
		/>
	);
};

export default ModalImageCors;
