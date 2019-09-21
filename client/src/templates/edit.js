import React from 'react'
import { graphql, Link } from 'gatsby'

import Layout from '../components/layout'
import StoryItem from '../components/story-item.js'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'
import BlogEdit from '../components/blog-edit.js'

// const Blog = props => {
class Edit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isArticleVisible: false,
      timeout: false,
      articleTimeout: false,
      article: '',
      loading: 'is-loading',
      id: '',
      title: '',
      lede: '',
      category: '',
      date: '',
      author: '',
      body: ''
    }
    this.handleOpenArticle = this.handleOpenArticle.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this);
  }
  handleInputChange (event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })

  }

  handleSubmit (event) {
    
  }

  componentDidMount () {
    this.timeoutId = setTimeout(() => {
        this.setState({loading: ''});
    }, 100);
    document.addEventListener('mousedown', this.handleClickOutside);
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

  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (this.state.isArticleVisible) {
        this.handleCloseArticle();
      }
    }
  }

  render() {
    const story = this.props.data.mongodbUssBlog
    // console.log(props)
    return (
      <Layout location={this.props.location}>
        <div className={`body ${this.state.loading} ${this.state.isArticleVisible ? 'is-article-visible' : ''}`}>
          <div id="wrapper">
            <Header onOpenArticle={this.handleOpenArticle} timeout={this.state.timeout} />
            <BlogEdit item={story} key={story.id} />
            
            <Footer timeout={this.state.timeout} />
          </div>
          <div id="bg"></div>
        </div>
      </Layout>

    )

  }
}
  // if (data) {

  // } else {
  //   return (
  //     <Layout>
  //       <h1>Hi from the blog</h1>
  //       <Link to="/">Go back to the homepage</Link>
  //       <h3>No data yet</h3>
  //     </Layout>
  //   )
  // }
  
// }

export default Edit

export const pageQuery = graphql`
  query($id: String!) {
    mongodbUssBlog(id: { eq: $id }) {
      mongodb_id
      id
      title
      lede
      category
      date
      author
      body
    }
  }
`
