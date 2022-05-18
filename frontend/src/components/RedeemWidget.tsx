import React, {useEffect, useState} from 'react';
import {Coins} from "@terra-money/terra.js";
import {useConnectedWallet, useLCDClient} from '@terra-money/wallet-provider';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    TextField
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import * as execute from '../contract/execute';
import Typography from "@mui/material/Typography";
import {generateCode, hash} from "../utils/helpers";

const RedeemWidget = ({linkCode}: { linkCode: string }) => {
    const connectedWallet = useConnectedWallet();
    const lcd = useLCDClient();
    const [updating, setUpdating] = useState(false)
    const [bank, setBank] = useState<Coins | null>(null);
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0.05);
    const [code, setCode] = useState(linkCode);
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

            if (!code) {
                alert('Please enter a code to redeem');
                return;
            }

            const hashedCode = await hash(code);
            console.log("Redeem Code", code, hashedCode);

            setUpdating(true);
            await execute.redeem(connectedWallet, hashedCode);
            setUpdating(false);
            setAmount(5);
        } else {
            alert('Please connect a terra wallet to redeem a cash link')
        }
    }

    return (
        <Card sx={{minWidth: 200, maxWidth: 400}}>
            <CardContent sx={{textAlign: 'center'}}>
                <h2>Redeem Code</h2>

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
                                color="primary"
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