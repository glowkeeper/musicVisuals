import React from 'react'

import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/styles'

import { theme } from '../styles'
import { Main } from './pages/main'

const Root = () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Main />
    </ThemeProvider>
);

export default Root
