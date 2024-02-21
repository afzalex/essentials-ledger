'use client'

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import ZList from './ZList'
import {getCachedData, setCachedData} from '@/utils/cacheUtils'
import {InputAdornment, TextField, Typography} from '@mui/material'
import PickerWithButtonField from '@/components/client/PickerWithButtonField';
import { Button } from '@mui/material';
import GoogleSignIn from './GoogleSignIn'
import styles from './EssentialsFeed.module.css';
import moment from 'moment';

export default function EssentialsFeed({showError=msg=>{}, setProcessing=s=>{}, showSplashscreen, essentialsUrl}) {
    const amtContainerRef = useRef()
    const [amtList, setAmtList] = useState([0])
    const [amtVisibleCount, setAmtVisibleCount] = useState(0)
    const [amtTicker, setAmtTicker] = useState(100)
    const [amount, setAmount] = useState(0)
    const [spendingTypes, setSpendingTypes] = useState([])
    const [spendingType, setSpendingType] = useState(null)
    const [date, setDate] = useState(moment())
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        if (spendingTypes.length === 0) {
            getCachedData('spending-types', () => fetch(essentialsUrl)
                .then(r => r.json())
                .then(d => {
                    console.log('loaded spending types from server')
                    return d.spendingTypes
                })
            ).then(d => {
                setSpendingTypes(d)
                setIsLoading(false)
                showSplashscreen(false)
            }).catch(e => {
                showError('Unable to load spending types')
            })
        }
        setSpendingType(getCachedData('spending-type', spendingType))
        setAmount(getCachedData('amount', amount));
    }, []);


    useEffect(() => {
        let currAmtList = [...amtList];
        let lastAmtValue = currAmtList[currAmtList.length - 1]
        for(let i = 0; i < amtVisibleCount; i++) {
            currAmtList.push(lastAmtValue+=amtTicker)
        }
        setAmtList(currAmtList)
    }, [amtVisibleCount, isLoading])

    const amountInit = useCallback(() => {
        if(amtContainerRef.current) {
            const amtContainerHeight = amtContainerRef.current.offsetHeight;
            const amtHeight = amtContainerRef.current.querySelector('li').offsetHeight + 1;
            const amtVisibleCountNew = Math.floor(amtContainerHeight / amtHeight);
            setAmtVisibleCount(amtVisibleCountNew);
            console.log('sizing', amtContainerHeight, amtHeight, amtVisibleCountNew)
        }
    });

    if (isSubmitted) {
        return <>

            <div className="flex flex-col justify-center items-center h-screen bg-white text-black">
                <div className="flex flex-col justify-center items-center grow">
                    <div className='h-20'></div>
                    <Typography variant="h4" fontWeight={700}>Thank You !</Typography>
                    <Button className='pt-5' onClick={e => {setIsSubmitted(false)}}>Submit Again</Button>
                    <div className='grow'></div>
                    <iframe width="376" height="277" seamless src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQj1ca59uRg_hhybWX8G6S6jjsqKu9e-L4LHLxhaPfNzpE2n6BDB78NS8asqgMUFo7SLlKz3btgi04A/pubchart?oid=1946067004&amp;format=interactive"></iframe>
                    <div className='h-20'></div>
                    </div>
                <Typography variant="caption" className="p-5">Made by Afzal</Typography>
            </div>
        </>
    }

    if (isLoading) {
        return <>Loading ...</>
    }

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
            if(!r.ok) {
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
        <div className='flex items-end p-4 border-b-2 border-blue-500'>
          <div className='grow'>
            <PickerWithButtonField value={date} setValue={setDate} />
          </div>
          <Button size="small" variant='outlined' onClick={submit}>OK</Button>
        </div>
        <div className="essentials-feed pb-2 flex flex-row items-stretch flex-grow text-black">
            <div className="w-1/2 flex flex-col">
                <ZList 
                    zvalues={spendingTypes} 
                    className="bg-slate-100"
                    listClassName="text-left"
                    zvalue={spendingType}
                    onChanage={({value}) => setSpendingType(value)}
                />

                <div className="p-4 border-t-2 border-blue-500 pr-2 text-right">
                    <TextField
                        label="Spending Type"
                        size="small"
                        value={spendingType || ''}
                        onChange={e => {e.target.value}}
                    />
                </div>
            </div>

            <div className="w-1/2 flex flex-col">
                <ZList 
                    ref={amtContainerRef} 
                    zvalues={amtList} 
                    className="bg-slate-100"
                    listClassName="text-center"
                    zvalue={amount}
                    onChanage={({value}) => setAmount(value)}
                    onLoad={amountInit}
                />
                <ZValSelect zval={amount} onChanage={e => setAmount(e.target.value)} />
            </div>
        </div>

        {/* <div className=' h-16 font-semibold text-center p-4 border-t-2 border-blue-300'>
            <GoogleSignIn /> 
        </div> */}  
    </>);
}

function ZValSelect ({zval='', onChanage}) {
    return <>
        <div className="p-4 border-t-2 border-blue-500 pl-2 text-right min-h-16">
            <TextField
                label="Amount" size="small"
                value={zval}
                onChange={e => onChanage && onChanage(e)}
                InputProps={{
                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                }}
            />
        </div>
    </>
}




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
