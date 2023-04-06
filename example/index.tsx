import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FauxLink } from './FauxLink';
import { Link } from './Link';
import { substitute } from '../src/substitute';

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
