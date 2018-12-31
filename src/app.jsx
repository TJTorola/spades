import React from 'react';
import ReactDom from 'react-dom';

import {
  cx,
  createAction,
  createStateMachine,
  getDisplayName,
  setField,
} from './lib.js';
import packageJson from '../package.json';

// STATIC DATA

export const ROOT_MENU_CONFIG = [
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
];

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

// HIGHER ORDER COMPONENTS

export const withHotKeys = mapPropsToKeys => WrappedComponent => {
  class WithHotKeys extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  WithHotKeys.displayName = `WithHotKeys(${getDisplayName(WrappedComponent)})`;
  return WithHotKeys;
}

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

export const Footer = ({ className }) => (
  <footer className={cx([
    "Footer",
    className
  ])}>
    V { packageJson.version }
  </footer>
);

export const Menu = ({
  focusedOption,
  onFocus,
  onItemSelect,
  options,
}) => (
  <ul className="Menu">
    {options.map(({ copy, key }) => (
      <li
        className={
          cx([
            'Menu-item',
            { 'is-focused': focusedOption === key }
          ])
        }
        key={key}
        onClick={() => onItemSelect(key)}
        onMouseEnter={() => onFocus(key)}
        role="button"
        tabIndex="0"
      >
        {copy}
      </li>
    ))}
  </ul>
);

export const RootMenu = props => (
  <Menu
    options={ROOT_MENU_CONFIG}
    {...props}
  />
);

export const Title = ({ className }) => (
  <h1 className={cx([
    'Title',
    className
  ])}>Spades</h1>
);

export const WelcomeScreen = ({ children }) => (
  <main className="WelcomeScreen">
    <section className="WelcomeScreen-content">
      <Title className="WelcomeScreen-title" />
      {children}
    </section>
    <Footer className="WelcomeScreen-footer" />
  </main>
);

// APP STATE LOGIC

export const actions = {
  selectFocusedOption: createAction('SELECT_FOCUSED_OPTION'),
  selectOption: createAction('SELECT_OPTION'),
  setFocusedOption: createAction('SET_FOCUSED_OPTION'),
}

export class Spades extends React.Component {
  static reducer = createStateMachine({
    initialMode: 'ROOT_MENU',
    modes: {
      ROOT_MENU: {
        initialData: {
          focusedOption: 'NEW_GAME',
        },
        actions: {
          SET_FOCUSED_OPTION: setField('focusedOption'),
        },
        transitions: {
          SELECT_OPTION: (_, data) => {
            switch (data.option) {
              case 'NEW_GAME':
                return { mode: 'GAME_VARIANT_MENU' };
              default:
                throw new Error(`SELECT_OPTION: Unhandled case ${data.option}`);
            }
          },
        }
      }
    }
  });

  state = Spades.reducer(undefined, { type: '@FOOBAR' });
  dispatch = action => this.setState(Spades.reducer(this.state, action));

  render() {
    switch (this.state.mode) {
      case "ROOT_MENU":
        return (
          <WelcomeScreen>
            <RootMenu
              focusedOption={this.state.data.focusedOption}
              onFocus={key => this.dispatch(actions.setFocusedOption(key))}
              onItemSelect={console.log}
            />
          </WelcomeScreen>
        );

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

export const main = ({ nodeId }) => {
  ReactDom.render(<Spades />, document.getElementById(nodeId));
};


