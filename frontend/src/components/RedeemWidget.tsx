import React, {useContext, useState} from 'react';
import {useConnectedWallet} from '@terra-money/wallet-provider';
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

import BankContext from './Bank';
import * as execute from '../contract/execute';
import Typography from "@mui/material/Typography";
import {hash} from "../utils/helpers";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const fee = 0.20;

const RedeemWidget = ({linkCode}: { linkCode: string }) => {
    const connectedWallet = useConnectedWallet();
    const [updating, setUpdating] = useState(false)
    const {bank, refreshBalance} = useContext(BankContext);
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0.05);
    const [code, setCode] = useState(linkCode);

    const onClickRedeem = async () => {
        if (connectedWallet) {

            if (!code) {
                alert('Please enter a code to redeem');
                return;
            }

            const hashedCode = await hash(code);
            console.log("Redeem Code", code, hashedCode);

            setUpdating(true);

            try {
                const result = await execute.redeem(connectedWallet, hashedCode);
                console.log(result);

                refreshBalance();

                const successLog = result?.logs;

                console.log(successLog);

                if (successLog && successLog.length > 0) {
                    const uusdString: string | undefined = successLog.at(0)?.events?.at(0)?.attributes?.at(1)?.value;
                    if (uusdString) {
                        const amtStr = uusdString.slice(0, -4);
                        const amt = +amtStr;
                        console.log(amtStr);
                        const amountReceived: number = amt / 1000000;
                        setAmount(amountReceived);
                    } else {
                        setAmount(-1);
                    }
                } else {
                    alert('Code is invalid or has expired');
                }
            } catch (e) {
                alert('Code is invalid or has expired');
                console.error(e);
            } finally {
                setUpdating(false);
            }

        } else {
            alert('Please connect a terra wallet to redeem a cash link')
        }
    }

    return (
        <Card sx={{minWidth: 200, maxWidth: 400}}>
            <CardContent sx={{textAlign: 'center'}}>
                <h2>Redeem Link</h2>

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

                    <LoadingButton variant="contained" size="large" disableElevation
                                   endIcon={<AttachMoneyIcon />}
                                   loading={updating}
                                   loadingPosition="end"
                                   fullWidth
                                   style={{fontFamily: 'Press Start 2P', fontSize: 30}}
                                   sx={{marginTop: 2}}
                                   onClick={onClickRedeem}
                    >
                        Redeem
                    </LoadingButton>
                    <p>Fee: {fee.toFixed(2)} UST</p>
                </div>
                <Dialog
                    fullWidth
                    open={!!amount}
                >
                    <DialogContent sx={{textAlign: 'center'}}>
                        <h1>Coins Redeemed</h1>
                        {amount > 0
                            ? <>
                                <Typography sx={{fontSize: 80, textAlign: 'center', verticalAlign: 'baseline'}}>
                                    <div>{amount} <small style={{fontSize: 50}}>UST</small></div>
                                    {/*<div style={{fontSize: 50}}>(${(amount * price).toFixed(2)})</div>*/}
                                </Typography>
                                <p style={{fontSize: 20, textAlign: 'center'}}>Deposited into your wallet</p>
                            </>
                            : <p style={{fontSize: 20, textAlign: 'center'}}>Please check your wallet to confirm amount received</p>
                        }
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