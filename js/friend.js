/**
 * @class Friend
 * @description 一個可在網頁上顯示並與滑鼠互動的角色小工具。
 * @author M4RVjN & Gemini
 * @version 15.0.0
 */
class Friend {
    // --- 內部屬性 ---
    _latestMouseX = 0;
    _latestMouseY = 0;
    _characterCenterX = 0;
    _characterCenterY = 0;
    _currentAngle = 0;
    _animationFrameId = null;
    _characterElement = null;
    _instanceId;
    _elementId;
    _options;

    // --- 靜態屬性 ---
    static _instanceCounter = 0;
    static _CLASS_NAME = 'friend-el';
    static _BOUNCING_CLASS_NAME = 'bouncing';

    static _defaultOptions = {
        image: './character/friend.png',
        size: { width: 200, height: 300 },
        zIndex: 9999,
        smoothing: 0.1,
        mobileBreakpoint: 600,
        corner: 'bottom-left',
        edgeOffset: 20,
        rotationOffset: 90,
    };

    /**
     * @constructor
     * @param {object|string} imageOrOptions - 選項物件或圖片路徑。
     * @param {string} [corner] - (簡易模式) 角落位置, e.g., 'bottom-right'。
     * @param {number} [rotationOffset] - (簡易模式) 旋轉偏移角度。
     */
    constructor(imageOrOptions, corner, rotationOffset) {
        let options = {};
        if (typeof imageOrOptions === 'object' && imageOrOptions !== null) {
            options = imageOrOptions;
        } else {
            options = { image: imageOrOptions, corner, rotationOffset };
        }

        this._instanceId = Friend._instanceCounter++;
        this._elementId = `${Friend._CLASS_NAME}-${this._instanceId}`;

        this._options = {
            ...Friend._defaultOptions,
            ...options,
            size: { ...Friend._defaultOptions.size, ...(options.size || {}) },
        };
        
        // ★ [優化] 更完整的選項驗證
        if (typeof this._options.edgeOffset !== 'number') {
            console.warn(`Friend #${this._instanceId}: edgeOffset should be a number. Falling back to default.`);
            this._options.edgeOffset = Friend._defaultOptions.edgeOffset;
        }
        if (typeof this._options.rotationOffset !== 'number') {
            console.warn(`Friend #${this._instanceId}: rotationOffset should be a number. Falling back to default.`);
            this._options.rotationOffset = Friend._defaultOptions.rotationOffset;
        }
        
        this._init();
    }
    
    /**
     * 銷毀此 Friend 實例，停止動畫並將其從頁面上移除。
     */
    destroy = () => {
        if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId);
        document.removeEventListener('mousemove', this._handleMouseMove);
        document.removeEventListener('click', this._handleClick);
        window.removeEventListener('resize', this._debouncedCalculateCenter);
        if (this._characterElement) this._characterElement.remove();
        const styleTag = document.getElementById(`${this._elementId}-styles`);
        if (styleTag) styleTag.remove();
    }

    // --- 內部方法 ---

    /** @private 初始化所有設定 */
    _init = () => {
        this._createCharacterElement();
        this._injectAnimationStyles();
        this._setupEventListeners();
        requestAnimationFrame(() => this._calculateCenter());
        this._animationFrameId = requestAnimationFrame(() => this._animationLoop());
    }
    
    /** @private 創建 DOM 元素 */
    _createCharacterElement = () => {
        this._characterElement = document.createElement('div');
        this._characterElement.id = this._elementId;
        this._characterElement.className = Friend._CLASS_NAME;
        const s = this._characterElement.style;
        const o = this._options;
        s.position = 'fixed';
        s.width = `${o.size.width}px`;
        s.height = `${o.size.height}px`;
        s.zIndex = o.zIndex;
        s.pointerEvents = 'none';
        s.backgroundImage = `url('${o.image}')`;
        s.backgroundSize = 'contain';
        s.backgroundRepeat = 'no-repeat';
        s.backgroundPosition = 'center';
        Object.assign(s, this._getPositionStylesFromCorner());
        document.body.appendChild(this._characterElement);
    }

    /** @private 注入 CSS 樣式 */
    _injectAnimationStyles = () => {
        const styleId = `${this._elementId}-styles`;
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = Friend._getCssTemplate(this._options, this._instanceId, this._elementId);
        document.head.appendChild(style);
    }

    /** @private 設定所有事件監聽器 */
    _setupEventListeners = () => {
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._calculateCenter = this._calculateCenter.bind(this);
        this._animationLoop = this._animationLoop.bind(this);
        this._onAnimationEnd = this._onAnimationEnd.bind(this);
        this._debouncedCalculateCenter = this._debounce(this._calculateCenter, 200);

        document.addEventListener('mousemove', this._handleMouseMove);
        document.addEventListener('click', this._handleClick);
        window.addEventListener('resize', this._debouncedCalculateCenter);
        this._characterElement.addEventListener('animationend', this._onAnimationEnd);
    }

    /** @private 處理滑鼠移動事件 */
    _handleMouseMove(e) { this._latestMouseX = e.clientX; this._latestMouseY = e.clientY; }

    /** @private 處理點擊事件 */
    _handleClick(e) {
        const rect = this._characterElement.getBoundingClientRect();
        const isHit = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (isHit && !this._characterElement.classList.contains(Friend._BOUNCING_CLASS_NAME)) {
            this._characterElement.classList.add(Friend._BOUNCING_CLASS_NAME);
        }
    }

    /** @private 處理 CSS 動畫結束事件 */
    _onAnimationEnd() { this._characterElement.classList.remove(Friend._BOUNCING_CLASS_NAME); }
    
    /** @private 計算角色中心點 */
    _calculateCenter() {
        if (!this._characterElement) return;
        const rect = this._characterElement.getBoundingClientRect();
        this._characterCenterX = rect.left + (rect.width / 2);
        this._characterCenterY = rect.top + (rect.height / 2);
    }
    
    /** @private 主動畫循環 */
    _animationLoop() {
        const targetAngleRad = Math.atan2(this._latestMouseY - this._characterCenterY, this._latestMouseX - this._characterCenterX);
        const targetAngleDeg = targetAngleRad * (180 / Math.PI) + (this._options.rotationOffset ?? 90);
        let angleDiff = targetAngleDeg - this._currentAngle;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;
        this._currentAngle += angleDiff * this._options.smoothing;
        this._characterElement.style.setProperty('--rotation-angle', `${this._currentAngle}deg`);
        this._animationFrameId = requestAnimationFrame(this._animationLoop);
    }
    
    /** @private Debounce (防抖) 輔助函式 */
    _debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
        };
    }

    /** @private 根據角落設定取得 CSS 位置 */
    _getPositionStylesFromCorner() {
        const offset = `${this._options.edgeOffset}px`;
        const positionStyles = {};
        const cornerMap = { 'top-left': ['top', 'left'], 'top-right': ['top', 'right'], 'bottom-right': ['bottom', 'right'], 'bottom-left': ['bottom', 'left'], };
        const properties = cornerMap[this._options.corner] || cornerMap['bottom-left'];
        properties.forEach(prop => { positionStyles[prop] = offset; });
        return positionStyles;
    }
    
    /** @private @static 產生 CSS 樣式模板 */
    static _getCssTemplate(options, instanceId, elementId) {
        return `
            #${elementId} {
                --rotation-angle: ${options.rotationOffset}deg; --scale: 1;
                transform: rotate(var(--rotation-angle)) scale(var(--scale));
                transform-origin: center center; transition: transform 0.1s linear;
            }
            #${elementId}.${Friend._BOUNCING_CLASS_NAME} {
                animation: bounce-${instanceId} 0.3s ease-out; transition: none;
            }
            @keyframes bounce-${instanceId} {
                0%,100%{--scale:1}15%{--scale:.9}30%{--scale:.8}45%{--scale:1}60%{--scale:1.2}75%{--scale:1.05}90%{--scale:.95}
            }
            @media (max-width: ${options.mobileBreakpoint}px) { #${elementId} { display: none; } }
        `;
    }
}