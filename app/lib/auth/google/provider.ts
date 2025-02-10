import { GoogleAuthProvider } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  'login_hint': 'user@google.com OR name@adeptexec.com'
});

export default googleProvider