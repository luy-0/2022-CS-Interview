//深拷贝
function clone(target) {
    if (typeof target === 'object') {
        let cloneTarget = {};
        for (const key in target) {
            cloneTarget[key] = clone(target[key]);
        }
        return cloneTarget;
    } else {
        return target;
    }
};

//深拷贝 考虑数组
module.exports = function clone(target) {
    if (typeof target === 'object') {
        let cloneTarget = Array.isArray(target) ? [] : {};
        for (const key in target) {
            cloneTarget[key] = clone(target[key]);
        }
        return cloneTarget;
    } else {
        return target;
    }
};


//深拷贝
function clone(target, map = new Map()) {
    if (typeof target === 'object') {
        let cloneTarget = Array.isArray(target) ? [] : {};
        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, cloneTarget);
        for (const key in target) {
            cloneTarget[key] = clone(target[key], map);
        }
        return cloneTarget;
    } else {
        return target;
    }
};

//浅拷贝
function clone(target) {
    let cloneTarget = {};
    for (const key in target) {
        cloneTarget[key] = target[key];
    }
    return cloneTarget;
};

//节流
function debounce(fn) {
    let timeout = null;
    return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, 500);
    }
}

//防抖
function throttle(fn) {
    let canRun = true;
    return function () {
        if (!canRun) return;
        canRun = false;
        setTimeout(() => {
            fn.apply(this.arguments)
            canRun = true;
        }, 500)
    }
}

function sayHi() {
    console.log("ok")
}

var inp = document.getElementById('inp')
inp.addEventListener('input', debounce(sayHi))