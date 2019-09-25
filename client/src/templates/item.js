import React from "react"
import { graphql } from "gatsby"
import Layout from "../layouts"

class Item extends React.Component {
  render() {
    const story = this.props.data.mongodbUssBlog

    return (
      <Layout>
        <div>
          <a href={story.id} className="itemlink">
            {story.id}
          </a>
          <p>
            {/*<div
              dangerouslySetInnerHTML={{
                __html: story.description.childMarkdownRemark.html,
              }}
              className="story"
            /> 
            */}
          </p>
        </div>
      </Layout>
    )
  }
}

export default Item
