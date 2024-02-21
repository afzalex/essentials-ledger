'use client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import EssentialsFeed from '@/components/client/EssentialsFeed'
import { Alert, Backdrop, Button, CircularProgress, Typography } from '@mui/material';
import CryptoJS from 'crypto-js'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { useEffect, useState } from 'react';
import keyInfo from '@/app/keyinfo.json';
import setCachedData, { getCachedData } from '@/utils/cacheUtils';
import moment from 'moment';
import Image from 'next/image';

(function () {
  function isRunningOnIphone() {
    return /iPhone/.test(navigator.userAgent) || /iPhone/.test(navigator.platform);
  }
  function isRunningOnChrome() {

  }

  if (isRunningOnIphone()) {
    document.querySelector('body')?.classList.add('iphone-body')
  }
})()

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSplashscreen, setShowSplashscreen] = useState(true)
  const [essentialsUrl, setEssentialsUrl] = useState<string | null>(null)

  function showError(msg: string) {
    setError(msg)
    window.setTimeout(() => setError(null), 3000)
  }

  useEffect(() => {
    getCachedData('essentials-url', async () => getEssentialsUrl(), 60*60*24*30, keyInfo.updatedTimestamp !== getCachedData('essentials-url-recorded-timestamp'))
      .then((url: string) => {
        setCachedData('essentials-url-recorded-timestamp', keyInfo.updatedTimestamp)
        setEssentialsUrl(url)
      });
  }, [])

  return (<>
    <LocalizationProvider dateAdapter={AdapterMoment} >
      {error && <div className="fixed flex h-full w-full justify-center z-50 items-center bg-slate-100 bg-opacity-50">
        <Alert severity="error" className='grow m-10'>{error}</Alert>
      </div>}
      <Backdrop open={isProcessing} style={{ zIndex: 1000 }}>
        <CircularProgress />
      </Backdrop>
      {showSplashscreen &&
        <div className="fixed flex flex-col justify-center items-center h-screen bg-white text-black">
          <div className="flex flex-col justify-center items-center grow">
            <Typography variant="h4" fontWeight={700}>
              Essentials Tracker
            </Typography>
            <img alt="Splashscreen" src="splashscreen.png" />
          </div>
          <Typography variant="caption" className="p-5">Made by Afzal</Typography>
        </div>
      }
      {essentialsUrl &&
        <main className="w-full h-screen bg-white flex flex-col justify-between text-black">
          <EssentialsFeed showError={showError} setProcessing={setIsProcessing} showSplashscreen={setShowSplashscreen} essentialsUrl={essentialsUrl} />
        </main>
      }
    </LocalizationProvider>
  </>);
}


function getEssentialsUrl() {
  const essentialsPass = `${window.prompt('Password')}`
  console.log('keyInfo: ', keyInfo)
  const essentialsUrl = CryptoJS.AES.decrypt(keyInfo.url, essentialsPass).toString(CryptoJS.enc.Utf8)
  console.log('essentialsUrl: ', essentialsUrl)
  return essentialsUrl
}