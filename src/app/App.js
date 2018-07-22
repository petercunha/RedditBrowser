import React, { Component } from 'react'
import axios from 'axios'

import './App.css'

const SERVER_URL = 'https://server-ptggixhuka.now.sh'

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
		var parts = window.location.href.split('/');
		var lastSegment = parts.pop() || parts.pop();
		if (!lastSegment.includes(window.location.host) && lastSegment !== '' && parts.length > 1) {

			this.setState(
				{ subreddit: lastSegment, loading: true },
				() => { this.pullSubredditData() }
			)
		}
	}

	render() {
		return (
			<div className="App">
				<div className="container-fluid mt-3">
					<header className="App-header">
						<h1 className="App-title mt-2">Reddit Image Browser</h1>
						<form>
							<input
								type="text"
								name="subreddit"
								value={this.state.subreddit}
								onChange={this.handleSubredditChange}
								placeholder="Subreddits"
							/>
							<button type="submit" className="btn btn-primary ml-2" onClick={this.handleButtonClick}>Go</button>
						</form>
					</header>
					<div className="container-fluid h-100">
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
								<a href={d.link} target="_blank">
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
		// Split by commas and spaces
		let subs = this.state.subreddit.split(',')
		if (subs.length === 1) subs = this.state.subreddit.split(' ')

		for (let sub in subs) {
			axios
				.get(`${SERVER_URL}/${subs[sub]}`)
				.then(r => {
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

					// Combine results from different subreddits and shuffle them
					let newData = this.state.data.concat(processed)
					if (subs.length > 1) newData = this.shuffle(newData)

					this.setState({ data: newData, loading: false })
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
