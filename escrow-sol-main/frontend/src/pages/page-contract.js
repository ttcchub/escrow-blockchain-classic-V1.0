import { Button, Paper, Stack, Typography, TextField, Grid, Box } from "@mui/material";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
// import { Home } from './page-home';
import { showError, getBlockchain } from "../utils/common";
import { array } from './page-home';


function Contract({ blockchain }) {

  const [newEscrow, setNewEscrow] = useState({
    seller: '',
    buyer: '',
    percentage: '',
    blockNumber: ''
  });
  const [amount, setAmount] = useState(0);
  // getters
  const [blockNumber, setBlockNumber] = useState(0);
  const [expiration, setExpiration] = useState('exp');
  const [balance, setBalance] = useState(0);
  const [sAmount, setSAmount] = useState(0);
  const [feeAmount, setFeeAmount] = useState(0);
  const [sellerCancelled, setSellerCanceled] = useState(0);
  const [buyerCancelled, setBuyerCancelled] = useState(0);
  const [sellerApproved, setSellerApproved] = useState(0);
  const [buyerApproved, BuyerApproved] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [contractAddress, setContractAddress] = useState(0);
  const [escrowStatus, setEscrowStatus] = useState(0);
  const [escrowID, setEscrowID] = useState(0);
  //close
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  const Escrow = array[0];

  const initEscrow = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      try {
      await Escrow.initEscrow(newEscrow.seller, newEscrow.buyer, newEscrow.percentage, newEscrow.blockNumber);
    } 
    catch (error) {
      showError(error);
    }
    handleClose();
  }};

  const parseEth = (n) => {
    return ethers.utils.parseUnits(n.toString(), 18)
  }

  const formatEth = (n) => {
    return ethers.utils.formatUnits(n.toString(), 18)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  }

  const depositToEscrow = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      try {
      await Escrow.depositToEscrow({ value: parseEth(amount) });
      await Escrow.totalEscrowBalance();
    } 
    catch (error) {
      showError(error);
    }
    handleClose();
  }};

  const approve = async () => {
    if (window.ethereum) {
      try {
      await Escrow.approveEscrow();
      await Escrow.checkEscrowStatus();
    } 
    catch (error) {
      showError(error);
    }
  }};

  const cancelEscrow = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      try {
      await Escrow.cancelEscrow();
      await Escrow.totalEscrowBalance();
    } 
    catch (error) {
      showError(error);
    }
    handleClose();
  }};

  const endEscrow = async (e) => {
    e.preventDefault();
    if (window.ethereum) {
      try {
      await Escrow.endEscrow();
    } 
    catch (error) {
      showError(error);
    }
    handleClose();
  }};

  const handleChange = async (e) => {
    const {name, value} = e.target
    setNewEscrow((prev) => {
      return{...prev, [name]: value }
    })
  }

  // getter functions
  useEffect(() => {

    function configDeposits(item, index, array) {
      array[index] = `${formatEth(item)}, `;

    }
    (async () => {
      const bNumber = await Escrow.getBlockNumber();
      setBlockNumber(bNumber.toNumber());
      const exp = await Escrow.hasEscrowExpired();
      setExpiration(exp.toString());
      const tBalance = await Escrow.totalEscrowBalance();
      setBalance(tBalance.toString());
      const sellAmount = await Escrow.getSellerAmount();
      setSAmount(sellAmount.toString());
      const feeAmount = await Escrow.getFeeAmount();
      setFeeAmount(feeAmount.toString());
      const sellerCancelled = await Escrow.hasSellerCancelled();
      setSellerCanceled(sellerCancelled.toString());
      const buyerCancelled = await Escrow.hasBuyerCancelled();
      setBuyerCancelled(buyerCancelled.toString());
      const sellerApproved = await Escrow.hasSellerApproved();
      setSellerApproved(sellerApproved.toString());
      const buyerApproved = await Escrow.hasBuyerApproved();
      BuyerApproved(buyerApproved.toString());

      const allDeposits = await Escrow.getAllDeposits();
      const reloadAllDeposits = [...allDeposits];
      reloadAllDeposits.forEach(configDeposits);
      setDeposits(reloadAllDeposits);

      const cAddress = await Escrow.getEscrowContractAddress();
      setContractAddress(cAddress.toString());
      const status = await Escrow.checkEscrowStatus();
      if (status === 0){
        setEscrowStatus('Uninitialized');
      } else if (status === 1){
        setEscrowStatus('Initialized');
      } else if (status === 2){
        setEscrowStatus('Buyer Deposited');
      } else if (status === 3){
        setEscrowStatus('Service Approved');
      } else if (status === 4){
        setEscrowStatus('Escrow Complete');
      } else if (status === 5){
        setEscrowStatus('Escrow Cancelled');
      } else setEscrowStatus('error');
      const escrowID = await Escrow.getEscrowID();
      setEscrowID(escrowID.toString());
    })();
  }, [Escrow]);

  return (
    <div>
    <div className="App">
      <header className="App-header">
      {/* <ThemeProvider theme={theme}> */}
        <Typography variant="h3" p={5} pb={6} color="common.white" >
          Escrow Contract Options
        </Typography>
        <Box sx={{ padding: 5 }}>
          <Typography color="common.white">
                Contract Address: {contractAddress}
            </Typography>
          <Typography color="common.white">
                Escrow ID: {escrowID}
          </Typography>
        </Box>
        <Grid container sx={{ justifyContent: 'center' }}>
        <Grid item sx={12} md={6} lg={5}>
          <Typography className='data' color="common.white">
              Current block number: {blockNumber}  
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Has Escrow Expired: {expiration}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Balance: {formatEth(balance)}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Fee Amount: {formatEth(feeAmount)}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Seller Cancelled: {sellerCancelled}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Buyer Cancelled: {buyerCancelled}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Seller Approved: {sellerApproved}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Seller Amount: {formatEth(sAmount)}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Buyer Approved: {buyerApproved}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Deposits: {deposits}
          </Typography>
        </Grid>
        <Grid item sx={12} md={6} lg={5}>
          <Typography color="common.white">
              Status: {escrowStatus}
          </Typography>
        </Grid>
        </Grid>
        <Grid container sx={{ justifyContent: 'center' }}>
          <Box sx={{ width: 300,'& button': { m: 2 } }} >
            <form noValidate autoComplete='off' onSubmit={handleSubmit} >
              <TextField 
                onChange={handleChange}
                name='seller'
                id="outlined-basic" 
                label="Seller Address" 
                variant="outlined" 
                />
              <TextField 
                onChange={handleChange}
                name='buyer'
                id="outlined-basic" 
                label="Buyer Address" 
                variant="outlined" 
                />
              <TextField 
                onChange={handleChange}
                name='percentage'
                id="outlined-basic" 
                label="Fee Percentage" 
                variant="outlined" 
                />
              <TextField 
                onChange={handleChange}
                name='blockNumber'
                id="outlined-basic" 
                label="Block Number" 
                variant="outlined" 
                />
              <Button variant='contained' 
                onClick={initEscrow}
                type='submit' 
                >
              Init Escrow
              </Button>
            </form>

              <Typography variant="h5" p={5} pb={1} color="common.white">
                Buyer Deposit
              </Typography>

              <TextField 
                // onChange={handleChange}
                name='deposit'
                onChange={(e) => setAmount(e.target.value)}
                // onChange={(e) => setNewEscrow(e.target.value)}
                id="outlined-basic" 
                label="Deposit Amount" 
                variant="outlined" 
                />
              <Button variant='contained' onClick={depositToEscrow} >Buyer Deposit</Button>
              <Button variant='contained' onClick={approve} >Escrow Approval</Button>
              <Button variant='contained' onClick={cancelEscrow} >Cancel Escrow</Button>
              <Button variant='contained' onClick={endEscrow} >End Escrow</Button>
              <Box sx={{ p:10 }}/>
            </Box>
          </Grid>
      </header>
    </div>
    </div>
  );
}

// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 10, 100000000

export default Contract;
