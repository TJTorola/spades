import React, { Fragment } from 'react';

import packageJson from '../package.json';
import * as cardSvgs from './svgs/cards';

const SUITS = {
  SPADES:   's',
  CLUBS:    'c',
  HEARTS:   'h',
  DIAMONDS: 'd'
};

const VALUES = {
  ACE:   'a',
  KING:  'k',
  QUEEN: 'q',
  JACK:  'j',
  TEN:   '0',
  NINE:  '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX:   '6',
  FIVE:  '5',
  FOUR:  '4',
  THREE: '3',
  TWO:   '2'
};

export const menuReducer = (state, action) => {
  switch(action.type) {
    case 'SELECT_OPTION':
      return mergeData(state, action.data);
    
    case 'START_GAME':
      return {
        mode: 'GAME',
        data: {}
      };

    default:
      throw new Error(`MENU_REDUCER: Unhandled switch case ${action.type}`);
  }
};

export const mergeData = (state, data) => ({
  mode: state.mode,
  data: {
    ...state.data,
    ...data
  }
});

export const reducer = (state, action) => {
  switch (state.mode) {
    case 'MENU':
      return menuReducer(state, action);

    default:
      throw new Error(`MAIN_REDUCER: Unhandled switch case ${state.mode}`);
  }
};


export const Card = ({
  width = 80,
  suit,
  value
}) => (
  <img
    width={width}
    alt={`The ${value.toLowerCase()} of ${suit.toLowerCase()}`}
    src={cardSvgs[`${SUITS[suit]}${VALUES[value]}`]}
  />
);

export const Footer = () => (
  <footer>
    V { packageJson.version }
  </footer>
);

export const Menu = ({ currentSelection }) => (
  <Fragment>
    <ul>
      <li>New Game</li>
      <li>Continue</li>
      <li>Record</li>
      <li>Settings</li>
    </ul>
    <Footer />
  </Fragment>
);

export class Root extends React.Component {
  state = { 
    mode: 'MENU',
    data: {
      currentSelection: 'NEW_GAME'
    }
  }

  dispatch = action => this.setState(reducer(this.state, action));

  render() {
    switch (this.state.mode) {
      case "MENU":
        return <Menu dispatch={this.dispatch} {...this.state.data} />;

      case "SETTINGS":
        return <div>Placeholder</div>;

      case "PLAYING":
        return <div>Placeholder</div>;

      default:
        throw new Error(`ROOT_RENDER: Unhandled switch case ${this.state.mode}`);
    }
  }
}

