const express = require('express')
const axios = require('axios')

var router = express.Router()

/* GET home page */
router.get('/', function (req, res, next) {
	res.json('ok')
})

/* GET subreddit */
router.get('/:subreddit', function (req, res, next) {
	try {
		axios
			.get(`https://www.reddit.com/r/${req.params.subreddit}.json`)
			.then(
				r => {
					const json = r.data
					const posts = json.data.children
					let responseBuffer = []

					posts.map(post => {
						const chunk = {
							url: post.data.url,
							title: post.data.title,
							link: post.data.permalink
						}
						responseBuffer.push(chunk)
					})

					res.json(responseBuffer)
				},
				err => {
					res.json('An error occured while accessing the Reddit API.')
				}
			)
	} catch (unknownErr) {
		res.json('An unknown error occured.')
	}
})

module.exports = router
