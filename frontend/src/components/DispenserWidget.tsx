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
    InputAdornment,
    TextField
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import * as execute from '../contract/execute';
import {generateCode, hash} from "../utils/helpers";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const DispenserWidget = () => {
    const connectedWallet = useConnectedWallet();
    const lcd = useLCDClient();
    const [updating, setUpdating] = useState(false)
    const [bank, setBank] = useState<Coins | null>(null);
    const [code, setCode] = useState("")
    const [amount, setAmount] = useState(5)

    useEffect(() => {
        if (connectedWallet) {
            lcd.bank.balance(connectedWallet.walletAddress).then(([coins]) => {
                setBank(coins);
            });
        } else {
            setBank(null);
        }
    }, [connectedWallet, lcd]);

    const onClickDispense = async () => {
        if (connectedWallet) {
            const newCode = generateCode(8);
            const hashedCode = await hash(newCode);
            console.log("Code", newCode, hashedCode);
            setUpdating(true);
            await execute.dispense(connectedWallet, hashedCode, amount);
            setUpdating(false);
            setCode(newCode);
        } else {
            alert('Please connect a terra wallet to deposit UST to generate cash link')
        }
    }

    return (
        <Card sx={{minWidth: 200, maxWidth: 400}}>
            <CardContent sx={{textAlign: 'center'}}>
                <h2>Generate Code</h2>

                <div style={{display: 'inline'}}>
                    <TextField id="outlined-basic"
                               variant="outlined"
                               fullWidth
                               InputProps={{
                                   style: {fontSize: 30},
                                   startAdornment: <InputAdornment position="start"><span
                                       style={{fontSize: 30}}>$</span></InputAdornment>,
                                   endAdornment: <InputAdornment position="end"><span
                                       style={{fontSize: 30}}>UST</span></InputAdornment>,
                               }}
                               InputLabelProps={{style: {fontSize: 30}}}
                               onChange={(e) => setAmount(+e.target.value)}
                               onFocus={event => {
                                   event.target.select();
                               }}
                               value={amount}/>
                    {!updating &&
                        <Button variant="contained" size="large" disableElevation fullWidth
                                onClick={onClickDispense}
                                style={{fontFamily: 'Press Start 2P', fontSize: 30}}
                                sx={{marginTop: 2}}>
                            Deposit
                        </Button>
                    }

                    {updating &&
                        <LoadingButton loading variant="outlined" size="large" disableElevation
                                       fullWidth
                                       style={{fontFamily: 'Press Start 2P', fontSize: 30}}
                                       sx={{marginTop: 2}}>
                            Depositing ...
                        </LoadingButton>
                    }
                </div>

                <Dialog
                    fullWidth
                    open={!!code}
                    // onClose={handleClose}
                >
                    <DialogContent>
                        <h1>Code generated</h1>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`https://caja.money/${code}`)
                            }}
                            // startIcon={<ContentCopyIcon/>}
                            variant="outlined" size="large" sx={{
                            fontSize: 18,
                            color: 'white',
                            borderColor: 'white',
                        }}>https://caja.money/{code}</Button>
                        <p style={{fontSize: 14}}>Give this URL/code to a friend, a street musician, a hotel
                            housekeeper, church offering box, or wherever $cash is needed!</p>
                        <p style={{fontSize: 12, fontStyle: 'italic'}}>NOTE: Unclaimed code will be returned to your
                            wallet after
                            3 days.</p>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setCode("")}>Done, I wrote it down!</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default DispenserWidget;