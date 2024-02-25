'use client'

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import ZList from './ZList'
import { getCachedData, setCachedData } from '@/utils/cacheUtils'
import { Chip, Divider, InputAdornment, TextField, Typography } from '@mui/material'
import PickerWithButtonField from '@/components/client/PickerWithButtonField';
import { Button } from '@mui/material';
import GoogleSignIn from './GoogleSignIn'
// import styles from './EssentialsFeed.module.css';
import moment from 'moment';

export default function EssentialsFeed({ showError = msg => { }, setProcessing = s => { }, showSplashscreen, essentialsUrl }) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [spendingTypes, setSpendingTypes] = useState([])
    const [amount, setAmount] = useState(0)
    const [recommendedAmounts, setRecommendedAmounts] = useState([])
    const [spendingType, setSpendingType] = useState('')
    const [date, setDate] = useState(moment())

    useEffect(() => {
        if (spendingTypes.length === 0) {
            getCachedData('spending-types', () => {
                setProcessing(true)
                return fetch(essentialsUrl)
                    .then(r => r.json())
                    .then(d => {
                        console.log('loaded spending types from server')
                        return d.spendingTypes
                    })
                    .finally(() => setProcessing(false))
            }).then(d => {
                setSpendingTypes(d)
                setIsLoading(false)
                showSplashscreen(false)
            }).catch(e => {
                showError('Unable to load spending types')
            })
        }
        setSpendingType(getCachedData('spending-type', spendingType))
        setAmount(getCachedData('amount', amount || 0));
        setRecommendedAmounts(getCachedData('recommended-amounts', [0, 10, 50, 100, 200, 500, 1000, 2000, 5000]))
    }, []);

    if (isSubmitted) return <ThankYou setIsSubmitted={setIsSubmitted} />

    if (isLoading) <>Loading ...</>

    function submit() {
        setProcessing(true)
        const postData = JSON.stringify({
            spendingType,
            amount,
            date: date.toISOString()
        });
        console.log(date.format('DD/MM/yyyy'), postData)
        fetch(essentialsUrl, {
            method: 'POST',
            body: postData
        }).then(r => {
            if (!r.ok) {
                console.log('failed')
                throw Error(r)
            }
            return r.json()
        }).then(r => {
            setCachedData('amount', amount)
            setCachedData('spending-type', spendingType)
            console.log(r)
        }).catch(e => {
            console.log(e)
        }).finally(() => {
            setIsSubmitted(true)
            setProcessing(false)
        })
    }

    return (<>
        {/* Header */}
        <div className='flex items-end p-4 border-b-2 border-blue-500'>
            <div className='grow'>
                <PickerWithButtonField value={date} setValue={setDate} />
            </div>
            <Button size="small" variant='outlined' onClick={submit}>OK</Button>
        </div>

        {/* Body */}
        <div className="grow flex flex-col overflow-hidden">
            <div className="grow p-4 flex flex-wrap content-start">
                {spendingTypes.map((t, i) => <div key={i} className="pr-2 pb-2">
                    <Chip color="primary" label={t} variant={t === spendingType ? 'filled' : 'outlined'} onClick={e => setSpendingType(t)} className="px-3" />
                </div>)}
            </div>
            <div className="border-t-2 border-blue-500">
                <NumberSelector onChange={d => setAmount(d)}/>
            </div>
            <Divider />
            <div className="flex flex-wrap justify-center content-start p-2 pb-0">
                {recommendedAmounts.map((a, i) => <div key={i} className="pr-2 pb-2">
                    <Chip className="p-2" label={a} variant="outlined" size="small" onClick={e => setAmount(a)} />
                </div>)}
            </div>
        </div>

        {/* Footer */}
        <div className="flex just p-4 border-t-2 border-blue-500">
            <div className="w-1/2 mr-2">
                <TextField
                    label="Spending Type" size="small"
                    value={spendingType || ''}
                />
            </div>
            <div className="w-1/2 ml-2">
                <TextField
                    label="Amount" size="small"
                    value={amount || 0}
                    onChange={e => setAmount(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                    }}
                />
            </div>
        </div>

        {/* <div className=' h-16 font-semibold text-center p-4 border-t-2 border-blue-300'>
            <GoogleSignIn /> 
        </div> */}

        {/* <div className='relative w-full text-center'>
            <Divider />
            <Typography variant="caption" className="p-5">Made by Afzal</Typography>             
        </div> */}
    </>);
}

import styles from './NumberSelector.module.scss'
function NumberSelector({onChange}) {
    const numRowContainerRef = useRef()
    const [number, setNumber] = useState(0)
    const [showDisplay, setShowDisplay] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [prevPartiallyActiveIndex, setPrevPartiallyActiveIndex] = useState()
    const [nextPartiallyActiveIndex, setNextPartiallyActiveIndex] = useState()
    const numbersArrayRef = useRef([])
    const numRowHandlersRef = useRef([])
    const touchMove = useCallback(function (e) {
        e.preventDefault()
        let {clientX, clientY} = e.touches ? e.touches[0] : e;
        numRowHandlersRef.current.forEach(handler => handler.touchListener(clientX, clientY, activeIndex, nextPartiallyActiveIndex, prevPartiallyActiveIndex, e))
    }, [numRowHandlersRef, activeIndex, nextPartiallyActiveIndex, prevPartiallyActiveIndex])
    function touchEnd() {
        setShowDisplay(false)
        setActiveIndex(0)
        onChange && onChange(number)
    }

    useEffect(() => {
        const touchableElement = numRowContainerRef.current;
        touchableElement.addEventListener('touchmove', touchMove, { passive: false });
        touchableElement.addEventListener('click', touchMove)
        return () => {
            touchableElement.removeEventListener('touchmove', touchMove);
            touchableElement.removeEventListener('click', touchMove)
        };
    }, [numRowHandlersRef])

    function onNumElementActiveTouch(x, activeNumber, id) {
        setDisplayLeft(x - 50)
        setShowDisplay(true)
        let currentNumber = 0
        if (numbersArrayRef.current[id - 1]) {
            currentNumber = numbersArrayRef.current[id - 1] + activeNumber
        } else {
            currentNumber = activeNumber
        }
        numbersArrayRef.current[id] = currentNumber
        setNumber( currentNumber )
    }
    useEffect(() => {
        setPrevPartiallyActiveIndex(activeIndex - 1)
        setNextPartiallyActiveIndex(activeIndex + 1)
    }, [activeIndex])

    function onNumElementPartActiveTouch(id) {
        setActiveIndex(id)
    }
    const numRowNumbers = [
        [0, 1000, 2000, 3000, 4000, 5000],
        [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
    const [displayLeft, setDisplayLeft] = useState(0)

    return <div className={styles.numContainer}>
        <div className={styles.numdisplay} style={{
            left: displayLeft,
            display: showDisplay ? 'block' : 'none'
        }}>
            {number}
            <div className={styles.arrow}></div>
        </div>
        {showDisplay}
        <div className={styles.rowswrapper}>
            <div ref={numRowContainerRef} onTouchEnd={touchEnd} >
                {numRowNumbers.map((numbers, index) => <NumberSelectorRow
                    key={index}
                    id={index}
                    numRowHandlersRef={numRowHandlersRef}
                    numbersArrayRef={numbersArrayRef}
                    onActive={onNumElementActiveTouch}
                    onPartActive={onNumElementPartActiveTouch}
                    numbers={numbers}
                    isActive={index === activeIndex}
                    isPartNextActive={index === nextPartiallyActiveIndex}
                    isPartPrevActive={index === prevPartiallyActiveIndex}
                />)}
            </div>
        </div>
    </div>
}

function NumberSelectorRow({ id, onActive, onPartActive, numbers, numRowHandlersRef, numbersArrayRef, isActive = false, isPartNextActive, isPartPrevActive }) {
    const containerRef = useRef()

    const numRowHandler = {
        id: id,
        touchListener(clientX, clientY) {
            if (!(isActive || isPartNextActive || isPartPrevActive)) return

            if (!isVerticallyInsideElement(clientY, containerRef.current)) return;

            if (isPartNextActive || isPartPrevActive) {
                onPartActive(id)
            }

            if (!isVerticallyInsideElement(clientY, containerRef.current)) return;

            const activeLiElm = Array.from(containerRef.current.querySelectorAll('li')).find(li => {
                return isHorizontallyInsideElement(clientX, li)
            })
            if (activeLiElm) {
                onActive(clientX, numbers[activeLiElm.attributes['data-index'].value], id)
            }
        }
    }
    useEffect(() => {
        numRowHandlersRef.current[id] = numRowHandler;
        return function () {}
    }, [isActive, isPartNextActive, isPartPrevActive])

    return <div className={`${styles.numRow} `} data-isactive={isActive} data-ispartprevactive={isPartPrevActive} data-ispartnextactive={isPartNextActive} ref={containerRef}>
        <ul className="flex">
            {numbers.map((amountValue, i) => <li key={i} data-index={i} className="w-20 py-1 text-center">
                { (numbersArrayRef.current[id-1]?numbersArrayRef.current[id-1]:0) + amountValue }
            </li>)}
        </ul>
    </div>
}

function isVerticallyInsideElement(clientY, element) {
    const { top, height } = element.getBoundingClientRect()
    return clientY > top && clientY <= (top + height);
}
function isHorizontallyInsideElement(clientX, element) {
    const { left, width } = element.getBoundingClientRect()
    return clientX > left && clientX <= (left + width);
}


function ThankYou({ setIsSubmitted }) {
    return <div className="flex flex-col justify-center items-center h-screen bg-white text-black">
        <div className="flex flex-col justify-center items-center grow">
            <div className='h-20'></div>
            <Typography variant="h4" fontWeight={700}>Thank You !</Typography>
            <Button className='pt-5' onClick={e => setIsSubmitted(false)}>Submit Again</Button>
            <div className='grow'></div>
            <iframe width="376" height="277" seamless src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQj1ca59uRg_hhybWX8G6S6jjsqKu9e-L4LHLxhaPfNzpE2n6BDB78NS8asqgMUFo7SLlKz3btgi04A/pubchart?oid=1946067004&amp;format=interactive"></iframe>
            <div className='h-20'></div>
        </div>
        <Typography variant="caption" className="p-5">Made by Afzal</Typography>
    </div>
}