import React from 'react';
import ReactDom from 'react-dom';

import packageJson from '../package.json';

// STATIC DATA

export const ROOT_MENU_CONFIG = {
  OPTIONS: {
    NEW_GAME: {
      copy: 'New Game',
      key: 'NEW_GAME',
    },
    CONTINUE: {
      copy: 'Continue',
      key: 'CONTINUE',
    },
    RECORD: {
      copy: 'Record',
      key: 'RECORD',
    },
    SETTINGS: {
      copy: 'Settings',
      key: 'SETTINGS',
    }
  }
};

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

export const makeMenu = options => ({ focusedOption, dispatch }) => (
  <ul className="Menu">
    {options.map(({ copy, key }) => (
      <li
        role="button"
        tabIndex="0"
        onMouseEnter={() => dispatch(actions.setFocusedOption(key))}
        className={
          cx([
            'Menu-item',
            { 'is-focused': focusedOption === key }
          ])
        }
        key={key}
      >
        {copy}
      </li>
    ))}
  </ul>
);

export const makeSuite = tests => () => (
  tests.reduce((acc, test) => (
    // NOTE: this short-circuits later tests, maybe good?
    acc && test()
  ), true)
);

// LOWLY (SALT_OF_THE_EARTH) FUNCTIONS

export const assertEquals = (
  testDesc,
  leftFn,
  right
) => () => {
  const left = leftFn();
  if (deepEquals(left, right)) {
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

export const assertIs = (
  testDesc,
  leftFn,
  right
) => () => {
  const left = leftFn();
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
 * @param: classChunks 
 *   @type: Array<?(String | { [className: String]: Boolean }>
 *   @desc: Chunks of objects to resolve to a single string of classes
 * @return String
 */

export const cx = (
  classChunks
) => classChunks.reduce((acc, chunk) => {
  const chunkType = typeOf(chunk).type;
  if (chunkType === 'undefined' || chunkType === 'null') {
    return acc;
  } else if (chunkType === 'string') {
    return (chunk !== '')
      ? (acc !== '')
        ? `${acc} ${chunk}`
        : chunk
      : acc;
  } else if (chunkType === 'object') {
    return Object.keys(chunk).reduce(
      (acc, className) => (
        chunk[className] === true
          ? [...acc, className]
          : acc
      ),
      (acc === '' ? [] : [acc])
    ).join(' ');
  } else {
    throw new Error(`CX: invalid chunk type '${chunkType}'`);
  }
}, '');

export const cxTests = makeSuite([
  assertIs(
    'cx() correctly applies optionalClasses',
    () => cx([{
      foo: true,
      bar: false
    }]),
    'foo'
  ),

  assertIs(
    'cx() adds defaultClasses',
    () => cx([{
      foo: true,
    }, 'bar']),
    'foo bar'
  ),

  assertIs(
    'cx() adds defaultClasses when there is no else',
    () => cx([{
      foo: false,
    }, 'bar']),
    'bar'
  ),

  assertIs(
    'cx() allows undefined chunks',
    () => cx([
      'foo bar',
      undefined
    ]),
    'foo bar'
  ),

  assertIs(
    'cx() allows null chunks',
    () => cx([
      'foo bar',
      null
    ]),
    'foo bar'
  ),

  assertIs(
    'cx() handles empty chunks',
    () => cx([
      'foo',
      {},
      'bar',
      '',
      'baz',
      undefined
    ]),
    'foo bar baz'
  )
]);

export const deepEquals = (left, right) => {
  if (left === right) {
    return true;
  }

  const leftType = typeOf(left);
  const rightType = typeOf(right);

  if (leftType.type !== rightType.type) {
    return false;
  } else if (!leftType.isRef) {
    return left === right;
  } else if (leftType.type === 'object') {
    if (Object.keys(left).every(k => Object.keys(right).includes(k))) {
      return Object.keys(left).every(k => (
        deepEquals(left[k], right[k])
      ));
    } else {
      return false;
    }
  } else if (leftType.type === 'array') {
    if (left.length !== right.length) {
      return false;
    } else {
      return left.every((l, idx) => (
        deepEquals(l, right[idx])
      ));
    }
  } else {
    throw new Error(`DEEP_EQUALS: Unhandled type ${leftType.type}`);
  }
};

export const deepEqualsTests = makeSuite([
  assertIs(
    'deepEquals() handles non-equal types',
    () => deepEquals(1, 2),
    false
  ),

  assertIs(
    'deepEquals() handles basic equal types',
    () => deepEquals(1, 1),
    true
  ),

  assertIs(
    'deepEquals() handles non-equal objects',
    () => deepEquals({ foo: 1 }, { foo: 2 }),
    false
  ),

  assertIs(
    'deepEquals() handles equal objects',
    () => deepEquals({ foo: 1 }, { foo: 1 }),
    true
  ),

  assertIs(
    'deepEquals() handles nested objects',
    () => deepEquals({
      foo: {
        bar: {
          baz: 2,
          bit: 1
        }
      }
    }, {
      foo: {
        bar: {
          bit: 1,
          baz: 2
        }
      }
    }),
    true
  ),

  assertIs(
    'deepEquals() handles non-equal arrays',
    () => deepEquals([1, 2], [2, 1]),
    false
  ),

  assertIs(
    'deepEquals() handles equal arrays',
    () => deepEquals([1], [1]),
    true
  ),

  assertIs(
    'deepEquals() handles nested arrays',
    () => deepEquals([
      ['foo', 'bar', 'baz'],
      [1, 2, 3]
    ], [
      ['foo', 'bar', 'baz'],
      [1, 2, 3]
    ]),
    true
  ),

  assertIs(
    'deepEquals() handles nested object arrays',
    () => deepEquals({
      foo: [1, 2, 3],
      bar: 'foo'
    }, {
      bar: 'foo',
      foo: [1, 2, 3]
    }),
    true
  ),

  assertIs(
    'deepEquals() handles nested array objects',
    () => deepEquals([
      { foo: 1 },
      { bar: 2 }
    ], [
      { foo: 1 },
      { bar: 2 }
    ]),
    true
  )
]);

export const getDisplayName = Component => (
  Component.displayName || Component.name || 'AnonComponent'
);

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
    () => mergeData(
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
  assertEquals(
    'typeOf() works for array',
    () => typeOf([3]),
    {
      type: 'array',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for object',
    () => typeOf({ foo: 1 }),
    {
      type: 'object',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for number',
    () => typeOf(2),
    {
      type: 'number',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for null',
    () => typeOf(null),
    {
      type: 'null',
      isRef: true
    }
  ),
]);

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


export const RootMenu = makeMenu([
  ROOT_MENU_CONFIG.OPTIONS.NEW_GAME,
  ROOT_MENU_CONFIG.OPTIONS.CONTINUE,
  ROOT_MENU_CONFIG.OPTIONS.RECORD,
  ROOT_MENU_CONFIG.OPTIONS.SETTINGS
]);

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
  setFocusedOption: option => ({
    type: 'SET_FOCUSED_OPTION',
    data: { focusedOption: option }
  }),

  startGame: () => ({
    type: 'START_GAME'
  })
};

export const menuReducer = (state, action) => {
  switch(action.type) {
    case 'SET_FOCUSED_OPTION':
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
      focusedOption: 'NEW_GAME'
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
        return (
          <WelcomeScreen>
            <RootMenu {...props} />
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
