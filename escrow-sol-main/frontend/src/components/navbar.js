import './navbar.css';
import { AppBar, Toolbar, Button, Typography, Box, Select, MenuItem, Link } from '@mui/material'
// import { getBlockchain, showError } from "./utils/common.js";
import { showError } from "../utils/common";
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Blockies from 'react-blockies';
import config from '../config';

const NavBar = ({ blockchain }) => {

  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainID, setchainID] = useState("0x7A69");

  const navigate = useNavigate();

  const loadChainId = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    setchainID(chainId);
  }

  useEffect(() => {
    loadChainId()
  })
  
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", chainChanged);
    }
  }, []);


  const accountsChanged = async (newAccount) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [newAccount.toString(), "latest"],
      });
      setAccount(newAccount.toString());
      setBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error(err);
      setErrorMessage("There was a problem connecting to MetaMask");
    }
    window.ethereum.on("accountsChanged", accountsChanged)
  };

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
  
  useEffect(() => {
    connectHandler();
  })

  const chainChanged = () => {
    setErrorMessage(null);
    setAccount(null);
  };

  const networkHandler = async (event) => {
    await window.ethereum.request({ 
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: event.target.value }]
    })
    window.location.reload();
  }

  const home = () => {
    navigate('/', {replace: true});
    window.location.reload();
  }
  
  return (
<Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>
      {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton> */}
          {/* <div onClick={home}> */}
        <Typography variant="h6"
            href="#"
            noWrap
            component="div"
            onClick={home}
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block', cursor: 'pointer' } }}>
          Escrow DAPP
        </Typography>
        <div>
        <Select id='networks' value={config[chainID] ? `0x${chainID.toString(16).toUpperCase()}` : `0`} onChange={networkHandler}>
            <MenuItem value="0x7E6" >Beresheet</MenuItem>
            <MenuItem value="0x5" >Goerli</MenuItem>
            <MenuItem value="0x7A69" >Local Host</MenuItem>
          </Select>
        </div>
        <Typography       
          sx={{ pl:2}}
          variant="h6" 
          component="div">
          {balance ? 
            <Typography>Balance: {Number(balance).toFixed(4)} </Typography> 
            : <p href=" ">{''}</p>
          }
        </Typography>
        <Typography 
          sx={{ pl:2}}
          variant="h6" 
          component="div">
          {/* Ternary operator if else in line. if account show account if no account leave empty string */}
          {account ? 
            <Typography 
              underline="none"
              sx={{ pl:2, pr:5 }}
            >
              <Link 
                href={config[chainID] ? `${config[chainID].explorerURL}/address/${account}` : '#'}
                underline="none"
                color="textPrimary"
              >
                Account: {account.slice(0,5) + '...' + account.slice(38,42)} 
              </Link>
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color='#FF3B80'
                bgColor='#161616'
                spotColor='#F1F2F9'
                className='blocky' 
                />
            </Typography> 
            : <Button
                variant='contained'
                onClick={connectHandler}>
                Connect Account
              </Button>
          }
        </Typography>
      </Toolbar>
    </AppBar>
    </Box>
    

  );
};

export default NavBar;
