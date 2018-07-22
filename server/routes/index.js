const express = require('express')
const axios = require('axios')

var router = express.Router()

/* GET home page */
router.get('/', function(req, res, next) {
	res.json('ok')
})

/* GET subreddit */
router.get('/:subreddit', function(req, res, next) {
	axios
		.get(`https://www.reddit.com/r/${req.params.subreddit}.json`)
		.then(r => {
			const json = r.data
			const posts = json.data.children
			let responseBuffer = []

			posts.map(post => {
				const chunk = {
					title: post.data.title,
					url: post.data.url
				}
				responseBuffer.push(chunk)
			})

			res.send(responseBuffer)
		})
		.catch(e => {
			res.send(e)
			console.log('error:', e)
		})
})

module.exports = router
