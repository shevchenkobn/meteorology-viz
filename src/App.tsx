import { CssBaseline } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import classNames from './App.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getContentSize, Point } from './lib/dom';
import { GrowingMapPage } from './pages/MapPage';
import Container from '@mui/material/Container';

const title = 'MeteorologyViz';

export function App() {
  useEffect(() => {
    document.title = title;
  }, []);

  const [boxSize, setBoxSize] = useState(getDocumentSize());
  const boxRef = useRef<HTMLDivElement>(null);
  const resizeCallback = useCallback(() => {
    if (!boxRef.current || !boxRef.current.parentElement) {
      return;
    }
    const newSize = getContentSize(boxRef.current.parentElement, [boxRef.current, boxRef.current.parentElement]);
    setBoxSize(newSize);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', resizeCallback);
    return () => window.removeEventListener('resize', resizeCallback);
  }, [resizeCallback]);
  useEffect(resizeCallback, [resizeCallback]);
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
      <Container className={classNames['App-main']} maxWidth={false}>
        <Box ref={boxRef} sx={{ my: 2 }} style={{ width: boxSize.x, height: boxSize.y }}>
          <GrowingMapPage />
        </Box>
      </Container>
    </>
  );
}

function getDocumentSize(): Point {
  return { x: document.body.offsetWidth, y: document.body.offsetHeight };
}
