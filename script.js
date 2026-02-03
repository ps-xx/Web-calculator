/**
 * Professional Web Calculator
 * Built with Object-Oriented Programming (OOP)
 * Features: Keyboard support, calculation history, error handling
 * 
 * @author Pablo.ejs (@ps-xx)
 * @github https://github.com/ps-xx
 */

/**
 * Calculator Class - Handles all calculator logic and operations
 */
class Calculator {
    /**
     * Creates an instance of Calculator
     * @constructor
     */
    constructor() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.history = [];
        this.maxHistoryLength = 5;
        this.maxDisplayLength = 15;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeTheme();
    }

    /**
     * Initialize DOM element references
     * @private
     */
    initializeElements() {
        this.displayElement = document.getElementById('displayText');
        this.expressionElement = document.getElementById('expression');
        this.historyListElement = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.buttons = document.querySelectorAll('.btn');
    }

    /**
     * Attach event listeners to buttons and keyboard
     * @private
     */
    attachEventListeners() {
        // Button click events
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });

        // Clear history button
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }

    /**
     * Initialize theme based on system preference
     * @private
     */
    initializeTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('calculator-theme');
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
    }

    /**
     * Set theme (dark or light)
     * @param {string} theme - 'dark' or 'light'
     * @private
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('calculator-theme', theme);
    }

    /**
     * Toggle between dark and light theme
     * @private
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Handle button click events
     * @param {HTMLElement} button - The clicked button element
     * @private
     */
    handleButtonClick(button) {
        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);

        const action = button.getAttribute('data-action');
        const number = button.getAttribute('data-number');
        const operator = button.getAttribute('data-operator');

        if (action) {
            this.handleAction(action);
        } else if (number !== null) {
            this.handleNumber(number);
        } else if (operator !== null) {
            this.handleOperator(operator);
        }
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    handleKeyboardInput(event) {
        const key = event.key;
        const keyCode = event.keyCode || event.which;

        // Prevent default for calculator keys
        if (this.isCalculatorKey(key, keyCode)) {
            event.preventDefault();
        }

        // Number keys (0-9)
        if (key >= '0' && key <= '9') {
            this.handleNumber(key);
            return;
        }

        // Decimal point
        if (key === '.' || key === ',') {
            this.handleNumber('.');
            return;
        }

        // Operators
        if (key === '+') {
            this.handleOperator('+');
            return;
        }
        if (key === '-') {
            this.handleOperator('-');
            return;
        }
        if (key === '*') {
            this.handleOperator('*');
            return;
        }
        if (key === '/') {
            this.handleOperator('/');
            return;
        }

        // Equals
        if (key === '=' || key === 'Enter') {
            this.handleAction('equals');
            return;
        }

        // Clear
        if (key === 'Escape' || key === 'c' || key === 'C') {
            this.handleAction('clear');
            return;
        }

        // Backspace
        if (key === 'Backspace' || key === 'Delete') {
            this.handleOperator('backspace');
            return;
        }
    }

    /**
     * Check if key is a calculator key
     * @param {string} key - Key pressed
     * @param {number} keyCode - Key code
     * @returns {boolean} True if calculator key
     * @private
     */
    isCalculatorKey(key, keyCode) {
        const calculatorKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '.', ',', '+', '-', '*', '/', '=', 'Enter',
            'Escape', 'Backspace', 'Delete', 'c', 'C'
        ];
        return calculatorKeys.includes(key);
    }

    /**
     * Handle number input
     * @param {string} number - Number to input
     */
    handleNumber(number) {
        if (this.waitingForNewValue) {
            this.currentValue = number;
            this.waitingForNewValue = false;
        } else {
            // Prevent multiple decimal points
            if (number === '.' && this.currentValue.includes('.')) {
                return;
            }
            
            // Prevent leading zeros
            if (this.currentValue === '0' && number !== '.') {
                this.currentValue = number;
            } else {
                // Limit display length
                if (this.currentValue.length >= this.maxDisplayLength) {
                    return;
                }
                this.currentValue += number;
            }
        }
        
        this.updateDisplay();
    }

    /**
     * Handle operator input
     * @param {string} operator - Operator symbol
     */
    handleOperator(operator) {
        if (operator === 'backspace') {
            this.handleBackspace();
            return;
        }

        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const result = this.calculate();
            this.currentValue = String(result);
            this.previousValue = result;
            this.updateDisplay();
        }

        this.waitingForNewValue = true;
        this.operator = operator;
        this.updateExpression();
    }

    /**
     * Handle backspace operation
     * @private
     */
    handleBackspace() {
        if (this.waitingForNewValue) {
            return;
        }

        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        
        this.updateDisplay();
    }

    /**
     * Handle action buttons (clear, equals)
     * @param {string} action - Action to perform
     */
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clearEntry':
                this.clearEntry();
                break;
            case 'equals':
                this.performCalculation();
                break;
        }
    }

    /**
     * Clear all calculator state
     */
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
        this.updateExpression();
    }

    /**
     * Clear current entry only
     */
    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    /**
     * Perform calculation and display result
     */
    performCalculation() {
        if (this.operator && this.previousValue !== null) {
            const result = this.calculate();
            const expression = this.getExpressionString();
            
            // Add to history
            this.addToHistory(expression, result);
            
            // Update display
            this.currentValue = String(result);
            this.previousValue = null;
            this.operator = null;
            this.waitingForNewValue = true;
            
            this.updateDisplay();
            this.updateExpression();
        }
    }

    /**
     * Calculate result based on current operation
     * @returns {number} Calculation result
     * @private
     */
    calculate() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        if (isNaN(prev) || isNaN(current)) {
            return 0;
        }

        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                // Handle division by zero
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return prev;
                }
                result = prev / current;
                break;
            default:
                return current;
        }

        // Handle decimal precision and overflow
        result = this.formatResult(result);
        return result;
    }

    /**
     * Format calculation result to handle long decimals
     * @param {number} result - Raw calculation result
     * @returns {number} Formatted result
     * @private
     */
    formatResult(result) {
        // Check for overflow
        if (Math.abs(result) > Number.MAX_SAFE_INTEGER) {
            this.showError('Number too large');
            return 0;
        }

        // Round to prevent floating point errors
        // Keep up to 10 decimal places, but remove trailing zeros
        const rounded = Math.round(result * 10000000000) / 10000000000;
        
        // Convert to string and remove trailing zeros
        let resultString = String(rounded);
        
        // Limit display length
        if (resultString.length > this.maxDisplayLength) {
            // Use scientific notation for very large/small numbers
            if (Math.abs(rounded) >= 1e10 || (Math.abs(rounded) < 1e-10 && rounded !== 0)) {
                return parseFloat(rounded.toExponential(6));
            }
            // Otherwise truncate decimal places
            const integerPart = Math.floor(Math.abs(rounded));
            const decimalPlaces = this.maxDisplayLength - integerPart.toString().length - 1;
            if (decimalPlaces > 0) {
                return parseFloat(rounded.toFixed(decimalPlaces));
            } else {
                return Math.round(rounded);
            }
        }
        
        return rounded;
    }

    /**
     * Get expression string for display
     * @returns {string} Expression string
     * @private
     */
    getExpressionString() {
        if (this.previousValue === null || this.operator === null) {
            return '';
        }
        
        const operatorSymbol = this.getOperatorSymbol(this.operator);
        return `${this.previousValue} ${operatorSymbol} ${this.currentValue}`;
    }

    /**
     * Get display symbol for operator
     * @param {string} operator - Operator code
     * @returns {string} Display symbol
     * @private
     */
    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }

    /**
     * Update display with current value
     * @private
     */
    updateDisplay() {
        // Format number for display
        let displayValue = this.currentValue;
        
        // Add animation
        this.displayElement.classList.add('updated');
        setTimeout(() => {
            this.displayElement.classList.remove('updated');
        }, 300);
        
        this.displayElement.textContent = displayValue;
    }

    /**
     * Update expression display
     * @private
     */
    updateExpression() {
        const expression = this.getExpressionString();
        this.expressionElement.textContent = expression;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     * @private
     */
    showError(message) {
        // Visual feedback for error
        this.displayElement.textContent = 'Error';
        this.expressionElement.textContent = message;
        
        // Reset after 2 seconds
        setTimeout(() => {
            this.clear();
        }, 2000);
    }

    /**
     * Add calculation to history
     * @param {string} expression - Calculation expression
     * @param {number} result - Calculation result
     * @private
     */
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date()
        };

        this.history.unshift(historyItem);
        
        // Limit history to max length
        if (this.history.length > this.maxHistoryLength) {
            this.history.pop();
        }

        this.updateHistoryDisplay();
    }

    /**
     * Update history display in UI
     * @private
     */
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyListElement.innerHTML = '<p class="history-empty">No calculations yet</p>';
            return;
        }

        this.historyListElement.innerHTML = '';
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">${item.expression}</div>
                <div style="color: var(--text-tertiary);">= ${item.result}</div>
            `;
            
            // Click to use result
            historyItem.addEventListener('click', () => {
                this.currentValue = String(item.result);
                this.waitingForNewValue = true;
                this.updateDisplay();
            });
            
            this.historyListElement.appendChild(historyItem);
        });
    }

    /**
     * Clear calculation history
     */
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
