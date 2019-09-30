import React from 'react'
import PropTypes from 'prop-types'
import { navigate } from 'gatsby'

const Footer = props => (
  <footer id="footer" style={props.timeout ? { display: 'none' } : { marginTop: 'auto'}}>
    <p className="copyright">&copy; Union for Street Solidarity</p>
    
    <p><small>
    {
      // eslint-disable-next-line
    }<a href="#" onClick={() => (navigate(`/login`))}>admin</a></small></p>
  </footer>
)

Footer.propTypes = {
  timeout: PropTypes.bool,
}

export default Footer
