// Configuration Auth0
export const auth0Config = {
  domain: 'dev-73r62jvmx1usuvld.us.auth0.com',
  clientId: '87rvngXjdw36nwT91H0TejPbkG3dNPK4',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
    audience: undefined, // Optionnel: à configurer si tu utilises une API
    scope: 'openid profile email'
  }
};

// Liste des emails autorisés comme admin
// Tu peux ajouter les emails des personnes qui ont le droit d'administrer
export const ADMIN_EMAILS = [
    'alexandre.bailleu@gmail.com'
  // Ajoute ton email ici après la première connexion
  // Exemple: 'ton.email@example.com'
];
