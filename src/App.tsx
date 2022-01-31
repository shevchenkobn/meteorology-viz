import { CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';
import { AppHeader } from './AppHeader';
import { getContentSize, Point } from './lib/dom';
import { AppRouter } from './AppRouter';

export function App() {
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
      <AppHeader />
      <Container className="App-main" maxWidth={false}>
        <Box ref={boxRef} sx={{ my: 2 }} style={{ width: boxSize.x, height: boxSize.y }}>
          <AppRouter />
        </Box>
      </Container>
    </>
  );
}

function getDocumentSize(): Point {
  return { x: document.body.offsetWidth, y: document.body.offsetHeight };
}
