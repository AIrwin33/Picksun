import React from "react";
import { useHistory } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = `${process.env.REACT_APP_AUTH0_DOMAIN}` //'muhammadumerchaudhary.us.auth0.com';
  const clientId =`${process.env.REACT_APP_AUTH0_CLIENTID}` //'XR8RSl1GjFGTycMyBjuiLfkXAe1wCs7p';
  const audience= `${process.env.REACT_APP_AUTH0_AUDIENCE}` //'https://pickfun-auth'
  // alert(domain);
  const history = useHistory();

  const onRedirectCallback = (appState) => {
    console.log(appState)
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
      audience={audience}

    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;