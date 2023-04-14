import './App.css';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import ContractAddress from "./abis/contract-address.json";
import { useEffect, useState } from 'react';
import { getBlockchain } from './utils/common'
import NavBar from "./components/navbar.js";
// import Header from './components/Header';

import Home from './pages/page-home';
import Contract from './pages/page-contract';
import Init from './pages/page-init';
import Deposit from './pages/page-deposit';

// const heights = [150, 150];

// const StyledAccordion = styled(Accordion)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//   color: theme.palette.text.secondary,
// }));

// const data = await getBlockchain();


function App() {

  const [blockchain, setBlockchain] = useState({});

  useEffect(() => {
    (async () => {
      setBlockchain(await getBlockchain());
    })();
  }, []);

  return (
    <div>
        <NavBar blockchain={blockchain} />
      {/* <Header blockchain={blockchain} /> */}
        <Router>
          <Routes>
            <Route path="/" element={<Home blockchain={blockchain} />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/init" element={<Init />} />
            <Route path="/deposit" element={<Deposit />} />
          </Routes>
        </Router>
    </div>
  );
}

export default App;
