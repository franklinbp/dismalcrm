import React, { useState, useContext } from "react";
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Paper,
} from '@material-ui/core';

import { Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";

// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyleft "}
// 			<Link color="inherit" href="https://github.com/canove">
// 				Canove
// 			</Link>{" "}
// 			{new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(4, 2),
    background:
      theme.palette.type === "dark"
        ? theme.palette.background.default
        : "radial-gradient(circle at top, #FFFFFF 0%, #F4F6FB 45%, #E9EEF5 100%)",
  },
  card: {
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    animation: "$fadeIn 600ms ease-out",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  logo: {
    width: 160,
    height: "auto",
  },
  title: {
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(8px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Paper className={classes.card} elevation={1}>
          <div className={classes.brand}>
            <img src="/dismalcrm-mark.png" alt="DismalCRM" className={classes.logo} />
            <Typography component="h1" variant="h5" className={classes.title}>
              {i18n.t("login.title")}
            </Typography>
          </div>
          <form className={classes.form} noValidate onSubmit={handlSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={i18n.t("login.form.email")}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((e) => !e)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
          </form>
        </Paper>
        <Box mt={8}>{/* <Copyright /> */}</Box>
      </Container>
    </div>
  );
};

export default Login;

