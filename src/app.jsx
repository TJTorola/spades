import React from 'react';
import ReactDom from 'react-dom';

import {
  cx,
  getDisplayName,
  setField,
} from './lib.js';
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

export const withActions = (actions, initState) => WrappedComponent => {
  class WithReducer extends React.Component {
    state = initState

    handleAction = action => data => {
      this.setState(action(this.state, data))
    }

    actions = Object.keys(actions).reduce((acc, action) => ({
      ...acc,
      [action]: this.handleAction(actions[action])
    }), {})

    render() {
      return <WrappedComponent {...this.state} {...this.actions} />;
    }
  }

  WithReducer.displayName = `WithReducer(${getDisplayName(WrappedComponent)})`;
  return WithReducer;
}

export const withStateMachine = ({
  initialMode,
  modes
}) => WrappedComponent => {
  class WithStateMachine extends React.Component {
    state = {
      mode: initialMode,
      data: modes[initialMode]
    }

    handleAction = action => data => {
      this.setState({ data: action(this.state.data, data) });
    }

    handleTransition = transition => data => {
      this.setState(transition(this.state, data));
    }

    // TODO: MEMOIZE
    getMappedActions = actions => Object.keys(actions).reduce((acc, a) => ({
      ...acc,
      [a]: this.handleAction(actions[a])
    }), {})

    // TODO: MEMOIZE
    getMappedTransitions = transitions => (
      Object.keys(transitions).reduce((acc, t) => ({
        ...acc,
        [t]: this.handleTransition(transitions[t])
      }), {})
    )

    render() {
      const { transitions, actions } = modes[this.state.mode];

      return (
        <WrappedComponent
          mode={this.state.mode}
          data={this.state.data}
          actions={this.getMappedActions(actions)}
          transitions={this.getMappedTransitions(transitions)}
        />
      );
    }
  }

  WithStateMachine.displayName = (
    `WithStateMachine(${getDisplayName(WrappedComponent)})`
  );
  return WithStateMachine;
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

const setMode = mode => () => ({ mode });

export const Spades = withStateMachine({
  initialMode: 'ROOT_MENU',
  modes: {
    ROOT_MENU: {
      initialState: {},
      actions: {
        setFocusedOption: setField('focusedOption')
      },
      transitions: {
        newGame: setMode('GAME_VARIANT_MENU'),
        continue: setMode('PLAYING'),
        records: setMode('RECORDS'),
        settings: setMode('SETTINGS_MENU')
      },
    },
    SETTINGS_MENU: {
      initialState: {},
      actions: {},
      transitions: {}
    },
    PLAYING: {
      initialState: {},
      actions: {},
      transitions: {}
    }
  }
})(({
  mode,
  data,
  actions,
  transitions
}) => {
  switch (mode) {
    case "ROOT_MENU":
      return (
        <WelcomeScreen>
          <Menu
            options={[
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
            ]}
            focusedOption={data.focusedOption}
            onFocus={actions.setFocusedOption}
            onItemSelect={key => {
              switch (key) {
                case 'NEW_GAME':
                  return transitions.newGame();
                case 'CONTINUE':
                  return transitions.continue();
                case 'RECORD':
                  return transitions.records();
                case 'SETTINGS':
                  return transitions.settings();
                default:
                  throw new Error(
                    `ROOT_MENU_SELECT: Unhandled switch case ${key}`
                  );
              }
            }}
          />
        </WelcomeScreen>
      );

    case "SETTINGS_MENU":
      return <div>Settings placeholder</div>;

    case "PLAYING":
      return <div>Playing placeholder</div>;

    default:
      throw new Error(
        `ROOT_RENDER: Unhandled switch case ${this.state.mode}`
      );
  }
})

export const main = ({ nodeId }) => {
  ReactDom.render(<Spades />, document.getElementById(nodeId));
};


