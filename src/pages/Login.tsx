import React, { useState } from 'react';
import AuthService from '../Api/AuthService'; // Adjust the import path as necessary
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const history = useHistory();

    const handleLogin = async () => {
        if (!validateForm()) return; // Prevent the submission if there are validation errors

        try {
            const response = await AuthService.login(username, password);
            console.log("Login successful:", response);
            alert('Login successful! Redirecting to dashboard.');
            history.push('/main'); // Redirect to dashboard after successful login
        } catch (error) {
            const message = (error as Error).message || 'Failed to login';
            console.error('Login error:', message);
            setErrorMessage(message);
            setShowAlert(true);
        }
    };

    const validateForm = () => {
        let isValid = true;
        if (username.trim().length < 3) {
            setErrorMessage("Username must be at least 3 characters");
            isValid = false;
        } else if (password.trim().length < 3) {
            setErrorMessage("Password must be at least 3 characters");
            isValid = false;
        } else {
            setErrorMessage('');
        }

        return isValid;
    };

    return (
      <IonPage>
          <IonHeader>
              <IonToolbar>
                  <IonTitle>Login</IonTitle>
              </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
          <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                  <IonItem style={{ marginTop: '70px' }}>
                      <IonLabel position="floating" style={{ marginBottom: '10px' }}>Username</IonLabel>
                      <IonInput 
                          value={username} 
                          onIonChange={(e) => setUsername(e.detail.value!)} 
                          clearInput
                      />
                  </IonItem>
                  <IonItem>
                      <IonLabel position="floating" style={{ marginBottom: '10px' }}>Password</IonLabel>
                      <IonInput 
                          type="password" 
                          value={password} 
                          onIonChange={(e) => setPassword(e.detail.value!)} 
                          clearInput
                      />
                  </IonItem>
                  <IonButton expand="block" onClick={handleLogin} style={{ width: '100%', marginTop: '20px' }}>
                      Login
                  </IonButton>
              </div>
              {showAlert && (
                  <IonAlert
                      isOpen={showAlert}
                      onDidDismiss={() => setShowAlert(false)}
                      header='Login Failed'
                      message={errorMessage}
                      buttons={['OK']}
                  />
              )}
          </IonContent>
      </IonPage>
  );
};
export default LoginPage;
