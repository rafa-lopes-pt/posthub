export { default as __lodash } from 'lodash';
export { z as __zod } from 'zod';
import * as dayjs from 'dayjs';
export { dayjs as __dayjs };
export { default as __fuse } from 'fuse.js';
import { v4 } from 'uuid';

/** Represents an option of a ComboBox dataset */
interface ComboBoxOptionProps {
    /** Text to be displayed */
    label: string;
    /** Actual option value */
    value: string | number | boolean;
    /** Indicates whether the option is selectable */
    disabled?: boolean;
    checked?: boolean;
}
interface ComboBoxProps extends FormControlProps {
    /** Allows the user to select multiple options. @default false */
    allowMultiple?: boolean;
    /** Placeholder text for the input field @default "Select..." */
    placeholder?: string;
    /** If filtering is enabled, then this is used for the clear button's text @default "Clear..." */
    clearText?: string;
    /** Indicates if dataset is filterable @default false */
    allowFiltering?: boolean;
    /** Callback that receives the current dataset value each time an option is selected */
    onSelectHandler?: (selection: ComboBoxOptionProps | ComboBoxOptionProps[]) => void;
    /** Boolean flag to indicate whether the full options array should be returned, or only an array containing the checked options @default false  */
    returnFullDataset?: boolean;
    /** Dataset passed by reference. If a nullish value or an empty array is passed, the combobox is automatically disabled */
    dataset: ComboBoxOptionProps[];
    /** When provided, this will be used to filter the elements accordingly. @default fuse.js
     * @param {string} search receives the current string input from the searchbar
     * @returns {ComboBoxOptionProps[]} an array
     */
    filteringFunction?: (search: string) => ComboBoxOptionProps[];
}
declare class ComboBox extends FormControl<ComboBoxOptionProps | ComboBoxOptionProps[]> {
    private _dataset;
    private _filteredDataset;
    private _allowMultiple;
    private _placeholder;
    private _onSelectHandler?;
    private _clearText;
    private _isDropdownOpen;
    private _allowFiltering;
    private _filterFn;
    private _returnFullDataset;
    constructor(field: FormField<ComboBoxOptionProps | ComboBoxOptionProps[]>, props: ComboBoxProps);
    private _createSearchBar;
    private _createDropdown;
    private _refreshDropdownList;
    private _disableOnEmptyDataset;
    private _refreshChevron;
    private _createOption;
    private _createOptionsList;
    get modifierClasses(): string;
    toString(): string;
    private _displaySelection;
    private _onResetFilteredDataSearch;
    protected _onSelectHandlerProxy(): void;
    private _singleSelectEventHandlers;
    private _multiSelectEventHandlers;
    private _onChangeEventListeners;
    clearSelection(): void;
    private _onClearSelectionEventListeners;
    private _openDropdown;
    private _closeDropdown;
    private _openDropDownEventListener;
    private _closeDropdownOnBlur;
    private _closeDropdownOnOptionSelect;
    private _closeDropdownOnClearBtn;
    private _dropdownControlEventListeners;
    private _defaultFilteringFunction;
    private _onSearchEventListeners;
    private _handleInputTyping;
    set filteringFunction(callback: (search: string) => ComboBoxOptionProps[]);
    protected _applyEventListeners(): void;
    get dataset(): ComboBoxOptionProps[];
    set dataset(arr: ComboBoxOptionProps[]);
    render(): void;
}

type FormFieldType = string | number | boolean | ComboBoxOptionProps | ComboBoxOptionProps[];
interface FormFieldProps<T extends FormFieldType> {
    value: T;
    validatorCallback?: (v: T) => boolean;
    onChangeHandler?: (v: T) => void;
}
declare class FormField<T extends FormFieldType> {
    private _value;
    private _inputSelector?;
    private _validatorCallback?;
    private _onChangeHandler?;
    private _isValid;
    private _wasTouched;
    constructor(props?: FormFieldProps<T>);
    [Symbol.toStringTag](): string;
    [Symbol.toPrimitive](): string | T;
    toString(): string | T;
    validate(): boolean | null;
    focusOnInput(): void;
    set value(data: T);
    set inputSelector(selector: string);
    get value(): T;
    get wasTouched(): boolean;
    get isValid(): boolean;
    get hasValidation(): boolean;
}

/**
 * ALL HTMD Element MUST implement these methods
 */
interface HTMDElementInterface {
    /**
     * Discriminator to identify classes that implement this interface
     * @see isHTMDComponent
     */
    isHTMD: true;
    /**
     * A string representation used to render the actual element into the DOM
     */
    toString(): string;
    /**
     * Method used to render the actual element and apply the necessary event handlers
     */
    render: () => void;
    /**
     * Completely removes the element from the DOM
     */
    remove: () => void;
    /**
     * A css selector to specify where the element should be rendered
     * When nesting elements, the parent should be responsible for assigning the
     * containerSelector on its children
     */
    containerSelector?: string;
}

/**
 * A node represents a type that can be rendered to the DOM directly or via the HTMDElementInterface.render() method.
 * @see HTMDElementInterface
 */
type HTMDSingleNode = HTMDElementInterface | string | number;
/**
 * Represents a single node, collection of nodes, or a function that returns a single node.
 * Wrapping a node on an anonymous function is useful for updating text on components.
 * @example
 * const text = new Text([()=>user.name, `\`s Dashboard`], { type: 'h1' });
 * //perform some logic that changes the user.name
 * text.refresh() // recalls the function and successfully updates the first child
 * //whitout the function , the actual value of user.name is passed, instead of a ref to user.name
 */
type HTMDNode = HTMDSingleNode | (() => HTMDNode) | Array<HTMDNode | (() => HTMDNode)>;

/**
 * Universally Unique Identifier - Use this type just to provide more clarity. UUID should never be an empty string
 */
type UUID = string;

interface HTMDElementProps {
    /** if a value is provided, sparc will not use automatic UUID generation! */
    id?: UUID;
    /** Regular HTML class names */
    class?: string;
    /** Valid CSS selector targeting the current element's parent.
     * @example
     *
     * const myElement = new Element({...,containerSelector:"#login-form",...})
     * myElement.render() //my element will be appended to #login-form
     */
    containerSelector?: string;
}
interface ChildrenOptions {
    childrenContainerSelector?: string;
}
/**
 * Abstract base class for rendering structured HTML elements with
 * unique IDs, BEM-based class names, event management, and child support.
 */
declare abstract class HTMDElement implements HTMDElementInterface {
    isHTMD: true;
    private _id;
    private _class;
    /** Contains the lowercase class name. Used in to generate default class names and to classify the element type*/
    private _name;
    /**
     * string|undefined
     * ---
     * should be ...but for the sake of simplicity, when undefined ill assign an empty string
     * Pardon me for the incoherence and read the HTMDElementInterface docs on the same property
     */
    protected _containerSelector: string;
    protected _children?: HTMDNode;
    constructor(children?: HTMDNode, props?: HTMDElementProps);
    get [Symbol.toStringTag](): string;
    private _eventsMap;
    /**
     * Registers an event handler for a given event type on this element.
     * Replaces any previously assigned handler for the same event.
     * @param eventName The DOM event type to listen for (e.g., 'click').
     * @param callback The event handler function.
     */
    setEventHandler<K extends keyof HTMLElementEventMap>(eventName: K, callback?: (ev: HTMLElementEventMap[K]) => void): void;
    /**
     * Applies all stored event handlers to the DOM instance.
     */
    protected _applyEventListeners(): void;
    /**
     * Removes specified event handlers, or all if none are specified.
     * @param eventsList An array of event types to clear (or a single type).
     */
    clearEventListenersRecord<K extends keyof HTMLElementEventMap>(eventsList?: K | K[]): void;
    clearAllEventListenersAndRecords(): void;
    removeEventListeners<K extends keyof HTMLElementEventMap>(eventsList?: K | K[]): void;
    removeAllEventListeners(): void;
    /**
     * @returns the HTML string representing this element.
     */
    abstract toString(): string;
    private _removeChild;
    protected _removeChildren(children?: HTMDNode): void;
    /**
     * Removes this element from the DOM.
     */
    remove(): void;
    /**
     * Appends the element to the DOM using the configured container selector.
     * @param shouldRenderChildren Whether to render child nodes.
     */
    render(shouldRenderChildren?: boolean, childrenOptions?: ChildrenOptions): void;
    /**
     * Replaces the DOM instance of this element with a re-rendered version.
     * @param shouldRenderChildren Whether to render child nodes.
     */
    private _refresh;
    private _renderChild;
    /**
     * Handles child rendering, removing existing nodes from the DOM, and rendering them inside this element.
     * @param childContainerSelector Leave undefined to target the root of this element. Otherwise pass a valid child selector.
     * @example
     * const childContainerSelector = undefined // this.children -> rendered directly on this.instance
     * const childContainerSelector = ".child-wrapper" // this.children -> rendered on this.instance.find(".child-wrapper")
     */
    protected _renderChildren(children?: HTMDNode | undefined, options?: ChildrenOptions): void;
    /**
     * Returns the jQuery DOM instance, if it is present in the DOM.
     */
    get instance(): JQuery<HTMLElement> | null;
    /**
     * Returns the element's CSS selector.
     * @example
     * `${this._containerSelector} #${this.id}.${this.topClassBEM}`;
     */
    get selector(): string;
    /**
     * Returns true if the element currently exists in the DOM.
     */
    get isAlive(): boolean;
    /**
     * Returns the top-level BEM-style class for this element.
     */
    get topClassBEM(): string;
    /**
     * By default an UUID is used. Can be overridden.
     * This id can be used to identify both the object, and the DOM representation.
     */
    get id(): UUID;
    /**
     * A string containing all css classes attached to the element. Note that classes added via other
     * methods will not be present here. Internally FormControls use modifierClasses, but external
     * tools can also be used to add remove classes to the DOM. This is NOT the intended use.
     *
     * Setter method ensures that element classes are not removed
     * @example
     * MyElement.class ="special-class"
     * console.log(MyElement.class) //`${SPARC_PREFIX}__${this.name} special-class`
     */
    set class(classList: string);
    get class(): string;
    /**
     * Returns the lowercase class name responsible for creating this object.
     * This property is used to define the element's main class too
     */
    get name(): string;
    set containerSelector(selector: string);
    get containerSelector(): string;
    /**
     * An HTMDNode to be rendered on the DOM
     * When setting the property, If the element is loaded in the DOM, it's automatically refreshed
     */
    set children(children: HTMDNode);
    /**
     * An HTMDNode to be rendered on the DOM
     * When setting the property, If the element is loaded in the DOM, it's automatically refreshed
     */
    get children(): HTMDNode | undefined;
}

interface FormControlProps extends HTMDElementProps {
    /**
     * Use this boolean flag to toggle a css class disabling interactions with the component.
     */
    isDisabled?: boolean;
    /**
     * Use this boolean flag to toggle a css class while the async component loads.
     */
    isLoading?: boolean;
    /**
     * Currently used as a tooltip. Displays the current value by default
     */
    title?: string;
}
declare abstract class FormControl<T extends FormFieldType> extends HTMDElement {
    protected _value: FormField<T>;
    protected _isDisabled: boolean;
    protected _isLoading: boolean;
    title: string;
    constructor(fieldOrValue: T | FormField<T>, props?: FormControlProps);
    private get _validationClass();
    protected _validate(): void;
    toggleDisabledState(): void;
    toggleLoadingState(): void;
    get modifierClasses(): string;
    set class(str: string);
    get class(): string;
    get isValid(): boolean;
    get wasTouched(): boolean;
    get value(): FormField<T>;
    set isDisabled(flag: boolean);
    get isDisabled(): boolean;
    set isLoading(flag: boolean);
    get isLoading(): boolean;
}

type ContainerTags = 'div' | 'span' | 'header' | 'main' | 'footer' | 'section' | 'article' | 'nav';
interface ContainerProps extends HTMDElementProps {
    as?: ContainerTags;
    selectableItems?: boolean;
}
declare class Container extends HTMDElement {
    protected _tag: ContainerTags;
    selectableItems: boolean;
    constructor(children: HTMDNode, props?: ContainerProps);
    protected get _modifierClasses(): string;
    toString(): string;
}

interface AccordionItemProps extends ContainerProps {
    isInitialOpen?: boolean;
    class?: string;
    onOpenCallback?: () => void;
    onCloseCallback?: () => void;
}
declare class AccordionItem extends Container {
    private _isOpen;
    private _header;
    onOpenCallback: () => void;
    onCloseCallback: () => void;
    constructor(header: string, children: HTMDNode, props?: AccordionItemProps);
    private _createIcon;
    private _createHeader;
    private _createContent;
    toString(): string;
    render(): void;
    protected _handleAccordionToggle(): void;
    protected _containerToggleEventListener(): void;
    close(): void;
    open(): void;
    toggle(): void;
    get isOpen(): boolean;
    protected _applyEventListeners(): void;
}

interface AccordionGroupProps extends ContainerProps {
    allowMultipleOpen?: boolean;
    openIndex?: number;
}
declare class AccordionGroup extends Container {
    protected _children?: AccordionItem[];
    allowMultipleOpen: boolean;
    constructor(children: AccordionItem[], props?: AccordionGroupProps);
    protected _closeAllOtherItems(index: number): void;
    protected _applyEventListeners(): void;
}

type CardVariants = 'primary' | 'secondary';
interface CardProps extends ContainerProps {
    /** Defines the element styling variant. Defaults to "primary" */
    variant?: CardVariants;
}
declare class Card extends Container {
    variant: CardVariants;
    constructor(children: HTMDNode, props?: CardProps);
    protected get _modifierClasses(): string;
}

interface FragmentProps {
    containerSelector?: string;
}
/**
 * A fragment is just an HTMDElement that renders multiple children without wrapping them on another element.
 *
 * Contrary to regular HTMDElements, a fragment can't contain all types of HTMDNode,
 * since Fragment will not act as a parent node in the DOM, it needs an implementation of the
 * HTMDElementInterface
 *
 * @see HTMDElementInterface
 */
declare class Fragment implements HTMDElementInterface {
    isHTMD: true;
    protected _children: HTMDElementInterface[];
    protected _containerSelector?: string;
    constructor(children: HTMDElementInterface[], props?: FragmentProps);
    get [Symbol.toStringTag](): string;
    protected _renderChild(child: HTMDElementInterface): void;
    render(): void;
    remove(): void;
    toString(): string;
    get children(): HTMDElementInterface[];
    get containerSelector(): string | undefined;
    set children(children: HTMDElementInterface[]);
    set containerSelector(selector: string);
}

interface ModalProps extends ContainerProps {
    /** Indicates whether to blur and darken the parent element */
    backdrop?: boolean;
    /** Indicates if Modal should be closed when user clicks outside it's bounding box. @default true*/
    closeOnFocusLoss?: boolean;
    /** Function that is called when the modal closes */
    onCloseHandler?: () => void;
    /** Function that is called when the modal opens */
    onOpenHandler?: () => void;
}
declare class Modal extends Container {
    backdrop: boolean;
    protected _isOpen: boolean;
    closeOnFocusLoss: boolean;
    protected _onCloseHandler: () => void;
    protected _onOpenHandler: () => void;
    constructor(children: HTMDNode, props?: ModalProps);
    render(): void;
    open(): void;
    close(): void;
    private _onFocusLossEventListener;
    protected _applyEventListeners(): void;
    protected get _modifierClasses(): string;
    set onCloseHandler(callback: () => void);
    set onOpenHandler(callback: () => void);
    get isVisible(): boolean | undefined;
}

interface ViewProps extends HTMDElementProps {
    onRefreshHandler?: () => void;
    showOnRender?: boolean;
}
declare class View extends HTMDElement {
    protected _onRefresh: (() => void) | (() => Promise<void>);
    showOnRender: boolean;
    constructor(children: HTMDNode, props: ViewProps);
    toString(): string;
    /**
     * @param show Boolean flag that indicates if the page should be displayed after rendering.
     * @returns
     */
    render(show?: boolean): void;
    hide(duration?: number, onCompleteCallback?: () => void): void;
    show(duration?: number, onCompleteCallback?: () => void): Promise<void>;
    toggleVisibility(duration?: number, onCompleteCallback?: () => void): void;
    get isVisible(): boolean | undefined;
    set children(children: HTMDNode);
    get children(): HTMDNode | undefined;
}

interface ViewSwitcherProps<K extends string> extends FragmentProps {
    containerSelector?: string;
    selectedViewName?: K;
    onRefreshHandler?: (viewName: K, viewIndex: number, view: View) => void;
}
/**
 * A ViewSwitcher is mean to control a set of views, like a sub router.
 * Handles content change and can be used for carousels or forms with multiple screens
 */
declare class ViewSwitcher<K extends string> extends Fragment {
    private _currentChild;
    private _currentViewName;
    protected _viewKeys: Record<K, number>;
    protected _children: View[];
    protected _onRefreshHandler: (viewName: K, viewIndex: number, view: View) => void;
    constructor(children?: [K, View][], props?: ViewSwitcherProps<K>);
    get [Symbol.toStringTag](): string;
    protected _renderChild(child: View): void;
    render(): void;
    addViews(...views: [K, View][]): void;
    setView(viewName: K): void;
    setViewByIndex(n: number): void;
    next: () => void;
    previous: () => void;
    get currentChild(): View;
    get currentViewName(): K;
    get currentViewIndex(): number;
}

type DialogVariants = 'info' | 'warning' | 'error';
interface DialogProps extends ModalProps {
    title: string;
    content: HTMDNode;
    footer: HTMDNode;
    variant: DialogVariants;
}
declare class Dialog extends Modal {
    protected _variant: DialogVariants;
    constructor(props: DialogProps);
}

interface LoaderProps extends HTMDElementProps {
    animation?: 'pulse';
}
declare class Loader extends HTMDElement {
    animation?: 'pulse';
    constructor(children: HTMDNode, props: LoaderProps);
    toString(): string;
    toggleLoader(): void;
}

interface ToastOptions {
    /**
     * Message to be displayed in the toast
     */
    text?: string;
    /**
     * Duration for which the toast should be displayed. -1 for permanent toast
     */
    duration?: number;
    autoClose?: boolean;
    /**
     * To show the toast from top or bottom
     */
    verticalAlign?: 'top' | 'bottom';
    /**
     * To show the toast on left or right
     */
    horizontalAlign?: 'left' | 'right';
    /**
     * Ability to provide custom class name for further customization
     */
    className?: string;
    /**
     * To stop timer when hovered over the toast (Only if duration is set)
     */
    stopOnFocus?: boolean;
    /**
     * Invoked when the toast is dismissed
     */
    onClose?: () => void;
    /**
     * Ability to add some offset to axis
     */
    offset?: {
        x?: number | string;
        y?: number | string;
    };
}
declare class Toast {
    private static _show;
    static success(message: string, options?: ToastOptions): void;
    static error(message: string, options?: ToastOptions): void;
    static info(message: string, options?: ToastOptions): void;
    static warning(message: string, options?: ToastOptions): void;
}

interface ButtonProps extends FormControlProps {
    /** HTML attr. Defaults to "button" */
    type?: 'button' | 'submit' | 'reset';
    /** Defines the element styling variant. @default "primary" */
    variant?: 'primary' | 'secondary' | 'danger';
    /** Applies the outlined styling variant. @default false */
    isOutlined?: boolean;
    /** Sets equal width/height, useful for styling Icon Buttons. @default false */
    squared?: boolean;
    /** */
    onClickHandler: (e: MouseEvent) => void;
}
declare class Button extends FormControl<string> {
    type: ButtonProps['type'];
    variant: ButtonProps['variant'];
    isOutlined: boolean;
    isSquared: boolean;
    constructor(children: HTMDNode, props: ButtonProps);
    get modifierClasses(): string;
    toString(): string;
    set onClickHandler(callback: (e: MouseEvent) => void);
}

type DATE_FORMATS = 'dd-mm-yyyy' | 'mm-dd-yyyy';
interface DateInputProps extends FormControl<string> {
    format?: DATE_FORMATS;
}
declare class DateInput extends FormControl<string> {
    format: DATE_FORMATS;
    constructor(fieldOrValue: string | FormField<string>, props: DateInputProps);
    toString(): string;
    protected _applyEventListeners(): void;
    private _getDatepickerFormat;
    render(): void;
}

interface NumberInputProps extends FormControl<number> {
    min?: number;
    step?: number;
    max?: number;
}
declare class NumberInput extends FormControl<number> {
    min?: number;
    step?: number;
    max?: number;
    constructor(fieldOrValue: number | FormField<number>, props: NumberInputProps);
    protected _applyEventListeners(): void;
    toString(): string;
}

interface TextInputProps extends FormControlProps {
    spellcheck?: boolean;
    autocomplete?: boolean;
    hideChars?: boolean;
    placeholder?: string;
}
declare class TextInput extends FormControl<string> {
    spellcheck: boolean;
    autocomplete: boolean;
    hideChars: boolean;
    placeholder: string;
    constructor(fieldOrValue: string | FormField<string>, props: TextInputProps);
    protected _applyEventListeners(): void;
    toString(): string;
}

declare class CheckBox extends FormControl<boolean> {
    constructor(fieldOrValue: boolean | FormField<boolean>, props: FormControlProps);
    protected _applyEventListeners(): void;
    toString(): string;
}

interface ListProps<T extends string | number> extends HTMDElementProps {
    headers: string[];
    data: T[][];
    emptyListMessage?: string;
    onItemSelectHandler?: (rowData: T[]) => void;
}
declare class List<T extends string | number> extends HTMDElement {
    headers: string[];
    protected _data: T[][];
    private _orderedData;
    emptyListMessage: string;
    onItemSelectHandler: (rowData: T[]) => void;
    constructor(props: ListProps<T>);
    private _createHeaders;
    private _createRow;
    private _createListItems;
    toString(): string;
    private _refreshDataset;
    private _defaultOrderingFn;
    private _applySortClass;
    private _handleHeaderSortEvent;
    private _onHeaderSortEventListeners;
    private _onItemSelectEventListeners;
    private _applyDatasetEventListeners;
    protected _applyEventListeners(): void;
    set data(data: T[][]);
    get data(): T[][];
    get isDataValid(): boolean;
    throwOnInvalidListData(): void;
}

declare const REMIXICON_CORE: {
    readonly 'account-circle-fill': string;
    readonly 'account-circle-line': string;
    readonly 'add-circle-fill': string;
    readonly 'add-circle-line': string;
    readonly 'add-line': string;
    readonly 'alert-fill': string;
    readonly 'alert-line': string;
    readonly 'arrow-down-line': string;
    readonly 'arrow-down-s-line': string;
    readonly 'arrow-go-back-line': string;
    readonly 'arrow-go-forward-line': string;
    readonly 'arrow-left-line': string;
    readonly 'arrow-left-s-line': string;
    readonly 'arrow-right-line': string;
    readonly 'arrow-right-s-line': string;
    readonly 'arrow-up-line': string;
    readonly 'arrow-up-s-line': string;
    readonly 'attachment-line': string;
    readonly 'calendar-fill': string;
    readonly 'calendar-line': string;
    readonly 'check-fill': string;
    readonly 'check-line': string;
    readonly 'checkbox-circle-fill': string;
    readonly 'checkbox-circle-line': string;
    readonly 'clipboard-line': string;
    readonly 'close-circle-fill': string;
    readonly 'close-circle-line': string;
    readonly 'close-line': string;
    readonly 'dashboard-fill': string;
    readonly 'dashboard-line': string;
    readonly 'delete-bin-fill': string;
    readonly 'delete-bin-line': string;
    readonly 'download-fill': string;
    readonly 'download-line': string;
    readonly 'edit-2-line': string;
    readonly 'edit-line': string;
    readonly 'error-warning-fill': string;
    readonly 'error-warning-line': string;
    readonly 'external-link-line': string;
    readonly 'eye-fill': string;
    readonly 'eye-line': string;
    readonly 'eye-off-line': string;
    readonly 'file-add-line': string;
    readonly 'file-copy-line': string;
    readonly 'file-download-line': string;
    readonly 'file-line': string;
    readonly 'file-text-line': string;
    readonly 'file-upload-line': string;
    readonly 'filter-fill': string;
    readonly 'filter-line': string;
    readonly 'folder-line': string;
    readonly 'folder-open-line': string;
    readonly 'fullscreen-exit-line': string;
    readonly 'fullscreen-line': string;
    readonly 'group-line': string;
    readonly 'heart-fill': string;
    readonly 'heart-line': string;
    readonly 'home-fill': string;
    readonly 'home-line': string;
    readonly 'information-fill': string;
    readonly 'information-line': string;
    readonly link: string;
    readonly 'link-unlink': string;
    readonly 'loader-fill': string;
    readonly 'loader-line': string;
    readonly 'lock-fill': string;
    readonly 'lock-line': string;
    readonly 'lock-unlock-line': string;
    readonly 'login-box-line': string;
    readonly 'logout-box-line': string;
    readonly 'logout-box-r-line': string;
    readonly 'mail-fill': string;
    readonly 'mail-line': string;
    readonly 'menu-fill': string;
    readonly 'menu-line': string;
    readonly 'message-fill': string;
    readonly 'message-line': string;
    readonly 'more-2-line': string;
    readonly 'more-fill': string;
    readonly 'more-line': string;
    readonly 'notification-fill': string;
    readonly 'notification-line': string;
    readonly 'pause-line': string;
    readonly 'play-line': string;
    readonly 'question-fill': string;
    readonly 'question-line': string;
    readonly 'refresh-line': string;
    readonly 'save-fill': string;
    readonly 'save-line': string;
    readonly 'search-eye-line': string;
    readonly 'search-line': string;
    readonly 'settings-3-line': string;
    readonly 'settings-fill': string;
    readonly 'settings-line': string;
    readonly 'share-fill': string;
    readonly 'share-line': string;
    readonly 'shield-check-fill': string;
    readonly 'shield-check-line': string;
    readonly 'sort-asc': string;
    readonly 'sort-desc': string;
    readonly 'star-fill': string;
    readonly 'star-line': string;
    readonly 'stop-line': string;
    readonly 'subtract-line': string;
    readonly 'team-line': string;
    readonly 'time-fill': string;
    readonly 'time-line': string;
    readonly 'upload-fill': string;
    readonly 'upload-line': string;
    readonly 'user-add-line': string;
    readonly 'user-fill': string;
    readonly 'user-line': string;
};

declare function getIcon(iconName: keyof typeof REMIXICON_CORE): string;

interface ImageProps extends HTMDElementProps {
    alt?: string;
    onLoad?: () => void;
}
declare class Image extends HTMDElement {
    private _src;
    private _alt?;
    private _onLoadCallback;
    constructor(src: string, props: ImageProps);
    private _preloader;
    render(_shouldRenderChildren?: boolean): void;
    toString(): string;
}

/**
 * Configuration options for StyleResource initialization.
 */
interface StyleResourceOptions {
    /**
     * Whether the stylesheet should be enabled on load.
     * @default true
     */
    enable?: boolean;
}
/**
 * Manages dynamic loading and manipulation of CSS stylesheets in the document head.
 *
 * Provides methods to load, enable, disable, and remove stylesheet resources at runtime.
 * Supports path resolution with SharePoint context using the `@` prefix.
 *
 * @example
 * ```ts
 * // Load a stylesheet from SharePoint site collection
 * const styles = new StyleResource('@/SiteAssets/custom.css');
 *
 * // Load disabled initially
 * const conditionalStyles = new StyleResource('/styles/theme.css', { enable: false });
 *
 * // Enable/disable dynamically
 * conditionalStyles.enable();
 * conditionalStyles.disable();
 *
 * // Remove from DOM
 * styles.remove();
 * ```
 */
declare class StyleResource {
    /**
     * Resolved absolute path to the stylesheet resource.
     */
    private _path;
    /**
     * Creates a new StyleResource instance and loads the stylesheet into the document head.
     *
     * @param path - Path to the stylesheet. Use `@` prefix for SharePoint-relative paths.
     * @param options - Configuration options for the stylesheet.
     * @throws {SystemError} If the path is not a non-empty string.
     */
    constructor(path: string, options?: StyleResourceOptions);
    /**
     * Creates and appends a `<link>` element to the document head.
     *
     * @param enabled - Whether the stylesheet should be enabled on load.
     * @default true
     */
    private _loadFile;
    /**
     * Disables the stylesheet by setting the `disabled` attribute.
     * The stylesheet remains in the DOM but is not applied.
     */
    disable(): void;
    /**
     * Enables the stylesheet by removing the `disabled` attribute.
     */
    enable(): void;
    /**
     * Removes the stylesheet `<link>` element from the document head.
     */
    remove(): void;
}

interface RouteOptions extends Omit<ViewProps, 'containerSelector'> {
    routeStylePath?: string;
    children?: HTMDNode;
    title?: string;
}
declare class Route extends View {
    title: string;
    protected _routeStyle?: StyleResource;
    constructor(props?: RouteOptions);
    hide(duration?: number, onCompleteCallback?: () => void): void;
    show(duration?: number, onCompleteCallback?: () => void): Promise<void>;
    set routeStylePath(path: string);
    set onRefreshHandler(callback: () => void);
}

interface NavigationOptions {
    query?: Record<string, string>;
    newTab?: boolean;
}
/**
 * @property {string} containerSelector A css selector defining where the router wrapper should be placed. Defaults to `#root`
 * @property {unknown} initialState initializes data that is available to all routes from the start
 */
interface RouterProps {
    containerSelector?: string;
    enableErrorBoundary: boolean;
}
type RoutePaths = string[];
declare class Router {
    #private;
    protected static _runtimeInstance: Router;
    static navigateTo(path: string, options?: NavigationOptions): void;
    static goBack(): void;
    static popLevel(x?: number): void;
    static get location(): string;
    static get absoluteURI(): string;
    static get siteRootPath(): string;
    static get pageRootPath(): string;
    static get queryParams(): URLSearchParams;
    constructor(routeRelativePaths: RoutePaths, props?: RouterProps);
    [Symbol.toStringTag](): string;
    private _resolveRouteAbsolutePath;
    private _addPopStateEventListeners;
    private _cleanup;
    private _refreshCurrentPage;
    private _addImportedRoute;
    private _loadRoute;
    private _parseQueryParamsToString;
    private _navigateTo;
    protected _applyRoute(route: Route): void;
    /**
     * Goes up x levels on the current URL.
     * Different from router.goBack()
     * @default 1
     * @example
     * router.location // .../sites/MySite/somePage/subpage/etc
     * router.popLevel() // navigates to .../sites/MySite/somePage/subpage/
     * router.popLevel(2) // navigates to .../sites/MySite/
     */
    private _popLevel;
}

interface LinkButtonProps extends ButtonProps {
    disableOnOwnPath?: boolean;
    navigationOptions?: NavigationOptions;
}
declare class LinkButton extends Button {
    private _path;
    private _cleanupEventListener?;
    private _disableOnOwnPath;
    constructor(children: HTMDNode, path: string, props?: LinkButtonProps);
    private _onNavigationHandler;
    remove(): void;
    protected _applyEventListeners(): void;
    get path(): string;
}

interface TextProps extends HTMDElementProps {
    type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'label' | 'p' | 'span';
    for?: string;
    title?: string;
}
declare class Text extends HTMDElement {
    type: TextProps['type'];
    for: string;
    title: string;
    constructor(children?: HTMDNode, props?: TextProps);
    toString(): string;
}

type pageResetOptions = {
    /**
     * Boolean flag that indicates if the console should be cleared once this function executes,
     */
    clearConsole: boolean;
    /**
     * Boolean flag that indicates if the script should remove all style and link tags that load css
     */
    removeStyles: boolean;
    /**
     * If provided, the given path will be used to load a css file.
     * This is intended to load the main css theme file.
     */
    themePath?: string;
};
/**
 * A function that hides all the sharepoint UI and prepends a div#page element to act as a wrapper.
 * Once this function is called, another one becomes globally available to show the UI.
 * @param {pageResetOptions} options refer to the pageResetOptions type for more docs
 *
 * @see displaySharePointUI - to show SP's ui back again.
 */
declare function pageReset({ clearConsole, removeStyles, themePath }?: pageResetOptions): void;

declare class SimpleElapsedTimeBenchmark {
    private _start;
    private _end;
    private _elapsed;
    constructor();
    start(): void;
    private _calcElapsedTime;
    stop(): void;
    get elapsed(): number;
}

interface ErrorOptions {
    breaksFlow?: boolean;
}
declare class SystemError extends Error {
    private _name;
    private _timestamp;
    private _breaksFlow;
    constructor(name: string, message: string, options?: ErrorOptions);
    static fromErrorEvent(event: ErrorEvent, options?: ErrorOptions): SystemError;
    get timestamp(): Date;
    get name(): string;
    get breaksFlow(): boolean;
    toString(): string;
    toJSON(): string;
}

interface ErrorBoundaryProps {
    target?: Window | HTMLElement;
    onErrorCallback?: (error: ErrorEvent) => void;
    onAsyncErrorCallback?: (error: PromiseRejectionEvent) => void;
    name?: string;
}
declare class ErrorBoundary {
    protected _targetElement: Window | HTMLElement;
    protected _onErrorCallback?: (error: ErrorEvent) => void;
    protected _onAsyncErrorCallback?: (error: PromiseRejectionEvent) => void;
    protected _name: string;
    constructor(props: ErrorBoundaryProps);
    protected _displayError(error: SystemError): Promise<void>;
    protected _parseEventData(event: Event): SystemError;
    private _onErrorEventHandler;
    private _onAsyncErrorEventHandler;
    private _addEventListeners;
}

interface RuntimeEventOptions {
    bubbles?: boolean;
    cancelable?: boolean;
}
interface RuntimeEventListenerOptions {
    once?: boolean;
}
declare abstract class RuntimeEvent extends Event {
    protected _target: EventTarget;
    constructor(eventTarget: EventTarget, options?: RuntimeEventOptions);
    protected static _createListener<E extends Event>(eventName: string, callback: (e?: E) => void, target: EventTarget, options?: RuntimeEventListenerOptions): () => void;
    dispatch(): boolean;
    get target(): EventTarget;
}

declare class NavigationEvent extends RuntimeEvent {
    #private;
    constructor(to: string, from?: string, query?: Record<string, string>);
    /**
     * IMPORTANT: ADD NOTE ABOUT CALLING THE CLEANUP FN BEFORE CREATING A LISTENER THAT IS CREATED
     * ON EACH RENDER/REFRESH
     *
     */
    static listener(callback: (event?: NavigationEvent) => void, options?: RuntimeEventListenerOptions): () => void;
    get from(): string | undefined;
    get to(): string;
    get query(): Record<string, string> | undefined;
}

interface RouteConfig {
    setRouteTitle: (title: string) => void;
    $DANGEROUS__route_backdoor: Route;
}
declare function defineRoute(closureCallback: (config: RouteConfig) => Promise<HTMDNode> | HTMDNode): Promise<Route>;

declare class SiteApi {
    #private;
    constructor(absoluteUrl?: string);
    protected _refreshRequestDigest(): [string, number];
    protected get _isTokenValid(): boolean;
    get requestDigest(): string;
    get url(): string;
}

/**
 * An object to lookup list items based on CAML query.
 * At the moment only exact values are supported for lookups
 */
type CAMLQueryObject = Record<string, string>;
interface ListApiOptions {
    listItemType?: string;
    siteApi?: SiteApi;
}
declare class ListApi {
    #private;
    protected _siteApi: SiteApi;
    constructor(title: string, options?: ListApiOptions);
    protected _parseCAMLQueryObject(args: CAMLQueryObject): string;
    protected _createCAMLQueryPayload(camlQuery: string): {
        query: {
            __metadata: {
                type: string;
            };
            ViewXml: string;
        };
    };
    protected _queryRequest<T>(args: CAMLQueryObject | string): T[];
    getItems<T>(query?: CAMLQueryObject | string): T[];
    getItemByTitle<T>(title: string): T[];
    getItemByUUID<T>(uuid: string): T[];
    getOwnedItems<T>(userId?: string): T[];
    createItem(item: Record<string, string>): unknown;
    deleteItem(id: number): unknown;
    deleteALLItems(): void;
    updateItem(_title: string): void;
    get endpoint(): string;
    get listItemType(): string;
}

interface RequestOptions extends JQueryAjaxSettings {
    requestDigest?: string;
}
declare function httpGETRequest(url: string, options?: RequestOptions): unknown;
declare function httpPOSTRequest(url: string, options?: RequestOptions): unknown;
declare function httpDELETERequest(url: string, options?: RequestOptions): unknown;

interface CurrentUserOptions {
    bruteForceAccountNameClientImplementation?: (_str: string, _tryCount: number) => string;
    userUIDParserClientImplementation?: (_str: string) => string;
}
declare class CurrentUser {
    #private;
    protected _UID: string;
    protected _AccountName: string;
    protected _Country: string;
    protected _City: string;
    protected _DisplayName: string;
    protected _Email: string;
    protected _Manager: string;
    protected _Peers: string[];
    protected _SPGroupId: number;
    protected _SPGroupTitle: string;
    protected _bruteForceAccountNameClientImplementation: CurrentUserOptions['bruteForceAccountNameClientImplementation'];
    protected _userUIDParserClientImplementation: CurrentUserOptions['userUIDParserClientImplementation'];
    constructor(accountName?: string, options?: CurrentUserOptions);
    /**
     * This should only be defined in the client environment, due to security compliance
     */
    protected _bruteForceAccountName(_str: string, _tryCount: number): string;
    /**
     * This should only be defined in the client environment, due to security compliance
     */
    protected _userUIDParser(_str: string): string;
    protected _loadUserData(): void;
    protected _getUserData(accountName: string): void;
    get isUserDefined(): boolean;
    /**
     * Gets the city associated with the current user.
     * @returns The city name as a string.
     */
    get City(): string;
    /**
     * Gets the account name of the current user.
     * @returns The account name as a string.
     */
    get AccountName(): string;
    /**
     * Gets the country associated with the current user.
     * @returns The country name as a string.
     */
    get Country(): string;
    /**
     * Gets the display name of the current user.
     * @returns The display name as a string.
     */
    get DisplayName(): string;
    /**
     * Gets the UID of the current user.
     * @returns The UID as a string.
     */
    get UID(): string;
    /**
     * Gets the email of the current user.
     * @returns The email as a string.
     */
    get Email(): string;
    /**
     * Gets the manager of the current user.
     * @returns The manager as a string.
     */
    get Manager(): string;
    /**
     * Gets the peers of the current user.
     * @returns An array of peer names.
     */
    get Peers(): string[];
    /**
     * Gets the SharePoint group ID of the current user.
     * @returns The group ID as a number.
     */
    get groupId(): number;
    /**
     * Gets the SharePoint group title of the current user.
     * @returns The group title as a string.
     */
    get groupTitle(): string;
}

declare class FormSchema<T extends Record<string, FormField<FormFieldType>>, K extends keyof T> {
    private _fields;
    constructor(fields: T);
    static fromKeys<const K extends readonly string[]>(fieldNames: K): FormSchema<{
        [P in K[number]]: FormField<FormFieldType>;
    }, K[number]>;
    get isValid(): boolean;
    get hasUntouchedFields(): boolean;
    focusOnFirstInvalid(): void;
    get(key: K): T[K];
    parse(): Record<string, FormFieldType>;
}

/**
 * Ensures unique values are generated during runtime.
 * @param {string} [prefix] An optional string for added security
 *
 * NOTE: RUNTIME UID ONLY!
 */
declare const generateRuntimeUID: (prefix?: string) => UUID;
/**
 * Generates a RFC4122 version 4 compliant UUID.
 * @returns {string} A randomly generated UUID string
 * @example
 * const id = generateUUIDv4(); // "550e8400-e29b-41d4-a716-446655440000"
 */
declare const generateUUIDv4: typeof v4;

/**
 * Resolves a path by replacing the `@` prefix with the appropriate SharePoint URL.
 *
 * @param path - The path string to resolve. Must start with `@` to be replaced.
 * @param options - Configuration options for path resolution.
 * @param options.useSiteRoot - If `true`, resolves to the site root URL. If `false` (default), resolves to the SiteAssets/app directory.
 * @param options.customPath - The application path to append to the web absolute URL when `useSiteRoot` is `false`. Defaults to `'SiteAssets/app'`.
 *
 * @returns The resolved absolute path with the `@` prefix replaced by the appropriate SharePoint URL.
 *
 * @throws {SystemError} Throws an error if the path is not a non-empty string.
 *
 * @example
 * ```typescript
 * // Resolves to: https://site.sharepoint.com/SiteAssets/app/images/logo.png
 * const resolvedPath = resolvePath('@/images/logo.png');
 *
 * // Resolves to: https://site.sharepoint.com/images/logo.png
 * const sitePath = resolvePath('@/images/logo.png', { useSiteRoot: true });
 *
 * // Resolves to: https://site.sharepoint.com/custom/path/images/logo.png
 * const customPath = resolvePath('@/images/logo.png', { customPath: 'custom/path' });
 * ```
 */
declare function resolvePath(path: string, { useSiteRoot, customPath }?: {
    useSiteRoot?: false;
    customPath: string;
}): string;

/**
 * Creates a strict proxy wrapper around an object that throws an error when accessing non-existent properties.
 *
 * This function wraps the provided object in a Proxy that intercepts property access operations.
 * If an attempt is made to access a property that doesn't exist on the object, a SystemError
 * is thrown instead of returning undefined. This helps catch typos and invalid property accesses
 * at runtime.
 *
 * @template T - The type of the object to be wrapped, must extend Object.
 * @param obj - The object to wrap with strict property access enforcement.
 * @returns A proxied version of the object that throws SystemError when accessing non-existent properties.
 * @throws {SystemError} When attempting to access a property that doesn't exist on the object.
 *
 * @example
 * ```typescript
 * const config = enforceStrictObject({ apiKey: 'secret', timeout: 5000 });
 * console.log(config.apiKey); // 'secret'
 * console.log(config.invalid); // Throws SystemError
 * ```
 */
declare function enforceStrictObject<T extends object>(obj: T): T;

declare function copyToClipboard(text: string): Promise<boolean>;

/**
 * Simulates a promise that resolves or rejects after a specified time.
 *
 * @param shouldResolve - Whether the promise should resolve (true) or reject (false)
 * @param timeMs - Time in milliseconds before the promise settles
 * @param resolveValue - Optional value to resolve with
 * @param rejectReason - Optional reason to reject with
 * @returns A promise that resolves or rejects after the specified time
 *
 * @example
 * // Using async/await
 * try {
 *   const result = await simulatePromiseAsync(true, 2000, { data: 'success' });
 *   console.log('Resolved:', result);
 * } catch (error) {
 *   console.error('Rejected:', error);
 * }
 *
 * @example
 * // Using .then/.catch
 * simulatePromiseAsync(false, 1000, undefined, 'Failed')
 *   .then((data) => console.log('Success:', data))
 *   .catch((error) => console.error('Error:', error));
 */
declare function mockPromise<T = unknown, E = unknown>(resolved?: () => T, timeMs?: number, shouldResolve?: boolean, rejected?: () => E): Promise<unknown>;

interface TabGroupProps<K extends string> extends Omit<ContainerProps, 'selectableItems'> {
    selectedTabKey?: K;
    onTabChangeHandler?: (tabConfig: TabConfig<K>) => void;
}
interface TabConfig<K extends string> {
    /** Unique key for the tab */
    key: K;
    /** Label displayed in the tab button */
    label: string;
    /** Content view for this tab */
    view: View;
    /** Whether this tab is disabled */
    disabled?: boolean;
}
/**
 * TabGroup component that combines tab navigation with view switching.
 * Uses ViewSwitcher internally to manage view transitions.
 */
declare class TabGroup<K extends string> extends Container {
    private _viewSwitcher;
    private _tabs;
    private _onTabChangeHandler;
    constructor(tabs: TabConfig<K>[], props?: TabGroupProps<K>);
    get [Symbol.toStringTag](): string;
    private _createTabButton;
    private _createTabNavigation;
    toString(): string;
    render(): void;
    private _updateActiveTab;
    private _onTabClickListeners;
    protected _applyEventListeners(): void;
    /**
     * Switch to a specific tab by key
     */
    setTab(tabKey: K): void;
    /**
     * Switch to a specific tab by index
     */
    setTabByIndex(index: number): void;
    /**
     * Navigate to the next tab (wraps around)
     */
    nextTab(): void;
    /**
     * Navigate to the previous tab (wraps around)
     */
    previousTab(): void;
    /**
     * Add new tabs dynamically
     */
    addTabs(...tabs: TabConfig<K>[]): void;
    /**
     * Get the currently active tab key
     */
    get currentTab(): K;
    /**
     * Get the currently active tab index
     */
    get currentTabIndex(): number;
    /**
     * Get the current view
     */
    get currentView(): View;
}

type FieldLabelPosition = 'left' | 'top' | 'right' | 'bottom';
interface FieldLabelProps extends HTMDElementProps {
    /**
     * Position of the label relative to the wrapped component
     * @default 'top'
     */
    position?: FieldLabelPosition;
    /**
     * Tooltip text to display on hover
     */
    tooltip?: string;
}
/**
 * FieldLabel component that wraps any HTMDElement with a label.
 * Provides flexible positioning and optional tooltip functionality.
 *
 * @example
 * ```typescript
 * const input = new TextInput('', { placeholder: 'Enter your name' });
 * const field = new FieldLabel('Full Name', input, {
 *   position: 'top',
 *   tooltip: 'Please enter your full legal name'
 * });
 * field.render();
 * ```
 */
declare class FieldLabel extends HTMDElement {
    private _labelText;
    private _position;
    private _tooltip?;
    private _componentId?;
    constructor(labelText: string, component: HTMDElement, props?: FieldLabelProps);
    get [Symbol.toStringTag](): string;
    get modifierClasses(): string;
    /**
     * Generates the label HTML with optional tooltip
     */
    private _createLabel;
    toString(): string;
    render(): void;
    /**
     * Updates the label text
     */
    set label(text: string);
    /**
     * Updates the tooltip text
     */
    set tooltip(tooltip: string | undefined);
    /**
     * Updates the position of the label
     */
    set position(position: FieldLabelPosition);
    /**
     * Gets the label text
     */
    get label(): string;
    /**
     * Gets the current position
     */
    get position(): FieldLabelPosition;
    /**
     * Gets the tooltip text
     */
    get tooltip(): string | undefined;
}

declare global {
    interface Window {
        $: typeof $;
        jquery: typeof $;
        displaySharePointUI?: () => void;
    }
}

export { AccordionGroup, AccordionItem, Button, Card, CheckBox, ComboBox, Container, CurrentUser, DateInput, Dialog, ErrorBoundary, FieldLabel, FormControl, FormField, FormSchema, Fragment, HTMDElement, Image, LinkButton, List, ListApi, Loader, Modal, NavigationEvent, NumberInput, Router, SimpleElapsedTimeBenchmark, SiteApi, StyleResource, SystemError, TabGroup, Text, TextInput, Toast, View, ViewSwitcher, copyToClipboard, defineRoute, enforceStrictObject, generateRuntimeUID, generateUUIDv4, getIcon, httpDELETERequest, httpGETRequest, httpPOSTRequest, mockPromise, pageReset, resolvePath };
