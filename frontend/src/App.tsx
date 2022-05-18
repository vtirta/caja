import React from 'react';
import {Container, Grid} from "@mui/material";
import NavBar from './components/NavBar';
import DispenserWidget from "./components/DispenserWidget";
import RedeemWidget from './components/RedeemWidget';
// import {ConnectSample} from './components/ConnectSample';
// import {CW20TokensSample} from './components/CW20TokensSample';
// import {NetworkSample} from './components/NetworkSample';
// import {QuerySample} from './components/QuerySample';
// import {SignBytesSample} from './components/SignBytesSample';
// import {SignSample} from './components/SignSample';
// import {TxSample} from './components/TxSample';
// import WalletHoldingsWidget from "./components/WalletHoldingsWidget";
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

const fonts = [
    'Press Start 2P',
    'Open Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
];

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#003FFF',
        },
        secondary: {
            main: '#FFC000',
        },
        background: {
            default: "#303030"
        }
    },
    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontFamily: fonts.join(','),
        button: {
            fontFamily: fonts.join(','),
            textTransform: 'none'
        },
        fontSize: 14,
    },
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <NavBar/>
            <Container sx={{flexGrow: 1}} style={{marginTop: 50}}>
                <Grid container justifyContent="center" spacing={2}>
                    <Grid item>
                        <DispenserWidget/>
                    </Grid>
                    <Grid item>
                        <RedeemWidget/>
                    </Grid>
                    {/*<Grid item xs={4}>*/}
                    {/*    <WalletHoldingsWidget/>*/}
                    {/*</Grid>*/}
                </Grid>
            </Container>

            {/*<ConnectSample/>*/}
            {/*<QuerySample/>*/}
            {/*<TxSample/>*/}
            {/*<SignSample/>*/}
            {/*<SignBytesSample/>*/}
            {/*<CW20TokensSample/>*/}
            {/*<NetworkSample/>*/}
        </ThemeProvider>
    );
}

export default App;
