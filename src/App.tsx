import { CssBaseline } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import './App.scss';
import { useEffect } from 'react';
import { MapPage } from './pages/MapPage';
import Container from '@mui/material/Container';

const title = 'MeteorologyViz';

export function App() {
  useEffect(() => {
    document.title = title;
  });
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {/*<Box sx={{ flexGrow: 1 }}>*/}
          {/*  {pages.map((page) => (*/}
          {/*    <Button key={page} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>*/}
          {/*      {page}*/}
          {/*    </Button>*/}
          {/*  ))} */}
          {/*</Box>*/}
        </Toolbar>
      </AppBar>
      <Container className="App-main" maxWidth={false}>
        <Box sx={{ my: 2 }}>
          <MapPage />
        </Box>
      </Container>
    </>
  );
}
