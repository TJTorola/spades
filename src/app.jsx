import React from 'react';

import packageJson from '../package.json';
import * as cardSvgs from './svgs/cards';

// STATIC DATA

export const SUITS = {
  SPADES:   's',
  CLUBS:    'c',
  HEARTS:   'h',
  DIAMONDS: 'd'
};

export const VALUES = {
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

// FUNCTIONS

// HIGHER ORDER
// Importantly at the top of the file since
// these may get called at require time.

export const makeMenu = options => ({ currentSelection }) => (
  <section className="Menu-wrapper">
    <ul className="Menu-list">
      {options.map(({ copy, key }) => (
        <li
          key={key}
          className={
            cx({
              'is-selected': currentSelection === key,
            }, 'Menu-item')
          }
        >
          {copy}
        </li>
      ))}
    </ul>
    <Footer />
  </section>
);

export const makeSuite = tests => () => (
  tests.reduce((acc, test) => (
    // NOTE: this short-circuits later tests, maybe good?
    acc && test()
  ), true)
);

// LOWLY (SALT_OF_THE_EARTH) FUNCTIONS

export const assertIs = (
  testDesc,
  left,
  right
) => () => {
  if (left === right) {
    console.log(`PASSED: ${testDesc}`);
    return true;
  } else {
    console.error(`FAILED: ${testDesc}`);
    console.log({
      left,
      right
    });
    return false;
  }
};

/**
 * Func: cx (classNames) a utility for inlining classname logic
 *
 * @param: optionalClasses
 *   @type: { [className]: Bool }
 *   @desc: className will be applied if the obj[className] === true
 * @param defaultClasses
 *   @type ?String
 *   @desc classes that will always be applied
 */

export const cx = (
  optionalClasses,
  defaultClasses
) => (
  Object.keys(optionalClasses).reduce(
    (acc, className) => (
      optionalClasses[className] === true
        ? [...acc, className]
        : acc
    ),
    (!!defaultClasses ? [defaultClasses] : []) 
  ).join(' ')
);

export const cxTests = makeSuite([
  assertIs(
    'cx() correctly applies optionalClasses',
    cx({
      foo: true,
      bar: false
    }),
    'foo'
  ),

  assertIs(
    'cx() adds defaultClasses',
    cx({
      foo: true,
    }, 'bar'),
    'bar foo'
  ),

  assertIs(
    'cx() adds defaultClasses when there is no else',
    cx({
      foo: false,
    }, 'bar'),
    'bar'
  )
]);



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

// COMPONENTS

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
        return <RootMenu dispatch={this.dispatch} {...this.state.data} />;

      case "SETTINGS":
        return <div>Placeholder</div>;

      case "PLAYING":
        return <div>Placeholder</div>;

      default:
        throw new Error(
          `ROOT_RENDER: Unhandled switch case ${this.state.mode}`
        );
    }
  }
}

export const RootMenu = makeMenu([
  {
    copy: 'New Game',
    key: 'NEW_GAME',
  },
  {
    copy: 'Continue',
    key: 'CONTINUE',
  },
  {
    copy: 'Record',
    key: 'RECORD',
  },
  {
    copy: 'Settings',
    key: 'SETTINGS',
  }
]);

