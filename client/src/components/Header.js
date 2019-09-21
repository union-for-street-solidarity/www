import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

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
        <p>Solidarity not Charity</p>
      </div>
    </div>
    <nav>
      <ul>
        <li>
          <button
            onClick={() => {
              props.onOpenArticle('intro')
            }}
          >
            Intro
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              props.onOpenArticle('donate')
            }}
          >
            Donate
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              props.onOpenArticle('distributions')
            }}
          >
            Distributions
          </button>
        </li>
        <li>
          <Link to={`/blog/`}>
            Blog
      
            {
              /* Article */
            }
          </Link>

          {// <a
          //   href="javascript:;"
          //   onClick={() => {
          //     props.onOpenArticle('blog')
          //   }}
          // >
          //   Blog
          // </a>
          }
        </li>

        {/* <li>
          <a
            href="javascript:;"
            onClick={() => {
              props.onOpenArticle('contact')
            }}
          >
            Contact
          </a>
        </li> */}
      </ul>
    </nav>
  </header>
)

Header.propTypes = {
  onOpenArticle: PropTypes.func,
  timeout: PropTypes.bool,
}

export default Header
