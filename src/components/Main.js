import React from 'react'
import PropTypes from 'prop-types'

import clothes from '../images/clothes.jpeg'
import coffee from '../images/coffee.jpeg'
import menu_quesadilla from '../images/menu_quesadilla.jpeg'

class Main extends React.Component {
  render() {
    let close = (
      <div
        className="close"
        onClick={() => {
          this.props.onCloseArticle()
        }}
      />
    )

    return (
      <div
        ref={this.props.setWrapperRef}
        id="main"
        style={this.props.timeout ? { display: 'flex' } : { display: 'none' }}
      >
        <article
          id="intro"
          className={`${this.props.article === 'intro' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Intro</h2>
          <span className="image main">
            <img src={menu_quesadilla} alt="" />
          </span>
          <p>
            Union for Street Solidarity is a group of socialists working to
            improve the immediate and long-term material conditions of the
            working poor and homeless in Salt Lake City. We believe that
            homelessness is a structural condition of capitalist society, not
            the result of the moral failing of any individual, and a problem
            which cannot be solved under capitalism. USS practices mutual aid
            through the distribution of free survival essentials while engaging
            in political action through collective struggle.
          </p>
          <p>
            USS believes that people experiencing poverty and homelessness are
            the ones who should tell us what their needs are and how best to
            improve their circumstances. We conduct research through
            conversation and surveys, and use the information we gather to
            direct future political action and material aid.
          </p>
          {close}
        </article>

        <article
          id="donate"
          className={`${this.props.article === 'donate' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Donate</h2>
          <span className="image main">
            <img src={clothes} alt="" />
          </span>
          <p>
            Union for Street Solidarity receives no grant money or charitable
            funding -- we pay for distributions out of our own pockets and rely
            on donations to help us keep providing aid. All contributions we
            receive go directly to purchases of supplies and equipment.
          </p>
          <p>
            If you’re able, please consider a recurring donation. Our DonorBox
            makes it easy, just set it up once and donations will automatically
            be sent each month.
          </p>
          <div>
            <script
              src="https://donorbox.org/install-popup-button.js"
              type="text/javascript"
              defer
            />
            <a
              class="dbox-donation-button"
              href="https://donorbox.org/uss-distribution-funding?default_interval=m"
              style={{
                background: '#2d81c5',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: 'Verdana,sans-serif',
                display: 'inline-block',
                fontSize: '16px',
                padding: '15px 38px 15px 38px',
                borderRadius: '2px',
                boxShadow: '0 1px 0 0 #1f5a89',
                textShadow: '0 1px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* style="background:#2d81c5; color: #fff;text-decoration: none;font-family: Verdana,sans-serif;display: inline-block;font-size: 16px;padding: 15px 38px 15px 38px; -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; box-shadow: 0 1px 0 0 #1f5a89; text-shadow: 0 1px rgba(0, 0, 0, 0.3);" */}
              Donate
            </a>
          </div>
          {close}
        </article>

        <article
          id="distributions"
          className={`${
            this.props.article === 'distributions' ? 'active' : ''
          } ${this.props.articleTimeout ? 'timeout' : ''}`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Distributions</h2>
          <span className="image main">
            <img src={coffee} alt="" />
          </span>
          <p>
            USS conducts distributions every other Saturday next door to the
            Gateway Inn on North Temple and in the southwest corner of Pioneer
            Park. We share coffee, food, vitamins, socks, clothing, and other
            goods to aid in survival on the street. We also conduct surveys and
            spend time talking with those who come to visit. Through material
            aid and conversation, we aim to build solidarity, learn from our
            community, and help people live more safely and happily.
          </p>
          <p>
            If you are interested in volunteering, please email{' '}
            <a href="mailto:unionforstreetsolidarity@gmail.com?subject=Interested in Volunteering!">
              unionforstreetsolidarity@gmail.com
            </a>
            .
          </p>
          {close}
        </article>

        {/* <article
          id="contact"
          className={`${this.props.article === 'contact' ? 'active' : ''} ${
            this.props.articleTimeout ? 'timeout' : ''
          }`}
          style={{ display: 'none' }}
        >
          <h2 className="major">Contact</h2>
          <form method="post" action="#">
            <div className="field half first">
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" />
            </div>
            <div className="field half">
              <label htmlFor="email">Email</label>
              <input type="text" name="email" id="email" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea name="message" id="message" rows="4" />
            </div>
            <ul className="actions">
              <li>
                <input type="submit" value="Send Message" className="special" />
              </li>
              <li>
                <input type="reset" value="Reset" />
              </li>
            </ul>
          </form>
          <ul className="icons">
            <li>
              <a href="#" className="icon fa-twitter">
                <span className="label">Twitter</span>
              </a>
            </li>
            <li>
              <a href="#" className="icon fa-facebook">
                <span className="label">Facebook</span>
              </a>
            </li>
            <li>
              <a href="#" className="icon fa-instagram">
                <span className="label">Instagram</span>
              </a>
            </li>
            <li>
              <a href="#" className="icon fa-github">
                <span className="label">GitHub</span>
              </a>
            </li>
          </ul>
          {close}
        </article> */}
      </div>
    )
  }
}

Main.propTypes = {
  route: PropTypes.object,
  article: PropTypes.string,
  articleTimeout: PropTypes.bool,
  onCloseArticle: PropTypes.func,
  timeout: PropTypes.bool,
  setWrapperRef: PropTypes.func.isRequired,
}

export default Main
