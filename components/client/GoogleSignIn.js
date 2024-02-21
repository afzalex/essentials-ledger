import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const clientId = "354174881187-k11hsid6ajh4q7tv3rvc3lgq6rcm8igt.apps.googleusercontent.com";

function GoogleSignIn() {
  const onSuccess = (res) => {
    console.log('Login Success: currentUser:', res.profileObj);
    // You can now use res.accessToken to make requests to Google APIs
  };

  const onFailure = (res) => {
    console.log('Login failed: res:', res);
  };

  return (
    <GoogleOAuthProvider clientId={clientId} >
        <div>
        <GoogleLogin
            buttonText="Login"
            onSuccess={onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
            isSignedIn={true}
        />
        </div>
    </GoogleOAuthProvider>
  );
}

export default GoogleSignIn;
