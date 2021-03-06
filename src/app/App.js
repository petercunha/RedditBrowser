import React, { Component } from 'react'
import axios from 'axios'

import './App.css'

const SERVER_URL = 'https://redditbrowser.now.sh'

class App extends Component {

	constructor(props) {
		super(props)

		this.state = {
			subreddit: '',
			data: [],
			loading: false
		}

		this.handleSubredditChange = this.handleSubredditChange.bind(this)
		this.pullSubredditData = this.pullSubredditData.bind(this)
		this.handleButtonClick = this.handleButtonClick.bind(this)
	}

	componentDidMount() {
		// If there are subreddits in the url, use them for search
		let url = new URL(window.location.href)
		let searchParams = new URLSearchParams(url.search)
		let query = searchParams.get('r')

		if (query) {
			this.setState(
				{ subreddit: query, loading: true },
				() => { this.pullSubredditData() }
			)
		}
	}

	render() {
		return (
			<div className="App">
				<div className="container-fluid mt-3">
					<div className="row justify-content-center">
						<h2 className="text-light font-weight-light mt-4 mb-3">Reddit Image Browser</h2>
					</div>
					<div className="row justify-content-center">
						<div className="col-auto">
							<form className="form-inline justify-content-center">
								<div className="form-group">
									<input
										type="text"
										name="subreddit"
										value={this.state.subreddit}
										onChange={this.handleSubredditChange}
										placeholder="Subreddits"
										className="form-control"
									/>
								</div>
								<div className="form-group">
									<button type="submit" className="btn btn-primary ml-2" onClick={this.handleButtonClick}>Go</button>
								</div>
							</form>
						</div>
					</div>
					<div className="container-fluid h-100 mt-5">
						{
							this.state.loading ? (
								<div className="row mt-10">
									<div className="col-12">
										<h3 className="text-white-50 font-weight-light">Loading...</h3>
									</div>
								</div>
							) : null
						}
						<div className="embed-responsive">
							{this.getImageRows()}
						</div>
					</div>
				</div>
			</div>
		)
	}

	getImageRows() {
		const isImage = url => (url.match(/\.(jpeg|jpg|gif|png|)$/) != null)
		return this.state.data.map(d => {
			if (d.url.includes('.webm') || d.url.includes('.mp4')) {
				return (
					<div className="row mt-2 desktopImageFill" key={d.title}>
						<div className="col-12">
							<video controls autoPlay loop muted title={d.title}>
								<source src={d.url} />
							</video>
						</div>
					</div>
				)
			} else {
				if (isImage(d.url)) {
					return (
						<div className="row mt-2 desktopImageFill" key={d.title}>
							<div className="col-12">
								<a href={`https://reddit.com${d.link}`} target="_blank">
									<img src={d.url} title={d.title} alt={d.title} style={{ height: '100%', verticalAlign: 'top' }} />
								</a>
							</div>
						</div>
					)
				} else {
					return null
				}
			}
		})
	}

	pullSubredditData() {
		window.history.pushState({}, this.state.subreddit, `?r=${this.state.subreddit}`);

		// Split by commas and spaces
		let subs = this.state.subreddit.split(',')
		if (subs.length === 1) subs = this.state.subreddit.split(' ')

		// Array of JSON arrays. We will shuffle this together later.
		let stack2d = []

		for (let sub in subs) {
			axios
				.post(`${SERVER_URL}/search`, { query: subs[sub] })
				.then(r => {
					// eslint-disable-next-line
					let processed = r.data.map(x => {
						let url = x.url.replace(/^http:\/\//i, 'https://');;
						if (url.includes('//imgur.com')) {
							// Make sure it doesnt contain an album
							if (url.includes('/a/') || url.includes('/gallery/')) {
								// Return a blank pixel
								return { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', title: '', link: '' }
							}

							let tmp = url.split('//')
							url = `https://i.${tmp[1]}.gif`
						}
						if (url.includes('//gfycat.com')) {
							let tmp = url.split('//')
							url = `https://giant.${tmp[1]}.webm`
						}
						return { url: url, title: x.title, link: x.link }
					})
					stack2d.push(processed)

					// Only setState when all subreddit data has been pulled
					if (stack2d.length === subs.length) {
						let finalData = this.shuffleCombine(stack2d)
						this.setState({ data: finalData, loading: false })
					}
				})
				.catch(e => {
					console.log('error fetching subreddit data', e)
				})
		}
	}

	isImage = url => (url.match(/\.(jpeg|jpg|gif|png)$/) != null)

	mapRow = (arr) => arr.map(d => {
		return (
			<div className="row mt-2 desktopImageFill" key={d}>
				<div className="col-12">
					{d}
				</div>
			</div>
		)
	})

	mapMedia = (arr) => arr.map(d => {
		console.log(d.link);
		if (d.url.includes('.webm') || d.url.includes('.mp4')) {
			return (
				<video controls autoPlay loop muted><source src={d.url}></source></video>
			)
		} else {
			if (this.isImage(d.url)) {
				return (
					<a href={`https://reddit.com${d.link}`} target="_blank">
						<img src={d.url} title={d.title} alt={d.title} style={{ height: '100%', verticalAlign: 'top' }} />
					</a>
				)
			} else {
				return null
			}
		}
	})

	/**
	 * Randomize array element order in-place.
	 * Using Durstenfeld shuffle algorithm.
	 */
	shuffle(a) {
		var j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}
		return a;
	}

	shuffleCombine(a) {
		let arr = []
		for (let e = 0; e < 50; e++) {
			for (let i = 0; i < a.length; i++) {
				let post = a[i][e]
				if (post) {
					arr.push(post)
				}
			}
		}
		return arr
	}

	handleButtonClick(event) {
		event.preventDefault()
		this.setState({ data: [], loading: true })
		this.pullSubredditData()
	}

	handleSubredditChange(event) {
		this.setState({ subreddit: event.target.value })
	}
}

export default App
