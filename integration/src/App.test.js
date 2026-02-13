/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { it } from 'vitest';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);
  root.render(<App />);
  root.unmount();
  div.remove();
});
