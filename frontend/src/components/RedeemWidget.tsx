import React, {useEffect, useState} from 'react';
import {Coins} from "@terra-money/terra.js";
import {useConnectedWallet, useLCDClient} from '@terra-money/wallet-provider';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import * as execute from '../contract/execute';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Typography from "@mui/material/Typography";

const RedeemWidget = () => {
    const connectedWallet = useConnectedWallet();
    const lcd = useLCDClient();
    const [updating, setUpdating] = useState(false)
    const [bank, setBank] = useState<Coins | null>(null);
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0.05);
    const [code, setCode] = useState("")
    useEffect(() => {
        if (connectedWallet) {
            lcd.bank.balance(connectedWallet.walletAddress).then(([coins]) => {
                setBank(coins);
            });
        } else {
            setBank(null);
        }
    }, [connectedWallet, lcd]);

    const onClickRedeem = async () => {
        if (connectedWallet) {
            setUpdating(true);
            await execute.redeem(connectedWallet, code);
            setUpdating(false);
            setAmount(5);
        }
    }

    return (
        <Card sx={{minWidth: 200, maxWidth: 400}}>
            <CardContent sx={{textAlign: 'center'}}>
                <h2>Redeem Code</h2>
                {connectedWallet && (
                    <div style={{display: 'inline'}}>
                        <TextField id="outlined-basic"
                                   variant="outlined"
                                   fullWidth
                                   color="secondary"
                                   InputProps={{
                                       style: {fontSize: 30},
                                   }}
                                   InputLabelProps={{style: {fontSize: 30}}}
                                   onChange={(e) => setCode(e.target.value)}
                                   onFocus={event => {
                                       event.target.select();
                                   }}
                                   placeholder="Enter code"
                                   value={code}/>
                        {!updating &&
                            <Button variant="contained" size="large" disableElevation fullWidth
                                    onClick={onClickRedeem}
                                    color="secondary"
                                    style={{fontSize: 30}}
                                    sx={{marginTop: 2}}>
                                Redeem
                            </Button>
                        }

                        {updating &&
                            <LoadingButton loading variant="outlined" size="large" disableElevation
                                           fullWidth
                                           style={{fontSize: 30}}
                                           sx={{marginTop: 2}}>
                                Redeeming your coins...
                            </LoadingButton>
                        }
                    </div>
                )}
                <Dialog
                    fullWidth
                    open={!!amount}
                >
                    <DialogContent sx={{textAlign: 'center'}}>
                        <h1>Coins Redeemed</h1>
                        <p style={{fontSize: 20, textAlign: 'center'}}>Amount deposited into your wallet:</p>
                        <Typography sx={{fontSize: 80, textAlign: 'center', verticalAlign: 'baseline'}}>
                            <div>{amount} <small style={{fontSize: 50}}>UST</small></div>
                            <div style={{fontSize: 50}}>(${(amount * price).toFixed(2)})</div>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => {
                            setCode("");
                            setAmount(0);
                        }}>Close</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default RedeemWidget;