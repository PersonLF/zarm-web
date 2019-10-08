import React, { Component, ReactElement } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Tab from './Tab';
import Icon from '../icon';
import { GroupProps } from './PropsType';

class TabGroup extends Component<GroupProps, any> {
  static defaultProps = {
    prefixCls: 'zw-tabs',
    type: 'card',
    direction: 'horizontal',
    size: 'md',
    onChange: () => {},
    onTabClose: () => {},
  };

  static propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    type: PropTypes.oneOf(['card', 'line', 'noborder-card']),
    direction: PropTypes.oneOf(['horizontal', 'vertical']),
    closable: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onChange: PropTypes.func,
    onTabClose: PropTypes.func,
    onPrevClick: PropTypes.func,
    onNextClick: PropTypes.func,
  };

  private tabHeader;

  private activeTab;

  static getSelectIndex(children) {
    let selectIndex;
    React.Children.forEach(children, (item, $index) => {
      if ((item as ReactElement<any>).props && (item as ReactElement<any>).props.selected) {
        selectIndex = $index;
      }
    });
    return selectIndex;
  }

  constructor(props) {
    super(props);
    this.state = {
      value:
        props.value
        || props.defaultValue
        || TabGroup.getSelectIndex(props.children)
        || 0,
      lineWidth: 0,
      lineOffsetLeft: 0,
      headerWidth: 0,
      headerHeight: 0,
      isArrowShown: false,
    };
    this.tabHeader = React.createRef();
  }

  componentDidMount() {
    this.setActiveLineStyle();
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps || TabGroup.getSelectIndex(nextProps.children)) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  setActiveLineStyle() {
    const { width = 0, left = 0 } = (this.activeTab && this.activeTab.getBoundingClientRect()) || {};
    const { scrollWidth = 0, scrollHeight = 0, scrollLeft = 0 } = this.tabHeader.current || {};
    const { left: headerOffset = 0, width: headerWidth = 0, height: headerHeight = 0 } = (this.tabHeader.current && this.tabHeader.current.getBoundingClientRect()) || {};
    const { direction } = this.props;
    this.setState({
      lineWidth: width,
      lineOffsetLeft: left + scrollLeft - headerOffset,
      headerWidth,
      headerHeight,
      isArrowShown: (direction === 'horizontal' && scrollWidth > headerWidth) || (direction === 'vertical' && scrollHeight > headerHeight),
    });
  }

  getContentItemCls(idx) {
    const { prefixCls } = this.props;
    const { value } = this.state;
    return idx === value
      ? `${prefixCls}-body-item--active`
      : `${prefixCls}-body-item`;
  }

  handleTabClick = (index, disabled) => {
    const { onChange } = this.props;

    if (!disabled) {
      this.setState({ value: index }, () => {
        this.setActiveLineStyle();
        onChange(index);
      });
    }
  };

  handleTabClose = (index, disabled) => {
    const { onTabClose } = this.props;

    if (!disabled) {
      onTabClose(index);
    }
  };

  scrollLeftOrTop = () => {
    const { direction } = this.props;
    const { headerWidth, headerHeight } = this.state;
    if (direction === 'horizontal') {
      this.tabHeader.current.scrollLeft -= headerWidth;
    } else {
      this.tabHeader.current.scrollTop -= headerHeight;
    }
  };

  scrollRightOrBottom = () => {
    const { direction } = this.props;
    const { headerWidth, headerHeight } = this.state;
    if (direction === 'horizontal') {
      this.tabHeader.current.scrollLeft += headerWidth;
    } else {
      this.tabHeader.current.scrollTop += headerHeight;
    }
  };

  render() {
    const {
      className, children, style, prefixCls, type, direction, size, closable,
    } = this.props;
    const { value, lineWidth, lineOffsetLeft, isArrowShown } = this.state;

    const cls = classnames({
      [prefixCls!]: true,
      [`tabs-${type}`]: true,
      [`tabs-${direction}`!]: true,
      [className!]: !!className,
    });

    const headerCls = classnames({
      [`${prefixCls}-header`]: true,
      [`size-${size}`!]: true,
    });

    const arrowL = direction === 'horizontal' ? 'left' : 'top';
    const arrowR = direction === 'horizontal' ? 'right' : 'bottom';
    const scrollPadding = direction === 'horizontal' ? '0 20px' : '20px 0';

    const items = React.Children.map(children, (item: React.ReactElement<any>, $index) => {
      const tabHeaderCls = classnames({
        [`${prefixCls}-header-item`]: true,
        [`${prefixCls}-header-item--disabled`]: !!item.props.disabled,
        [`${prefixCls}-header-item--closable`]: !!closable,
        [`${prefixCls}-header-item--active`]: $index === value,
      });
      const bindActiveRef = $index === value ? { ref: (node) => { this.activeTab = node; } } : {};

      return (
        <li
          key={$index.toString()}
          className={tabHeaderCls}
          {...bindActiveRef}
          onClick={() => { this.handleTabClick($index, item.props.disabled); }}
        >
          {item.props.title}
          {closable && <Icon type="wrong" onClick={() => { this.handleTabClose($index, item.props.disabled); }} />}
        </li>
      );
    });

    const content = React.Children.map(children, (item, $index) => {
      return (
        <Tab {...(item as ReactElement<any>).props} selected={value === $index}>
          {(item as ReactElement<any>).props.children}
        </Tab>
      );
    });

    return (
      <div className={cls} style={style}>
        <div className={headerCls} style={{ padding: isArrowShown ? scrollPadding : 0 }}>
          <ul className='scroll-content' ref={this.tabHeader}>
            {items}
            {
              type === 'line' && (
                <div
                  className={classnames(`${prefixCls}-line`)}
                  style={{
                    width: lineWidth,
                    transform: `translate3d(${lineOffsetLeft}px,0,0)`,
                  }}
                />
              )
            }
          </ul>
          {
            isArrowShown && <Icon type={`arrow-${arrowL}`} className={`tabs-arrow tabs-arrow-${arrowL}`} onClick={() => this.scrollLeftOrTop()} />
          }
          {
            isArrowShown && <Icon type={`arrow-${arrowR}`} className={`tabs-arrow tabs-arrow-${arrowR}`} onClick={() => this.scrollRightOrBottom()} />
          }
        </div>
        <div className={`${prefixCls}-body`}>{content}</div>
      </div>
    );
  }
}

export default TabGroup;
