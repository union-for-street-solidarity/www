import React from 'react'
import { Link, graphql, navigate } from "gatsby"
import moment from 'moment'

// <div>
// 
//   <p key={item.id+key}><strong>{key}</strong><span>: </span><span>{it}</span></p>
// 	p.text-muted.my-0(v-text="moment(doc.date).format('MMMM Do YYYY') + ' at ' + moment(doc.date).format('hh:mm a')")
// 
// 	h5.py-3
// 		small(v-text="doc.lede")
// 
// div.col-lg-6.py-4(v-if="doc.media && doc.media.length > 0" style="min-height: 100vh;")
// 	div.parallax-container(v-for="(item, j) in doc.media" :class="(sliderIndex === j ? 'active' : '')"
// 	:style="{opacity: (sliderIndex === j ? 1 : 0 ) }")
// 		p(v-text="item.caption")
// 
// 
// 	div.carousel-inner(style="position:absolute;left:0;right:0;")
// 		div.carousel-item.carousel-item(v-for="(item, j) in doc.media" :class="(sliderIndex === j ? 'active' : '')"
// 		:style="{opacity: (sliderIndex === j ? 1 : 0 ) }")
// 			div.w-100(:style="{'background': 'url('+item.image+'?version='+Math.random()+')', 'background-size': 'cover'}" :alt="'Slide '+ j")
// 		div.carousel-caption.d-md-block(v-for="(item, j) in doc.media" :class="(sliderIndex === j ? 'active' : '')"
// 		:style="{opacity: (sliderIndex === j ? 1 : 0 ) }")
// 
// hr.py-2(style="max-width:75%;")
// 
// div#content(v-html="doc.description")
// 
// hr.py-2(style="max-width:75%;")
// 
// 
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
                  return (
                    <div key={item.id+key} style={{display:'none'}}>{it}</div>
                  )
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
    
  }
`
