import React from 'react'
// import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

class MediaItem extends React.Component {
	render() {
		const item = this.props.item
		console.log(item)
		if (this.props.carouselIndex === this.props.index) {
			return (
				<div className="carousel-item parallax-container" style={{opacity: (this.props.carouselIndex === this.props.index && item.index === 0 ? 1 : 0 ) }}>
					<img className="d-block w-100" src={item.image+'?version='+Math.random()} alt={'Slide '+ item.index}/>
					<div className="carousel-caption d-md-block">
						<p>{item.caption}</p>
					</div>
				</div>
			)
		} else {
			return (
				<div style={{display: 'none'}}></div>
			)
		}

		// if (item.media && item.media.length > 0) {
		// 	return (
		// 		<div className="carousel-inner">
		// 			{ 
		// 
		// 					// item.media.map((item, j) => {
		// 					// })
		// 
		// 			}
		// 			{
		// 				// forward={this.nextSlide}
		// 				// backward={this.previousSlide} 
		// 				// interval={this.state.interval} 
		// 				// carouselInterval={this.state.carouselInterval} 
		// 				// carouselIndex={this.state.carouselIndex}
		// 			}
		// 		</div>
		// 	)
		// } else {
			// return (
			// 	<div>No carousel</div>
			// )
		// }
		
		
	}
}
// Carousel.propTypes = {
//   route: PropTypes.object,
//   item: PropTypes.object,
// 	carouselInterval: PropTypes.func,
// 	carouselIndex: PropTypes.number,
//   interval: PropTypes.bool,
// }
export default MediaItem

export const mediaFragment = graphql`
  fragment Media on mongodbUssBlog {
		media {
			index
			caption
			image
			thumb
		}
  }
`
//		media(mongodb_id: {eq: $mongodb_id })

