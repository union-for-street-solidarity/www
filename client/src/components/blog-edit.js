import React from "react"
import { Link, graphql } from "gatsby"

export default class BlogEdit extends React.Component {
  state = {
    id: "",
    category: "",
  }
  handleInputChange = event => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }
  handleSubmit = event => {
    event.preventDefault()
    // alert(`Welcome ${this.state.firstName} ${this.state.lastName}!`)
  }
  render() {
    const item = this.props.item
    const keys = Object.keys(item)

    return (
      <form method="POST" enctype="multipart/form-data" action="/">
        {
          keys.map(key => {
            return (
              <label>
                {key}
                <input
                  type="text"
                  name={key}
                  value={item[key]}
                  onChange={this.handleInputChange}
                />
              </label>
            )
          })
            

        }
        <button type="submit">Submit</button>
      </form>
    )
  }
}

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
