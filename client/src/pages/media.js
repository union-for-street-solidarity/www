import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Item from '../components/item'
class Media extends React.Component {
  render() {
    const { allMongodbUssBlog } = this.props.data

    return (
      <Layout>
        <div>
          <h1>Website information stored in MongoDB</h1>
          <ul>
            {allMongodbUssBlog.edges.map(({ node }) => (
							(
								node.map((item) => {
									return (
									<Item item={node} key={node.id} />	
									)
								})
							)
            ))}
          </ul>
        </div>
      </Layout>
    )
  }
}

export default Media
