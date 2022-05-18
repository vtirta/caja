import React, {useContext, useState} from 'react';
import {useConnectedWallet} from '@terra-money/wallet-provider';
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

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BankContext from "./Bank";

const fee = 0.25;

const DispenserWidget = () => {
    const connectedWallet = useConnectedWallet();
    const [updating, setUpdating] = useState(false)
    const { bank, refreshBalance} = useContext(BankContext);
    const [code, setCode] = useState("")
    const [amount, setAmount] = useState(5)

    const onClickDispense = async () => {
        if (connectedWallet) {

            if (!bank) {
                return alert("Unable to load wallet");
            }

            if (bank?.get('uusd')?.amount.lessThanOrEqualTo((amount+fee)*1000000)) {
                return alert("You don't have enough UST in your wallet");
            }

            const newCode = generateCode(8);
            const hashedCode = await hash(newCode);

            setUpdating(true);
            try {
                console.log(amount);
                const result = await execute.dispense(connectedWallet, hashedCode, amount+fee);

                refreshBalance();

                const successLog = result?.logs;
                console.log(successLog);

                if (successLog && successLog.length > 0) {
                    setCode(newCode);
                    const uusdString: string | undefined = successLog.at(0)?.events?.at(0)?.attributes?.at(1)?.value;
                    if (uusdString) {
                        const amtStr = uusdString.slice(0, -4);
                        const amt = +amtStr;
                        console.log(amtStr);
                        const amountSpent: number = amt / 1000000;
                        setAmount(amountSpent);
                    } else {
                        setAmount(-1);
                    }
                } else {
                    console.error("Contract Execute error", result?.raw_log);
                    if (result?.raw_log.includes('insufficient funds')) {
                        alert("Insufficient funds, please try a smaller amount");
                    } else {
                        alert("Sorry, something went wrong");
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setUpdating(false);
            }
        } else {
            alert('Please connect a terra wallet to deposit UST to generate cash link')
        }
    }

    return (
        <Card sx={{minWidth: 200, maxWidth: 400}}>
            <CardContent sx={{textAlign: 'center'}}>
                <h2>Send Money Link</h2>

                <div style={{display: 'inline'}}>
                    <TextField id="outlined-basic"
                               type="number"
                               inputProps={{ inputMode: 'numeric', pattern: '[1-9]\\d*' }}
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
                               onChange={(e) => {
                                   const amt = +e.target.value;
                                   if (isNaN(amt) || amt < 1) {
                                       setAmount(1);
                                   } else {
                                       setAmount(+e.target.value);
                                   }
                               }}
                               onFocus={event => {
                                   event.target.select();
                               }}
                               value={amount}/>

                        <LoadingButton variant="contained" size="large" disableElevation
                                       endIcon={<AttachMoneyIcon />}
                                       loading={updating}
                                       loadingPosition="end"
                                       fullWidth
                                       style={{fontFamily: 'Press Start 2P', fontSize: 30}}
                                       sx={{marginTop: 2}}
                                       onClick={onClickDispense}
                        >
                            Deposit
                        </LoadingButton>
                        <p>Fee: {fee} UST</p>
                </div>

                <Dialog
                    fullWidth
                    maxWidth="xs"
                    open={!!code}
                    // onClose={handleClose}
                >
                    <DialogContent sx={{textAlign: 'center'}}>
                        <h1>Deposited</h1>

                        <p style={{fontSize: 20}}>UST {(amount-fee).toFixed(2)} + {fee}(fees)</p>
                        <p style={{fontSize: 14}}>into link</p>

                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`https://caja.money/${code}`)
                            }}
                            variant="outlined" size="large" sx={{
                            fontSize: 16,
                            color: 'white',
                            borderColor: 'white',
                        }}>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                                https://caja.money/{code}
                            </Box>
                            <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                                https://caja.money<br/>/{code}
                            </Box>
                        </Button>


                        {/*<p style={{fontSize: 14}}>Give this URL/code to a friend, a street musician, a hotel*/}
                        {/*    housekeeper, church offering box, or wherever $cash is needed!</p>*/}
                        {/*<p style={{fontSize: 12, fontStyle: 'italic'}}>NOTE: Unclaimed code will be returned to your*/}
                        {/*    wallet after*/}
                        {/*    3 days.</p>*/}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => { setCode(""); setAmount(5)}}>Done - I wrote it down!</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default DispenserWidget;