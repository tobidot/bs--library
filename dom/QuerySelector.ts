import { assert, assertNotNull } from "../flow/Assert";
import { Class } from "../flow/types/Class";

/**
 * This should include `document` and any `Element`
 */
interface HasQuerySelector {
    querySelector(selector: string): Element | null;
}
/**
 * This should include `document` and any `Element`
 */
interface HasIdSelector {
    getElementById(id: string): Element | null;
}
/**
 * This should include `document` and any `Element`
 */
interface HasClassSelector {
    getElementsByClassName(classname: string): HTMLCollection;
}

/**
 * Do a query selection on a root element expecting a specific type of element.
 * 
 * @param root 
 * @param selector 
 */
export function getElementByQuerySelector(root: HasQuerySelector, selector: string): HTMLElement;
export function getElementByQuerySelector<T extends HTMLElement>(root: HasQuerySelector, selector: string, class_type: Class<T>): T;
export function getElementByQuerySelector<T extends HTMLElement>(
    root: HasQuerySelector,
    selector: string,
    class_type?: Class<T>
): T {
    const element = root.querySelector(selector);
    assertNotNull(element, "Element not found: " + selector);
    assertElementIsOfClass(element, class_type);
    return element;
}

/**
 * Do a query selection on a root element expecting a specific type of element.
 * 
 * @param root 
 * @param selector 
 */
export function getElementById(id: string): HTMLElement;
export function getElementById<T extends HTMLElement>(id: string, class_type: Class<T>): T;
export function getElementById<T extends HTMLElement>(
    id: string,
    class_type?: Class<T>
): T {
    const element = document.getElementById(id);
    assertNotNull(element, "Element not found: #" + id);
    assertElementIsOfClass(element, class_type);
    return element;
}

/**
 * Do a query selection on a root element expecting a specific type of element.
 * 
 * @param root 
 * @param selector 
 */
export function getElementByClassName(root: HasClassSelector, class_name: string): HTMLElement;
export function getElementByClassName<T extends HTMLElement>(root: HasClassSelector, class_name: string, class_type: Class<T>): T;
export function getElementByClassName<T extends HTMLElement>(
    root: HasClassSelector,
    class_name: string,
    class_type?: Class<T>
): T {
    const element = root.getElementsByClassName(class_name).item(0);
    assertNotNull(element, "Element not found: ." + class_name);
    assertElementIsOfClass(element, class_type);
    return element;
}

/**
 * Verifies that a en element is a of a specific type
 * 
 * @param element The element to check
 * @param class_type The class type to check for or HTMLElement if not specified
 * @returns {boolean}
 */
function isOfClass(element: Element): element is HTMLElement;
function isOfClass<T extends Element>(element: Element, class_type?: Class<T>): element is T;
function isOfClass<T extends Element>(element: Element, class_type?: Class<T>): element is T {
    if (class_type) {
        return element instanceof class_type;
    }
    return element instanceof HTMLElement
}

/**
 * Make sure an element is of a specific type and
 * @param element The element to check
 * @param class_type The class type to check for or HTMLElement if not specified
 */
function assertElementIsOfClass(element: Element): asserts element is HTMLElement;
function assertElementIsOfClass<T extends Element>(element: Element, class_type?: Class<T>): asserts element is T;
function assertElementIsOfClass<T extends Element>(
    element: Element, 
    class_type?: Class<T>
): asserts element is T {
    assert(isOfClass(element, class_type), "Element not of required type" + (class_type ? class_type.name : "HTMLElement"));
}