import React from 'react'
import { Link, graphql } from "gatsby"

class StoryItem extends React.Component {
  render() {
    const item = this.props.item
    const keys = Object.keys(item)
    return (
      <li className="blog">
        <div>
          {
            keys.map((key) => {
              const it = item[key]
              if (key !== 'body') {
                return (
                  <p key={item.id+key}><strong>{key}</strong><span>: </span><span>{it}</span></p>
                )
                
              } else {
                return (
                  <div key={item.id+key}
                    dangerouslySetInnerHTML={{
                      __html: it,
                    }}
                    className="story"
                  />
                )
              }
            })
          }
          <Link to={`/${item.category}?q=${item.id}`}>more details</Link>
          <a href={`/blog/api/editstory/${item.category}/${item.mongodb_id}`}>edit</a>
        </div>
      </li>
    )
  }
} 

export default StoryItem

export const storyFragment = graphql`
  fragment Story_item on mongodbUssBlog {
    mongodb_id
    id
    title
    lede
    category
    date
    author
    body
    
  }
`
