import { each } from '@antv/util';
import Action from '../base';
import {IShape} from '../../../dependents';
import { getDelegationObject, getElements, getElementValue, isList, isSlider, isMask, intersectRect } from '../util';
const CONST_DISTANCE = 10;
/**
 * 元素过滤的 Action，控制元素的显示隐藏
 */
class ElementFilter extends Action {
  /**
   * 过滤
   */
  public filter() {
    const delegateObject = getDelegationObject(this.context);
    const view = this.context.view;
    const elements = getElements(view);
    if(isMask(this.context)) {
      const maskShape = this.context.event.target as IShape;
      const maskBBox = maskShape.getCanvasBBox();
      // 限定一个最小的 mask 大小，否则会出现交互不流畅
      if (maskBBox.width >= CONST_DISTANCE || maskBBox.height >= CONST_DISTANCE) {
        each(elements, (el) => {
          const elBBox = el.getBBox();
          if (intersectRect(maskBBox, elBBox)) {
            el.show();
          } else {
            el.hide();
          }
        });
      }
    } else if (delegateObject) {
      const { component } = delegateObject;
      const field = component.get('field');
      // 列表类的组件能够触发
      if (isList(delegateObject)) {
        if (field) {
          const unCheckedItems = component.getItemsByState('unchecked');
          const scale = view.getScaleByField(field);
          const names = unCheckedItems.map((item) => item.name);
          // 直接控制显示、隐藏
          each(elements, (el) => {
            const value = getElementValue(el, field);
            const text = scale.getText(value);
            if (names.indexOf(text) >= 0) {
              el.hide();
            } else {
              el.show();
            }
          });
        }
      } else if (isSlider(delegateObject)) {
        const range = component.getValue();
        const [min, max] = range;
        each(elements, (el) => {
          const value = getElementValue(el, field);
          if (value >= min && value <= max) {
            el.show();
          } else {
            el.hide();
          }
        });
      }
    }
  }
  /**
   * 清除过滤
   */
  public clear() {
    const elements = getElements(this.context.view);
    each(elements, (el) => {
      el.show();
    });
  }
}

export default ElementFilter;
