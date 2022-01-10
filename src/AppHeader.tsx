import { Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { deleteSavedState, hasSavedState } from './store/lib';

export const title = 'MeteorologyViz';

export function AppHeader() {
  useEffect(() => {
    document.title = title;
  }, []);

  const [hasCache, setHasCache] = useState(hasSavedState());
  return (
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
        {hasCache && (
          <Button
            color="inherit"
            onClick={() => {
              deleteSavedState();
              setHasCache(hasSavedState());
            }}
          >
            Clear cache
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
