// import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { Button, Paper, Stack, Typography, TextField, Grid, Box } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
// import { getBlockchain, showError } from "./utils/common";
import ContractAddress from "../abis/contract-address.json";
import WalletCard from "../components/wallet.js";



// const heights = [150, 150];

// const StyledAccordion = styled(Accordion)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//   color: theme.palette.text.secondary,
// }));

// const data = await getBlockchain();

// const theme = createTheme({
//   palette: {
//     primary: {
//     },
//   },
// });


function Home() {
  return (
    <div>
    <div className="App">
      <header className="App-header">
      {/* <ThemeProvider theme={theme}> */}
        <Typography variant="h3" p={3} pb={6} >
          Initialize Escrow
        </Typography>
        <Grid container sx={{ justifyContent: 'center' }}>
        <Box sx={{ width: 300,'& button': { m: 2 } }} >
        <TextField id="outlined-basic" label="Seller Address" variant="outlined" />
        <TextField id="outlined-basic" label="Buyer Address" variant="outlined" />
        <TextField id="outlined-basic" label="Owner Fee %" variant="outlined" />
        <TextField id="outlined-basic" label="Return Deadline Date" variant="outlined" />
          <Button variant='contained'> Create Escrow </Button>
        </Box>
        </Grid>

        <Grid container sx={{ justifyContent: 'center' }}>
        <WalletCard  />
        {/* <p>
          {(contractAddress).toString()}
        </p> */}
        </Grid>
      {/* </ThemeProvider> */}


      </header>
    </div>
    </div>
  );
}

export default Home;