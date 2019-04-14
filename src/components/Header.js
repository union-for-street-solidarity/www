import React from 'react'
import PropTypes from 'prop-types'

import logo from '../images/logo.jpg'

const Header = props => (
  <header id="header" style={props.timeout ? { display: 'none' } : {}}>
    <img
      src={logo}
      alt="USS"
      style={{
        borderRadius: '50%',
        width: 150,
        height: 150,
        objectFit: 'contain',
      }}
    />
    <div className="content">
      <div className="inner">
        <h1>Union for Street Solidarity</h1>
        <p>TODO - some intro copy should go here. 😸</p>
      </div>
    </div>
    <nav>
      <ul>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('intro')
            }}
          >
            Intro
          </a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('donate')
            }}
          >
            Donate
          </a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('about')
            }}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('contact')
            }}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  </header>
)

Header.propTypes = {
  onOpenArticle: PropTypes.func,
  timeout: PropTypes.bool,
}

export default Header
