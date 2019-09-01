import React, { Component } from 'react'
import axios from 'axios'
import Joker from './Joker'
import uuid from 'uuid/v4'
import './Joke.css'

const jokeURL = 'https://icanhazdadjoke.com/'

export default class Joke extends Component {
  static defaultProps = {
    numJokesToGet: 30
  };
  constructor(props) {
    super(props)
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false
    }
    this.seenJokes = new Set(this.state.jokes.map(j => j.text))
    console.log(this.seenJokes)
    this.handleVote = this.handleVote.bind(this)
    this.addJoke = this.addJoke.bind(this)
  }

  async componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes()
    }
  }
  async getJokes() {
    try {

      let jokes = []
      // joke.push(jokes.data.joke)

      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get(jokeURL, { headers: { Accept: 'application/json' } })

        let newJoke = res.data
        let jokeExist = jokes.some(j => j.id === res.data.id)
        console.log(jokeExist)
        if (this.seenJokes.has(newJoke.id)) {
          console.log(`Duplicate ${newJoke.joke}`)
          console.log('Wrong')
        }
        if (jokeExist) {
          console.log(`Duplicate pt2 ${newJoke.joke}`)
        }
        if (!jokeExist && !this.seenJokes.has(newJoke.joke)) {
          await jokes.push({ id: newJoke.id, text: newJoke.joke, votes: 0 })
          await this.seenJokes.add(newJoke)
        }

      }
      this.setState(prevState => ({
        jokes: jokes
      }))
      window.localStorage.setItem(
        'jokes',
        JSON.stringify(jokes)
      )
    } catch (e) {
      console.log(e)
      this.setState({ loading: false })
    }
  }



  handleVote(id, boto) {
    this.setState(st => ({
      jokes: st.jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + boto } : j
      )
    }),
      () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    )
  }

  async addJoke() {
    this.setState({
      loading: true
    })
    let joke = []
    let jokeReq = await axios.get(jokeURL, { headers: { Accept: 'application/json' } })
    joke.push({ id: jokeReq.data.id, text: jokeReq.data.joke, votes: 0 })
    this.setState(st => ({
      jokes: [...st.jokes, ...joke],
      loading: false
    }),
      () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    )
  }

  render() {
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading</h1>
        </div>
      )
    }
    let counter = this.state.jokes.length
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
    let joke = jokes.map(j =>
      <Joker
        key={j.id}
        text={j.text}
        votes={j.votes}
        upVote={() => this.handleVote(j.id, 1)}
        downVote={() => this.handleVote(j.id, -1)}
      />
    )

    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'>
            <span>Cheesy</span> Jokes
            </h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokeList-getMore' onClick={this.addJoke}>New Jokes</button>
          <p className='JokeList-counter'>{`Total Jokes: ${counter}`}</p>
        </div>
        <div className='JokeList-jokes'>
          {joke}
        </div>

      </div>

    )
  }
}
