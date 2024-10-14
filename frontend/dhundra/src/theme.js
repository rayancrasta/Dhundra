import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette : {
        primary: {
            main: '#0D47A1',
        },
        secondary: {
            main: '#f50057',
        },
        custom: {
            
            buttonhover: '#0D47A1' // Custom hover color
        }
    },
    typography : {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }
})

export default theme;