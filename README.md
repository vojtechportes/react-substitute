# React Substitute

<p align="center">
<a href="https://badge.fury.io/js/@vojtechportes%2Freact-substitute"><img src="https://badge.fury.io/js/@vojtechportes%2Freact-substitute.svg" alt="npm version" height="18"></a>
</p>

Highly configurable react substitute utility that can perform placeholder replacement by context values or react components.

## Description

React substitute replaces placeholders in a string. Default placeholder format is {placeholder}
and can be changed in options by changing patter property. Placeholders can also contain
modifiers and local context, that can be handeled in transform function. Format of a modifier in placeholder is
{placeholder|modifier:context}. Modifier and context separators can be changed in options by changing modifierSeparator
property. If placeholder value is not matched with any key in context object, empty string is
returned.

## Installation

```bash
yarn install @vojtechportes/react-substitute
```

or

```bash
npm isntall @vojtechportes/react-substitute
```

## API

### Arguments

1. str (string): String with placeholders to be replaced
2. options (object): Options object

#### Options

- `pattern` (RegExp): Placeholder pattern - defaults to `{}`<br />
- `modifierSeparator` (string): Modifier separator - defaults to `|`<br />
- `contextSeparator` (string): Local context separator - defaults to `:`<br />
- `context` (unknown): Object containing structured json object containing values used to replace placeholders - defaults to `{}`<br />
- `transform` (fn): Transform function with arguments value, placeholder, key, modifiers and context that returns string or number - defaults to `undefined`<br />
- `contextType` ('list' | 'normal' | 'object'): Defines how context should be parsed. List will be split by commas, normal will be returned as is - defaults to `normal`<br />
- `returnReactElement` (boolean): When true react element will be returned, otherwise string - defaults to `false`<br />
- `components` (any[]): React components to be used for substitution: defaults to `undefined`

## Example

```typescript
import { substitute } from '@vojtechportes/react-substitute';
import React, { PropsWithChildren } from 'react';

export interface LinkProps {
  to?: string;
}

export const Link: React.FC<PropsWithChildren<LinkProps>> = ({
  children,
  to,
}) => {
  return <a href={to}>{children}</a>;
};

export default function App() {
  const text =
    'Lorem ipsum dolor sit amet {user|123, John Doe}, {user|456, Jane Doe}';

  const substitutedText = substitute(text, {
    transform: (value, _placeholder, key, _modifier, context) => {
      if (key === 'user') {
        const [userId, userName] = context;

        return `<0 to="/users/${userId}">${userName}</0>`;
      }

      return value;
    },
    context: {
      user: '',
    },
    contextSeparator: '|',
    modifierSeparator: ':',
    contextType: 'list',
    components: [<Link />],
    returnReactElement: true,
  });

  return <div className="App">{substitutedText}</div>;

  ReactDOM.render(<App />, document.getElementById('root'));
}
```
