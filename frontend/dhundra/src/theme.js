import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette : {
        primary: {
            main: '#283593',
        },
        secondary: {
            main: '#f50057',
        },
        custom: {
            
            buttonhover: '#1A237E' // Custom hover color
        }
    },
    typography : {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }
})

export default theme;