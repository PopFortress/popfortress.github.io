class Stopwatch {
    constructor () {
        this.st = 0;
        this.et = 0;
        this.diff = 0;
    };
    /**
     * starts the stopwatch;
     * @returns {number} the timestamp whilst the method is invoked;
     */
    start () {
        this.st = Date.now();
        return this.st;
    };
    /**
     * stops the stopwatch;
     * @param {number} timeFormatOffset 1: milliseconds, 1000: seconds, ...; (returns in seconds by default).
     * @returns time elapsed since the stopwatch was started, in the specified time format (unit);
     */
    stop (timeFormatOffset = 1000) {
        this.et = Date.now();
        this.diff = this.et - this.st;
        return this.diff / timeFormatOffset;
    };
    /**
     * resets the stopwatch;
     */
    reset () {
        this.st = 0;
        this.et = 0;
        this.diff = 0;
    };
    /**
     * Gets the current time elapsed since the stopwatch was started.
     * Usage: You may use setInterval() to call this method at a specified interval, and update the UI accordingly;
     * @param {number} timeFormatOffset returns in seconds by default.
     * @returns time elapsed from the start time to the time whilst the method is invoked, in the specified time format (unit).
     */
    getCurrentTime (timeFormatOffset = 1000) {
        this.diff = Date.now() - this.st;
        return this.diff / timeFormatOffset;
    };
};

/**
 * Show a specified element with the specified display style property.
 * @param {Element} element Element to be displayed.
 * @param {string} displayType The value of the display style property to be set.
 */
function show(element, displayType = 'block') {
    element.style.display = displayType;
};


/**
 * Hide a specified element.
 * @param {Element} element Element to be hidden.
 */
function hide(element) {
    element.style.display = 'none';
};


/**
 * Toggle the visibility of a specified element.
 * @param {Element} element Element to be toggled between visible and hidden.
 * @param {string} displayType The value of the display style property to be set when the element is shown.
 */
function toggleVisibility(element, displayType = 'block') {
    if (element.style.display === 'none') {
        show(element, displayType);
    } else {
        hide(element);
    };
};


/**
 * We have a vanilla dblclick event, but it's not mobile-friendly, that's why we use this function to detect double-click or tap.
 * Usage: add a click event listener to the element, and call handleDoubleClickOrTap(delay, callbackFunc) when the event is triggered.
 * @param {number} delay The duration of the delay between the first and second click.
 * @param {function} callbackFunc The function to be called when the double-click or tap is detected.
 */
function handleDoubleClickOrTap(delay, callbackFunc) {
    const dblclickTimeStack = [];
    dblclickTimeStack.push(Date.now());
    if (dblclickTimeStack.length === 2) {
        if (dblclickTimeStack[1] - dblclickTimeStack[0] <= delay) {
            callbackFunc();
        };
        dblclickTimeStack = [];
    };
};

const get = (query) => document.querySelector(query);
const getAll = (query) => document.querySelectorAll(query);