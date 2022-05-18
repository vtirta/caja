import React, {useState} from 'react';
import {useMatch} from "react-router-dom";
import {Container, Grid, Link} from "@mui/material";
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
            main: '#FFC000',
        },
        secondary: {
            main: '#003FFF',
        },
        background: {
            default: "#303030"
        },
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
    let match = useMatch("/:code");
    const code = match?.params.code || "";

    const [showRedeem, setShowRedeem] = useState(!!code);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>

            <NavBar linkCode={code}/>

            <Container sx={{flexGrow: 1}} style={{marginTop: 50}}>

                <Grid container justifyContent="center" spacing={2}>
                    {!showRedeem &&
                        <Grid item sx={{textAlign: 'center'}}>
                            <DispenserWidget/>
                            <p>[<Link href="#" onClick={() => setShowRedeem(!showRedeem)}>I have code to redeem</Link>]</p>
                        </Grid>
                    }
                    {showRedeem &&
                        <Grid item sx={{textAlign: 'center'}}>
                            <RedeemWidget linkCode={code}/>
                            <p>[<Link href="#" onClick={() => setShowRedeem(!showRedeem)}>I want to send money</Link>]</p>
                        </Grid>
                    }
                </Grid>


                <Grid container justifyContent="center" sx={{marginTop: 10}}>
                    <Grid item sx={{textAlign: 'center'}}>
                        <h2>What is Caja?</h2>
                        <p>Give money to anyone using a link</p>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" sx={{marginTop: 10}}>
                    <Grid item sx={{textAlign: 'center'}}>
                        <h2>How it works</h2>
                        <ol style={{textAlign: 'left'}}>
                            <li>Connect your wallet [<Link href="#wallet">Don't have one?</Link>]</li>
                            <li>Deposit UST [<Link href="#ust">What is UST?</Link>]</li>
                            <li>Share generated link</li>
                            <li>Anyone with link can redeem</li>
                        </ol>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" sx={{marginTop: 10}}>
                    <Grid item sx={{textAlign: 'center'}}>
                        <a id="wallet"><h2>Setup Terra Wallet</h2></a>
                        <iframe width="640" height="480" src={'https://www.youtube.com/embed/4gnFM1CFbOk'}
                                frameBorder="0"
                                allowFullScreen title="How to setup a wallet video"/>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" sx={{marginTop: 10}}>
                    <Grid item sx={{textAlign: 'center'}}>
                        <a id="ust"><h2>What is UST / Luna?</h2></a>
                        <iframe width="640" height="480" src={'https://www.youtube.com/embed/U9lrH0loAns'}
                                frameBorder="0"
                                allowFullScreen title="How to setup a wallet video"/>
                    </Grid>
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
