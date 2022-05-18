import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import ConnectWallet from './ConnectWallet';
import marioCoin from '../img/coin2.gif';

const pages = ['I have a code!', 'Learn more'];

const NavBar = ({linkCode}: { linkCode: string }) => {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <AppBar position="static" color={'transparent'} elevation={0}>
            <Container maxWidth="xl">
                <Box sx={{flexGrow: 1, justifyContent: 'center', verticalAlign: 'center', display: {xs: 'flex', md: 'none'}}}>
                    <h1 style={{textAlign: 'center'}}>caja<img src={marioCoin} alt={'Logo'} height={26}/>money</h1>
                </Box>
                <Toolbar disableGutters>
                    <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                        <img src={marioCoin} alt={'Logo'} width={50} style={{marginRight: 20}}/>
                    </Box>

                    <Box sx={{display: {xs: 'none', md: 'flex', lg: 'flex'}}}>
                        <h1>caja.money</h1>
                    </Box>
                    <Box sx={{flexGrow: 1, justifyContent: 'center', display: {xs: 'none', md: 'flex'}}}>
                    </Box>
                    {/*<Box sx={{flexGrow: 1, justifyContent: 'center', display: {xs: 'none', md: 'flex'}}}>*/}
                    {/*    {pages.map((page) => (*/}
                    {/*        <Button*/}
                    {/*            key={page}*/}
                    {/*            onClick={handleCloseNavMenu}*/}
                    {/*            sx={{my: 2, color: 'white', display: 'block', fontSize: 16}}*/}
                    {/*        >*/}
                    {/*            {page}*/}
                    {/*        </Button>*/}
                    {/*    ))}*/}
                    {/*</Box>*/}
                    <Box sx={{flexGrow: 1, justifyContent: 'center', display: {xs: 'flex'}}}>
                        <ConnectWallet/>
                    </Box>
                    {/*<Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>*/}
                    {/*    <IconButton*/}
                    {/*        size="large"*/}
                    {/*        aria-label="account of current user"*/}
                    {/*        aria-controls="menu-appbar"*/}
                    {/*        aria-haspopup="true"*/}
                    {/*        onClick={handleOpenNavMenu}*/}
                    {/*        color="inherit"*/}
                    {/*    >*/}
                    {/*        <MenuIcon/>*/}
                    {/*    </IconButton>*/}
                    {/*    <Menu*/}
                    {/*        id="menu-appbar"*/}
                    {/*        anchorEl={anchorElNav}*/}
                    {/*        anchorOrigin={{*/}
                    {/*            vertical: 'bottom',*/}
                    {/*            horizontal: 'left',*/}
                    {/*        }}*/}
                    {/*        keepMounted*/}
                    {/*        transformOrigin={{*/}
                    {/*            vertical: 'top',*/}
                    {/*            horizontal: 'left',*/}
                    {/*        }}*/}
                    {/*        open={Boolean(anchorElNav)}*/}
                    {/*        onClose={handleCloseNavMenu}*/}
                    {/*        sx={{*/}
                    {/*            display: {xs: 'block', md: 'none'},*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        {pages.map((page) => (*/}
                    {/*            <MenuItem key={page} onClick={handleCloseNavMenu}>*/}
                    {/*                <Typography textAlign="center">{page}</Typography>*/}
                    {/*            </MenuItem>*/}
                    {/*        ))}*/}
                    {/*    </Menu>*/}
                    {/*</Box>*/}

                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavBar;
