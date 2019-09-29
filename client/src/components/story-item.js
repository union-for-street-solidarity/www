import React from 'react'
import { graphql, navigate } from "gatsby"
import moment from 'moment'
import Item from './Item.js'
class StoryItem extends React.Component {
  render() {
    const item = this.props.item
    const keys = Object.keys(item)
    return (
      <li className="blog">

        <div style={{display:'inline-block', width:'100%', overflow:'hidden'}}>
          {
            keys.map((key) => {
              const it = item[key]
              if (key !== 'description') {
                if (key === 'title') {
                  return (
                    <h1 key={item.id+key}>{it}</h1>                    
                  )
                } else if (key === 'lede') {
                  return (
                    <h2 key={item.id+key}><small>{it}</small></h2>
                  )
                } else if (key === 'date') {
                  return (
                    <h5 key={item.id+key}>{moment(it).format('MMMM Do, YYYY @ hh:mm a')}</h5>
                  )
                } else {
                  if (it.media) {
                    return (
                      <div key={item.id+key} style={{display:'none'}}>{
                        it.media.map((result) => {
                          return (
                            <Item item={result} key={result.mongodb_id+key} />
                          )
                        })
                      }</div>
                    )
                  } else {
                    return (
                      <div>No media</div>
                    )
                  }
                }
                
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

        </div>
        <div>
        <ul>
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${item.category}?q=${item.id}`)
              }}
            >
              more details
            </button>
          </li>
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/blog/api/editstory/${item.category}/${item.mongodb_id}`)
              }}
            >
              edit
            </button>
          </li>
        </ul>
        </div>
        <hr style={{clear:'both'}}></hr>

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
    description
    media {
      index
    }
  }
`
/* {
  caption
  image
  thumb
} */