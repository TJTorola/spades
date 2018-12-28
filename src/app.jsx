import React from 'react';
import ReactDom from 'react-dom';

import packageJson from '../package.json';

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
  <section className="Menu">
    <Header />
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

export const mergeData = (state, data) => ({
  mode: state.mode,
  data: {
    ...state.data,
    ...data
  }
});

export const mergeDataTests = makeSuite([
  assertIs(
    'mergeData() works',
    mergeData(
      {
        mode: 'TEST',
        data: {
          foo: 2,
          bar: 5
        }
      },
      { foo: 3 }
    ).data.foo,
    3
  )
]);

export const typeOf = something => {
  if (Array.isArray(something)) {
    return ({
      type: 'array',
      isRef: true
    });
  } else if (something === null) {
    return ({
      type: 'null',
      isRef: false
    });
  } else {
    const type = typeof something;

    return ({
      type,
      isRef: type === 'object'
    });
  }
}

export const typeOfTests = makeSuite([
  assertIs(
    'typeOf() works for array type',
    typeOf([3]).type,
    'array'
  ),

  assertIs(
    'typeOf() works for array isRef',
    typeOf([]).isRef,
    true
  ),

  assertIs(
    'typeOf() works for object type',
    typeOf({ foo: 1 }).type,
    'object'
  ),

  assertIs(
    'typeOf() works for object isRef',
    typeOf([3]).isRef,
    true
  ),

  assertIs(
    'typeOf() works for number type',
    typeOf(2).type,
    'number',
  ),

  assertIs(
    'typeOf() works for number isRef',
    typeOf(2).isRef,
    false
  ),

  assertIs(
    'typeOf() works for null type',
    typeOf(null).type,
    'null',
  ),

  assertIs(
    'typeOf() works for null isRef',
    typeOf(null).isRef,
    false
  ),
]);

// COMPONENTS

export const Card = ({
  width = 80,
  suit,
  value
}) => (
  <img
    width={width}
    alt={`The ${value.toLowerCase()} of ${suit.toLowerCase()}`}
    src={`/imgs/cards/${SUITS[suit]}${VALUES[value]}.svg`}
  />
);

export const Footer = () => (
  <footer className="Footer">
    V { packageJson.version }
  </footer>
);


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

export const Header = () => (
  <h1 className="Header">Spades</h1>
);

// APP STATE LOGIC

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

export const reducer = (state, action) => {
  switch (state.mode) {
    case 'MENU':
      return menuReducer(state, action);

    default:
      throw new Error(`MAIN_REDUCER: Unhandled switch case ${state.mode}`);
  }
};

export class Spades extends React.Component {
  state = { 
    mode: 'MENU',
    data: {
      currentSelection: 'NEW_GAME'
    }
  }

  dispatch = action => this.setState(reducer(this.state, action));

  render() {
    const props = {
      dispatch: this.dispatch,
      ...this.state.data
    };

    switch (this.state.mode) {
      case "MENU":
        return <RootMenu {...props} />;

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

export const main = nodeId => {
  ReactDom.render(<Spades />, document.getElementById(nodeId));
};
