import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {previewImage} from '../src/ImageViewer';

storiesOf('ImageViewer', module)
  .add('default', () => (
    <button type="button" onClick={() => {
      document.getElementsByTagName('meta')[1].content = 'width=device-width, initial-scale=1, user-scalable=no';

        previewImage({
            width: 300,
            height: 420,
            url: 'https://easyread.nosdn.127.net/pic20171215c9217d26f305491d86f96df8ca4c8824.jpg'
        });
    }}>click to preview image</button>
  ))