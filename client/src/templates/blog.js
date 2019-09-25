import React from "react"
import { graphql, Link } from "gatsby"

import Layout from '../components/layout'
import StoryItem from '../components/story-item.js'
import Header from '../components/Header.js'
import Footer from '../components/Footer.js'

class Item extends React.Component {
  render() {
    const story = this.props.data.mongodbUssBlog

    return (
      <Layout location={this.props.location}>
        <div className={`body ${this.state.loading} ${this.state.isArticleVisible ? 'is-article-visible' : ''}`}>
          <div id="wrapper">
            <Header onOpenArticle={this.handleOpenArticle} timeout={this.state.timeout} />
            <StoryItem item={story} key={story.id} />
          </div>
        </div>
      </Layout>
    )
  }
}

export default Item
