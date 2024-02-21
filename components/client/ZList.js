'use client'

import { useEffect, useState, useRef, forwardRef } from "react";
import styles from './ZList.module.css';

const ZList = forwardRef(({zvalues, onChanage, onLoad, className='', listClassName='', prefix='', zvalue}, ref) => {
    const tempRef = useRef()
    const zvalListContainerRef = ref || tempRef
    const zvalListRef = useRef()
    const [updatedZvalElms, setUpdatedZvalElms] = useState([])
    const [selectedZvalIndex, setSelectedZvalIndex] = useState(-1)

    useEffect(() => {
        onLoad && onLoad('loaded')
    }, [])

    useEffect(() => {

    }, [zvalue])

    useEffect(() => {
        const touchableElement = zvalListContainerRef.current;
        touchableElement.addEventListener('touchmove', selectingZval, { passive: false });

        return () => {
            touchableElement.removeEventListener('touchmove', selectingZval);
        };
    }, [updatedZvalElms])

    function selectingZval(e) {
        e.preventDefault();
        const {clientX, clientY} = e.touches[0];
        if(!isHorizontallyInsideElement(clientX, zvalListContainerRef.current) || !isVerticallyInsideElement(clientY, zvalListContainerRef.current)) {
            dispatchTouchEndEvent(zvalListRef.current)
            return
        }
        const zvalLiElmList = Array.from(zvalListRef.current.querySelectorAll('li'));
        const zvalSelectedElm = zvalLiElmList.find(li => isVerticallyInsideElement(clientY, li));
        
        updatedZvalElms.forEach(li => li.className = '');
        if(zvalSelectedElm) {
            // setZvalSelected(currAmtSelected)
            selectZval(zvalSelectedElm)

            zvalSelectedElm.classList.add(styles['zval-selected'])
            let newUpdatedElms = [zvalSelectedElm]
            let liElm = zvalSelectedElm.nextSibling;
            for(let i = 1; liElm && i <= 3; i++, liElm = liElm.nextSibling) {
                liElm.classList.add(styles[`zval-selected-a-${i}`]);
                newUpdatedElms.push(liElm)
            }
            liElm = zvalSelectedElm.previousSibling;
            for(let i = 1; liElm && i <= 3; i++, liElm = liElm.previousSibling) {
                liElm.classList.add(styles[`zval-selected-b-${i}`]);
                newUpdatedElms.push(liElm)
            }
            setUpdatedZvalElms(newUpdatedElms)
            const zvalLiIndex = zvalLiElmList.indexOf(zvalSelectedElm);
            if (zvalLiIndex === 0) {
                zvalListRef.current.style.top =  '0'
            } else if (zvalLiIndex === zvalLiElmList.length - 1) {
                zvalListRef.current.style.top =  'auto'
                zvalListRef.current.style.bottom =  '0'
            } else {
                zvalListRef.current.style.top =  '-1rem'
            }
        }
    }

    function selectZval(zvalSelectedElm, triggerOnChange=true) {
        let index = zvalSelectedElm.attributes['data-index'].value
        if (triggerOnChange && onChanage) {
            onChanage({index, value: zvalues[index]})
        }
        setSelectedZvalIndex(index)
    }

    function deselectZval(e) {
        updatedZvalElms.forEach(li => li.className = '');
        setUpdatedZvalElms([])
        zvalListRef.current.style.top = '0'
    }

    return (
        <div ref={zvalListContainerRef} className={`relative grow ${className}`} onTouchEnd={deselectZval}>
            <div className={styles['zval-container-inner']}>
                &nbsp;
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                    <ul ref={zvalListRef} className={`flex flex-col font-bold divide-y divide-slate-200 ${listClassName}`}>
                        {zvalues.map((amt, index) => (
                            <li 
                                key={index} data-index={index} 
                                onClick={e => selectZval(e.target)}
                                data-isselected={index == selectedZvalIndex}
                            >
                                {prefix}{amt}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});

ZList.displayName = 'ZList'

export default ZList;

/**
 * x2 = x - z/(n-1)
 * x2 : new height
 * x : original height
 * z : extra height in selection
 * n : number of rows
 */



function dispatchTouchEndEvent(element) {

    // Create a touch point
    const touchPoint = new Touch({
        identifier: Date.now(),
        target: document,
        clientX: 0,
        clientY: 0,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 10,
        force: 0.5,
    });

    // Create a touch event
    const touchEvent = new TouchEvent('touchend', {
        touches: [touchPoint],        // List of all touches currently on the screen
        targetTouches: [touchPoint],  // Touches that started on the target element
        changedTouches: [touchPoint], // Touches that have changed since the last event
        bubbles: true,                // Event bubbles up through the DOM
        cancelable: true              // Event can be canceled
    });

    // Dispatch the event
    element.dispatchEvent(touchEvent);
}

function isVerticallyInsideElement(clientY, element) {
    const {top, height} = element.getBoundingClientRect()
    return clientY > top && clientY <= (top + height);
}
function isHorizontallyInsideElement(clientX, element) {
    const {left, width} = element.getBoundingClientRect()
    return clientX > left && clientX <= (left + width);
}