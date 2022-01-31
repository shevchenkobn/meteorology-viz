import { Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { routes } from './AppRouter';
import { deleteSavedState, hasSavedState } from './store/lib';

export const title = 'MeteorologyViz';

export function AppHeader() {
  useEffect(() => {
    document.title = title;
  }, []);

  const [hasCache, setHasCache] = useState(hasSavedState());
  const location = useLocation();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          {routes.map((page) => (
            <Button
              disabled={location.pathname === '/' + page.path}
              key={page.path}
              component={Link}
              to={page.path}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {page.label}
            </Button>
          ))}
        </Box>
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
