import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBlockchain } from './utils/common'
import NavBar from "./components/navbar.js";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Home from './pages/page-home';
import Contract from './pages/page-contract';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF3B80',
    },
    secondary: {
       main: '#FB6C9F',
    },
  },
  typography: {
    fontFamily: 'Space Grotesk',
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  }
});

function App() {

  const [blockchain, setBlockchain] = useState({});

  useEffect(() => {
    (async () => {
      setBlockchain(await getBlockchain());
    })();
  }, []);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <NavBar blockchain={blockchain} />
        <Routes>
          <Route path="/" element={<Home blockchain={blockchain} />} />
          <Route path="/contract" element={<Contract />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
