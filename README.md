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
returned, unless forceReplace is set to true. In that case, all placeholders will be processed and can be
replaced using custom logic in transform function.

## Installation

```bash
yarn install @vojtechportes/react-substitute
```

or

```bash
npm install @vojtechportes/react-substitute
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
- `forceReplace` (boolean): If set to `true`, placeholders will be processed even if their values are not in context object - defaults to `undefined`<br />
- `transform` (fn): Transform function with arguments value, placeholder, key, modifiers and context that returns string or number - defaults to `undefined`<br />
- `contextType` ('list' | 'normal' | 'object'): Defines how context should be parsed. List will be split by commas, normal will be returned as is - defaults to `normal`<br />
- `returnReactElement` (boolean): When true react element will be returned, otherwise string - defaults to `false`<br />
- `components` (any[]): React components to be used for substitution: defaults to `undefined`

## Examples

### With context object

```typescript
import { substitute } from '@vojtechportes/react-substitute';
import React, { PropsWithChildren } from 'react';

export interface ILinkProps {
  to?: string;
}

export const Link: React.FC<PropsWithChildren<ILinkProps>> = ({
  children,
  to,
}) => <a href={to}>{children}</a>;

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

### Without context object and with forceReplace set to true

```typescript
import { substitute } from '@vojtechportes/react-substitute';
import React, { PropsWithChildren } from 'react';

export interface ILinkProps {
  to?: string;
}

export const Link: React.FC<PropsWithChildren<ILinkProps>> = ({
  children,
  to,
}) => <a href={to}>{children}</a>;

export const FauxLink: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => (
  <span style={{ textDecoration: 'underline', color: 'blue' }}>{children}</span>
);

export default function App() {
  const text =
    'Lorem ipsum dolor sit amet {user|123, John Doe}, {user|456, Jane Doe} {token|789} {group|011} {group}';

  const substitutedText = substitute(text, {
    transform: (value, _placeholder, key, _modifier, context) => {
      if (key === 'user') {
        const [userId, userName] = context;

        return `<0 to="/users/${userId}">${userName}</0>`;
      }

      if (key === 'token') {
        const [tokenId] = context;

        return `<1>${key}: ${tokenId}</1>`;
      }

      const [identifier] = context;

      if (identifier) {
        return `<1>${identifier}</1>`;
      }

      return value;
    },
    forceReplace: true,
    contextSeparator: '|',
    modifierSeparator: ':',
    contextType: 'list',
    components: [<Link />, <FauxLink />],
    returnReactElement: true,
  });

  return <div className="App">{substitutedText}</div>;
}

ReactDOM.render(<App />, document.getElementById('root'));
}
```
