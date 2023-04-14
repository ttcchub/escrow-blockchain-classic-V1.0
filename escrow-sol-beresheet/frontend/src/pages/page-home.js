import { Button, Paper, Typography, TextField, Grid } from "@mui/material";
import { ExpandMore } from '@mui/icons-material';
import ContractAddress from "../abis/contract-address.json";
import EscrowArtifact from "../abis/escrow-abi/Escrow.json";
import WalletCard from "../components/wallet.js";
import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import { showError } from "../utils/common";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from 'react-router-dom';

const contractAddress = ContractAddress.Factory;
console.log(contractAddress,"contract");

const array = [];
console.log(array, 'array2')

function Home({ blockchain }) {

  // list of escrows
  const [escrows, setEscrows] = useState([]);
  // input
  const [escrow, setEscrow] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
  };

  const newEscrow = async () => {
    try {
      await blockchain.factory.createContract();
    } 
    catch (error) {
      showError(error);
    }
    handleClose();
  };

  function addNumber(item, index, array) {
    array[index] = `${index}: ${item}`;
  }
  
  useEffect(() => {
    (async () => {
      await blockchain.factory.getAllContracts();
      const allEscrows = await blockchain.factory.getAllContracts();
      const reloadEscrows = [...allEscrows];
      reloadEscrows.forEach(addNumber);
      setEscrows(reloadEscrows.reverse());
    })();
  }, [blockchain]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadEscrow = escrow;
    console.log(loadEscrow, 'loadEscrow');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const newEscrow = new ethers.Contract(loadEscrow, EscrowArtifact, signer);
    console.log(newEscrow, 'newEscrow');
    array[0] = newEscrow;
    console.log(array, 'array1')
    navigate('/contract', {replace: false});
  }

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <Typography variant="h3" p={3}>
              Escrow Decentralized Application
          </Typography>
          <Box sx={{ minHeight: 377 }} p={10}>
            <Masonry columns={2} spacing={5}>
              <Box sx={{ minHeight: 377 }}>
                <Typography 
                  variant='h5'
                  sx={{ pb: 5}}>
                  Create a new Escrow Contract
                </Typography>
                <Paper  elevation={3} sx={{ p:4, pl:10, pr:10 }}>
                  The address which creates the new Escrow contract is the owner of the contract. This address is responsible for correctly initializing the buyer and seller addresses as well as resolve disputes.
                </Paper>
                <ExpandMore />
                <Paper  elevation={3} sx={{ p:4, pl:10, pr:10 }}>
                  The buyer can independently deposit ethers into the escrow any number of times.
                </Paper>
                <ExpandMore sx={{paddingRight:20, align: 'left'}} />
                <ExpandMore sx={{paddingLeft:20, align: 'right'}} />
                <Masonry columns={2} >
                  <Paper  elevation={3} sx={{ padding:2, align: 'left'}}>
                    Both the buyer and the seller need to press the Approve button to get the deal approved. Once both have approved, the escrow will pay out the decided percentage of the contract deposits to the fee and the remaining to the seller automatically.
                  </Paper>
                  <Paper  elevation={3} sx={{ padding:2, align: 'right'}}>
                    In case both the buyer and seller decide not to go ahead with the escrow, both need to press the Cancel button to cancel the escrow. No fee will be charged by the owner in this case and the entire buyer deposit will be transferred back to the buyer.
                  </Paper>
                </Masonry>
                <ExpandMore sx={{paddingRight:20, align: 'left'}} />
                <ExpandMore sx={{paddingLeft:20, align: 'right'}} />
                <Paper elevation={3} sx={{p:4, align: 'left', display: 'flex'}}>
                Neither the creators of the escrow platform nor the owner will have any authority to launder with the money deposited into the smart contract. But they are no way accountable for any monetary losses incurred.
                </Paper>
                <ExpandMore/>
                <Box>
                  <Button
                    variant='contained' 
                    onClick={newEscrow} >
                    Create New Escrow Contract
                  </Button>
                </Box>
              </Box>
            <Box sx={{ minHeight: 377 }}>
              <Typography 
                variant='h5'
                sx={{pb:3}}>
                Load an existing Escrow Contract
              </Typography>
              <form noValidate autoComplete='off' onSubmit={handleSubmit} >
                <TextField 
                  onChange={(e) => setEscrow(e.target.value)}
                  sx={{ m: 1, width: '42ch' }}
                  id="outlined-basic" 
                  label="Escrow Address" 
                  variant="outlined" 
                  />
                  <Box sx={{p:1, pb:2}}>
                    <Button 
                      type='submit'
                      variant='contained'>
                      Load Escrow Contract
                    </Button>
                  </Box>
              </form>
              <Typography variant='h6'>
                All escrows created on this platform:
              </Typography>
              {escrows.map((escrows) => (
            <Typography key={escrows}>
            {/* TODO add key for mapping */}
                {escrows}
              </Typography>
              ))}
            </Box>
          </Masonry>
        </Box>
        </header>
      </div>
    {/* <Grid container sx={{ justifyContent: 'center' }}>
      <WalletCard  />
    </Grid> */}
    </div>
  );
}

export { array };
export default Home;
