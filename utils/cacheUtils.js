import moment from "moment";

function keyTimestampKey(key) {
    return `_${key}_timestamp`
}

export function setCachedData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(keyTimestampKey(key), moment().toISOString())
}

export function getCachedData(key, newValue, invalidateSeconds = 10 * 1000, doForceUpdate=false) {
    var cachedValue = null;
    const storedValue = localStorage.getItem(key);
    if (!doForceUpdate && storedValue) {
        let storedValueTimestamp = localStorage.getItem(keyTimestampKey(key))
        // console.log(key, storedValueTimestamp, moment().diff(storedValueTimestamp, 'seconds'), storedValue)
        if (storedValueTimestamp && moment().diff(storedValueTimestamp, 'seconds') < invalidateSeconds) {
            cachedValue = JSON.parse(storedValue);
        }
    }
    if (cachedValue !== null) {
        if (typeof newValue === 'function') {
            return new Promise((resolve, reject) => resolve(cachedValue));
        } else {
            return cachedValue
        }
    } else if (newValue) {
        if (typeof newValue === 'function') {
            return newValue().then(value => {
                setCachedData(key, value);
                return value
            })
        } else {
            setCachedData(key, newValue);
            return newValue
        }
    }
}

export default setCachedData
