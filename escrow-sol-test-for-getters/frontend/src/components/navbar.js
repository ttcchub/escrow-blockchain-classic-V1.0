import { ThemeProvider, AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import { Menu } from '@mui/icons-material';
// import { getBlockchain, showError } from "./utils/common.js";
import { showError } from "../utils/common";

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";



const NavBar = ({ blockchain }) => {
  // const [show, setShow] = useState(false);

  // const add = () => {
  //   setShow(true);
  // };
  // const handleClose = () => {
  //   setShow(false);
  // };

  // // const handleSubmit = async (e) => {
  // const escrow = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await blockchain.factory.createContract();
  //   } catch (error) {
  //     showError(error);
  //   }
  //   handleClose();
  // };






  // const getShares = async () => {
  //   const { DAOContract, signerAddress } = await getBlockchain();
  //   try {
  //     signerAddress &&
  //       setShares((await DAOContract.shares(signerAddress)).toString());
  //     setContributionEnd((await DAOContract.contributionEnd()).toNumber());
  //     setAvailableFunds((await DAOContract.availableFunds()).toString());
  //     signerAddress && setIsAdmin((await DAOContract.admin()) == signerAddress);
  //   } catch (error) {
  //     showError(error);
  //   }
  // };
  // useEffect(() => {
  //   getShares();
  // }, []);
  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  
// const testt, setAccount] = useState(null);
//   const test = window.ethereum.request({        
//     method: "eth_getBalance",        
//     params: [newAccount.toString(), "latest"],      
// });




  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", chainChanged);
    }
  }, []);

  const connectHandler = async () => {
    if (window.ethereum) {
      try {
        const res = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        await accountsChanged(res[0]);
      } catch (err) {
        console.error(err);
        setErrorMessage("There was a problem connecting to MetaMask");
      }
    } else {
      setErrorMessage("Install MetaMask");
    }
  };
  
  connectHandler();

  const accountsChanged = async (newAccount) => {
    setAccount(newAccount);
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [newAccount.toString(), "latest"],
      });
      setBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error(err);
      setErrorMessage("There was a problem connecting to MetaMask");
    }
    window.ethereum.on("accountsChanged", accountsChanged);
  };

  // accountsChanged(account);

  const chainChanged = () => {
    setErrorMessage(null);
    setAccount(null);
  };

  return (
<Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>
      <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
        <Typography             variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
          Escrow DAPP
        </Typography>
        <Typography variant="h6" component="div">
         Account: {account} 
        </Typography>
      </Toolbar>
    </AppBar>
    </Box>
    

  );
};

export default NavBar;