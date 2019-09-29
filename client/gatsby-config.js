const path = require('path')
const config = require('../utils/config.js')
// require("dotenv").config({
//   path: path.resolve(process.cwd(), '../env')
// });
const url = config.serverUrl

module.exports = {
  siteMetadata: {
    title: 'Union for Street Solidarity',
    author: 'USS',
    description: 'TODO',
  },
  // proxy: {
  //   prefix: '/streetstories',
  //   url: config.serverUrl
  // },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-mongodb`,
      options: {
        connectionString: config.mongoUrl,
        dbName: config.dbName,
        collection: config.collection,
        server: { address: config.serverAddress, port: config.serverPort },
        auth: { user: config.authUser, password: encodeURIComponent(config.authPassword) },
        map: { documents: { id: `text/markdown` } },
        extraParams: { retryWrites: true, w: 'majority' },
        clientOptions: {
          useUnifiedTopology: true,
          useNewUrlParser: true
        }
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/logo.jpg', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sass',
    `gatsby-transformer-json`,
    
  ],
}
