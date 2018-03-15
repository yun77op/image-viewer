import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {render} from 'react-dom';
import './style.css';

class ImageViewer extends Component {
  static defaultProps = {}
  static propTypes = {}
  state = {
    imageReady: false
  }

  componentWillMount() {
    this.reset();
  }

  reset() {
    const image = new Image();

    image.onload = () => {
      this.setState({
        imageReady: true
      }, () => {
        const dimension = this.calcDimension();
        this.dimension = dimension;
        this.fitableScale = dimension.scale;

        this.imgElement.style.transform = `scale(${dimension.scale})`;
      })
    }

    image.onerror = () => {
      // image error
    }

    image.src = this.props.url;
  }

  calcDistance(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];

    const distance = Math.sqrt(Math.pow(Math.abs(touch1.clientX - touch2.clientX), 2) +
                    Math.pow(Math.abs(touch1.clientY - touch2.clientY), 2));
    
    return distance;
  }

  findMidPoint(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];

    return {
      clientX: touch1.clientX + (touch2.clientX - touch1.clientX) / 2,
      clientY: touch1.clientY + (touch2.clientY - touch1.clientY) / 2
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    this.setState({
      hide: false,
      imageReady: false
    });

    this.reset();
  }

  close() {
    this._clickedRecorded = false;

    this.setState({
      hide: true
    });
  }

  onBackdropClick = () => {
    this.close();
  }

  onClick = (event) => {
    event.stopPropagation();

    if (!this._clickedRecorded) {
      this._clickedRecorded = true;
      this._clickedTime = Date.now();

      this.closeTimer = setTimeout(() => {
        // close
        this.close();
      }, 300);

      return;
    }

    clearTimeout(this.closeTimer);
    this._clickedRecorded = false;

    let targetScale;

    if (this.dimension.scale <= this.fitableScale) {
      targetScale = 2;
    } else {
      targetScale = this.fitableScale;
    }
    // enlarge or scale to fitable
    const scale = targetScale / this.dimension.scale;

    this.imgElement.classList.add('animating');

    this.scale({
      scale,
      clientX: event.clientX,
      clientY: event.clientY
    })

  }

  onTransitionEnd = () => {
    this.imgElement.classList.remove('animating');
  }

  scale({
    scale,
    clientX,
    clientY
  }) {
    const originLeft = (clientX - this.dimension.left) / this.dimension.scale;
    const originTop = (clientY - this.dimension.top) / this.dimension.scale;
    const targetScale = scale * this.dimension.scale;

    if (targetScale === this.fitableScale) {
      this.dimension.translateLeft = 0;
      this.dimension.translateTop = 0;
    }

    const transform = `scale(${targetScale}) translateX(${this.dimension.translateLeft}px) translateY(${this.dimension.translateTop}px)`;
    const origin = `${originLeft}px ${originTop}px`;

    this.dimension.scale = targetScale;

    if (targetScale === this.fitableScale) {
      const dimension = this.calcDimension();

      this.dimension.left = dimension.left;
      this.dimension.top = dimension.top;
    } else {
      this.dimension.left = clientX - (clientX - this.dimension.left) * scale;
      this.dimension.top = clientY - (clientY - this.dimension.top) * scale;
    }

    this.imgElement.style.transform = transform;

    if (!this._origin) {
      this.imgElement.style.transformOrigin = origin;
      this._origin = origin;
    }

    if (this.dimension.scale === this.fitableScale) {
      this._origin = null;
    }
  }

  onTouchStart = (event) => {
    const touches = event.touches;

    if (touches.length === 1) {
      const touch = touches[0];

      this._translateX = touch.clientX;
      this._translateY = touch.clientY;
      return;
    }

    if (touches.length !== 2) {
      return;
    }
    this.distance = this.calcDistance(touches);
    this.midPoint = this.findMidPoint(touches);
  }

  checkMovable({deltaX = 0, deltaY = 0} = {}) {
    const dimension = this.dimension;

    const result = {x: true, y: true}

    if (deltaX > 0 && dimension.left + deltaX > 0
      || deltaX < 0 && dimension.width * dimension.scale + dimension.left + deltaX < dimension.windowWidth) {
      result.x = false;
    }

    if (deltaY > 0 && dimension.top + deltaY > 0
      || deltaY < 0 && dimension.height * dimension.scale + dimension.top + deltaY < dimension.windowHeight) {
      result.y = false;
    }

    return result;
  }

  onTouchMove = (event) => {
    const touches = event.touches;

    this._touchMove = false;

    if (touches.length === 1) {
      const touch = touches[0];

      const checkResult = this.checkMovable({
        deltaX: touch.clientX - this._translateX,
        deltaY: touch.clientY - this._translateY
      });

      const deltaX = checkResult.x ? touch.clientX - this._translateX : 0;
      const deltaY = checkResult.y ? touch.clientY - this._translateY : 0;

      this._touchMove = true;

      this._deltaX = deltaX != 0 ? deltaX / this.dimension.scale : 0;
      this._deltaY = deltaY != 0 ? deltaY / this.dimension.scale : 0;

      const translateX = this.dimension.translateLeft + this._deltaX;
      const translateY = this.dimension.translateTop + this._deltaY;
      const transform = `scale(${this.dimension.scale}) translateX(${translateX}px) translateY(${translateY}px)`;

      this.imgElement.style.transform = transform;

      this._translateX = touch.clientX;
      this._translateY = touch.clientY;

      this.dimension.translateLeft = translateX;
      this.dimension.translateTop = translateY;

      this.dimension.left += this._deltaX * this.dimension.scale;
      this.dimension.top += this._deltaY * this.dimension.scale;
      return;
    }

    if (touches.length !== 2) {
      return;
    }

    const distance = this.calcDistance(touches);
    const scale = distance / this.distance;

    const midPoint = this.midPoint;

    const originLeft = midPoint.clientX - this.dimension.left;
    const originTop = midPoint.clientY - this.dimension.top;

    const targetScale = scale * this.dimension.scale;

    const transform = `scale(${targetScale}) translateX(${this.dimension.translateLeft}px) translateY(${this.dimension.translateTop}px)`;
    const origin = `${originLeft/targetScale}px ${originTop/targetScale}px`;

    this.imgElement.style.transform = transform;
    this.imgElement.style.transformOrigin = origin;

    this.dimension.scale = targetScale;

    this.dimension.left += (1 - scale) * (midPoint.clientX - this.dimension.left);
    this.dimension.top += (1 - scale) * (midPoint.clientY - this.dimension.top);

    this.distance = distance;
  }

  onTouchEnd = (event) => {
    // const touches = event.touches;

    if (this._touchMove) {
      // const touch = touches[0];

      // const translateX = this.dimension.translateLeft + touch.clientX - this._translateX;
      // const translateY = this.dimension.translateTop + touch.clientY - this._translateY;
      // const transform = `scale(${this.dimension.scale}) translateX(${translateX}px) translateY(${translateY}px)`;
    
      // this.imgElement.style.transform = transform;


      this.dimension.translateLeft += this._deltaX;
      this.dimension.translateTop += this._deltaY;
      this.dimension.left += this._deltaX * this.dimension.scale;
      this.dimension.top += this._deltaY * this.dimension.scale;

      this._translateX = null;
      this._translateY = null;

      this._deltaX = null;
      this._deltaY = null;

      this._touchMove = false;

      return;
    }
  }

  calcDimension() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
 
    const bound = {
      width: windowWidth,
      height: windowHeight
    };

    const ratio = Math.max(this.props.width / bound.width, this.props.height / bound.height, 1);
    const targetWidth = this.props.width / ratio;
    const targetHeight = this.props.height / ratio;

    const dimension = {
      windowWidth,
      windowHeight,
      width: targetWidth,
      height: targetHeight,
      left: (bound.width - targetWidth) / 2,
      top: (bound.height - targetHeight) / 2,
      translateLeft: 0,
      translateTop: 0,
      scale: 1 / ratio
    };

    return dimension;
  }

  render() {
    const {imageReady} = this.state;

    if (this.state.hide) {
      return null;
    }

    return (
      <div className="ImageViewer">
        <div className="ImageViewer-backdrop"></div>
        <div className="ImageViewer-body" onClick={this.onBackdropClick}>
        {
          imageReady ? (
            <img style={{'touchAction': 'none'}} className="ImageViewer-img" ref={(img) => {this.imgElement = img}}
              onClick={this.onClick}
              onTouchStart={this.onTouchStart}
              onTouchMove={this.onTouchMove}
              onTouchEnd={this.onTouchEnd}
              onTransitionEnd={this.onTransitionEnd}
              src={this.props.url} alt="图片" />
          ) : (
            <div className="ImageViewer-loading">图片载入中...</div>
          )
        }
        </div>
      </div>
    )
  }
}

export default ImageViewer

let element;

export const previewImage = ({url, width, height}) => {

    if (!element) {
      element = document.createElement('div');
      element.id = 'image-viewer-container';
    }

   render(<ImageViewer url={url} width={width} height={height} />, element, () => {

   });

   document.body.appendChild(element);
};
