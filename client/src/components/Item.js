import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

class Item extends React.Component {
	render() {
		const item = this.props.item
		console.log(item)
		if (item.media && item.media.length > 0) {
			return (
				<div className="carousel-inner">
					{ 
						
							// item.media.map((item, j) => {
							// 	return (
							// 		<div className="carousel-item" style={{opacity: (this.state.carouselIndex === j ? 1 : 0 ) }}>
							// 			<img clasName="d-block w-100" src={item.image+'?version='+Math.random()} alt={'Slide '+ j}/>
							// 			<div className="carousel-caption d-md-block">
							// 				<p>{item.caption}</p>
							// 			</div>
							// 		</div>
							// 	)
							// })

					}
					{
						// forward={this.nextSlide}
						// backward={this.previousSlide} 
						// interval={this.state.interval} 
						// carouselInterval={this.state.carouselInterval} 
						// carouselIndex={this.state.carouselIndex}
					}
				</div>
			)
		} else {
			return (
				<div>No carousel</div>
			)
		}
		
		
	}
}
// Carousel.propTypes = {
//   route: PropTypes.object,
//   item: PropTypes.object,
// 	carouselInterval: PropTypes.func,
// 	carouselIndex: PropTypes.number,
//   interval: PropTypes.bool,
// }
export default Item

export const mediaFragment = graphql`
  fragment Media on mongodbUssBlog {
		media {
			caption
			image
			thumb
		}
  }
`
//		media(mongodb_id: {eq: $mongodb_id })

