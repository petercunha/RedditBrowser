import React, { Component } from 'react'
import axios from 'axios'

import './App.css'

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			subreddit: '',
			data: []
		}

		this.handleSubredditChange = this.handleSubredditChange.bind(this)
		this.pullSubredditData = this.pullSubredditData.bind(this)
		this.handleButtonClick = this.handleButtonClick.bind(this)
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
								onChange={this.handleSubredditChange}
								placeholder="Subreddit(s)"
							/>
							<button type="submit" className="btn btn-primary ml-2" onClick={this.handleButtonClick}>Go</button>
						</form>
					</header>
					<div className="container-fluid">
						<div className="embed-responsive">
							{this.getImageRows()}
						</div>
					</div>
				</div>
			</div>
		)
	}

	getImageRows() {
		const isImage = url => (url.match(/\.(jpeg|jpg|gif|png)$/) != null)
		return this.state.data.map(d => {
			if (d.url.includes('.webm') || d.url.includes('.mp4')) {
				return (
					<div className="row mt-2" key={d.title} style={{ height: '100vh', position: 'relative'}}>
						<div className="col-12">
							<video controls autoPlay loop muted><source src={d.url}></source></video>
						</div>
					</div>
				)
			} else {
				if (isImage(d.url)) {
					return (
						<div className="row mt-2" key={d.title} style={{ height: '100vh', position: 'relative' }}>
							<div className="col-12">
								<img src={d.url} title={d.title} alt={d.title} style={{ height: '100%', verticalAlign: 'top' }} />
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
				.get(`https://server-rcafkkgrdr.now.sh/${subs[sub]}`)
				.then(r => {
					let processed = r.data.map(x => {
						let url = x.url.replace(/^http:\/\//i, 'https://');;
						if (url.includes('//imgur.com')) {
							// Make sure it doesnt contain an album
							if (url.includes('/a/') || url.includes('/gallery/')) {
								// Return a blank pixel
								return { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', title: x.title }
							}

							let tmp = url.split('//')
							url = `https://i.${tmp[1]}.gif`
						}
						if (url.includes('//gfycat.com')) {
							let tmp = url.split('//')
							url = `https://giant.${tmp[1]}.webm`
						}
						return { url: url, title: x.title }
					})

					// Combine results from different subreddits and shuffle them
					let newData = this.state.data.concat(processed)
					if (subs.length > 1) newData = this.shuffle(newData)

					this.setState({ data: newData })
				})
				.catch(e => {
					console.log('error fetching subreddit data', e)
				})
		}
	}

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
		this.setState({ data: [] })
		this.pullSubredditData()
	}

	handleSubredditChange(event) {
		this.setState({ subreddit: event.target.value })
	}
}

export default App
