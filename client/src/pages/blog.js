import React from 'react'
import { graphql, Link, navigate } from 'gatsby'

import Layout from '../components/layout'
import StoryItem from '../components/story-item.js'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'

class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isArticleVisible: false,
      timeout: false,
      articleTimeout: false,
      article: '',
      loading: 'is-loading'
    }
    this.handleOpenArticle = this.handleOpenArticle.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this);
  }
  
  componentDidMount () {
    this.timeoutId = setTimeout(() => {
        this.setState({loading: ''});
    }, 100);
    document.addEventListener('mousedown', this.handleClickOutside);
    // var queryRx = /(?:\/\?a=)(.+)/g
    // if (queryRx.test(window.location.toString())) {
    //   var query = window.location.toString().match(queryRx)[0].replace('/?a=', '')
    //   this.handleOpenArticle(query)
    // }
  }

  componentWillUnmount () {
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
    }
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleOpenArticle(article) {
    var hrefRx = new RegExp(article, 'g')
    console.log(hrefRx.test(window.location.toString()))
    if (!hrefRx.test(window.location.toString())) {
      navigate(`/?a=${article}`)
    }
    this.setState({
      isArticleVisible: !this.state.isArticleVisible,
      article
    })

    setTimeout(() => {
      this.setState({
        timeout: !this.state.timeout
      })
    }, 325)

    setTimeout(() => {
      this.setState({
        articleTimeout: !this.state.articleTimeout
      })
    }, 350)

  }

  handleCloseArticle() {

    this.setState({
      articleTimeout: !this.state.articleTimeout
    })

    setTimeout(() => {
      this.setState({
        timeout: !this.state.timeout
      })
    }, 325)

    setTimeout(() => {
      this.setState({
        isArticleVisible: !this.state.isArticleVisible,
        article: ''
      })
    }, 350)

    window.location.query = ''
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (this.state.isArticleVisible) {
        this.handleCloseArticle();
      }
    }
  }

  render() {
    const { allMongodbUssBlog } = this.props.data
    // console.log(props)
    return (
      <Layout location={this.props.location}>
        <div className={`body ${this.state.loading} ${this.state.isArticleVisible ? 'is-article-visible' : ''}`}>
          <div id="wrapper">
            <Header onOpenArticle={this.handleOpenArticle} timeout={this.state.timeout} />
            {/*<div style={{display:'inline-block'}}>*/}
            <ul className="alt blog">
            {
              allMongodbUssBlog.edges.map(({ node }) => (
                <StoryItem item={node} key={node.id} />
              ))
            }
            
            </ul>
            {/*</div>*/}
            <Footer timeout={this.state.timeout} />
          </div>
          <div id="bg"></div>
        </div>
      </Layout>

    )

  }
}

export default Blog

export const pageQuery = graphql`
  query {
    allMongodbUssBlog {
      edges {
        node {
          mongodb_id
          id
          title
          lede
          category
          date
          author
          description
        }
      }
    }
  }
`
