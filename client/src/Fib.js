import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues().catch(() => {
    });
    this.fetchIndex().catch(() => {
    });
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({
      values: values.data
    });
  }

  async fetchIndex() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({
      seenIndexes: seenIndexes.data
    });
  }

  handleSubmit = async ( event ) => {
    event.preventDefault();
    await axios.post('/api/values', {
      index: this.state.index
    });
    this.setState({ index: '' });
  };

  renderSeenIndexes() {
    return this.state.seenIndexes.map(( { number } ) => number).join(', ');
  }

  renderValues() {
    return Object.keys(this.state.values || []).map(( key ) => {
      return (
        <div key={key}>
          For index {key} I calculated {this.state.values[ key ]}
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="">Enter your index:</label>
          <input type="text"
                 value={this.state.index}
                 onChange={event => this.setState({ index: event.target.value })}/>
          <button type="submit">Submit</button>
        </form>
        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}
        <h3>Calculated values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}


export default Fib;
