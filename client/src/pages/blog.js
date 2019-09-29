import React from 'react'
import { graphql, navigate } from 'gatsby'

import Layout from '../components/layout'
import StoryItem from '../components/story-item.js'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'
import MediaItem from '../components/media-item.js'

class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isArticleVisible: false,
      timeout: false,
      articleTimeout: false,
      article: '',
      loading: 'is-loading',
      interval: false,
      carouselInterval: null,
      carouselIndex: (!props.data || !props.data.edges ? 0 : props.data.edges.length - 1),
      allMongodbUssBlog: props.data
    }
    this.handleOpenArticle = this.handleOpenArticle.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this);
  }
  
  componentDidMount () {
    this.timeoutId = setTimeout(() => {
        this.setState({loading: ''});
    }, 100);
    document.addEventListener('mousedown', this.handleClickOutside);
    // const { allMongodbUssBlog } = this.props.data
    if (!this.state.interval) {
      var intervalState = this.state.interval;
      this.carouselInterval = setInterval(() => this.nextSlide, 5000)
      this.setState({
        interval: !intervalState
      })
    }
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
  
  nextSlide() {
    var ci = this.state.carouselIndex
    if (ci >= (this.allMongodbUssBlog.edges.length - 1)) {
      this.setState({
        carouselIndex: 0
      })
    } else {
      this.setState({
        carouselIndex: ci++
      })
    }
  }
  
  previousSlide() {
    var ci = this.state.carouselIndex
    if (ci <= 0) {
      this.setState({
        carouselIndex: (this.allMongodbUssBlog.edges.length - 1)
      })
    } else {
      this.setState({
        carouselIndex: ci--
      })
      
    }
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
            <div className="alt blog main-container">
            {
              allMongodbUssBlog.edges.map(({ node }) => (
                <>
                
                {
                  //<div className="carousel-inner parallax-container" key={`carousel${node.id}media`}>
                  node.media.map((item, index) => (<MediaItem index={index} node={node} item={item} key={`carousel${node.id}media${item.index}`} carouselIndex={this.state.carouselIndex} /> ))
                  // </div>
                }
                <StoryItem item={node} key={node.id} />
                </>
              ))
            }
            
            </div>
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
          media {
            index
            caption
            image
            thumb
          }
        }
      }
    }
  }
`
/*
media(index: { eq: $index } ) {
  index {
    caption
    image
    thumb
  }
}
*/

// export const pageQuery = graphql`
//   query {
//     user: allPostsJson(limit: 1) {
//       edges {
//         node {
//           username
//           ...Avatar_user
//         }
//       }
//     }
//     allPostsJson {
//       edges {
//         node {
//           id
//           text
//           weeksAgo: time(difference: "weeks")
//           ...Post_details
//           ...PostDetail_details
//         }
//       }
//     }
//   }
// `
