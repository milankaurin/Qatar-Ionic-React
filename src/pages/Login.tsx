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



    import axios, { AxiosError } from 'axios';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const history = useHistory();

  const handleLogin = async () => {
    if (!validateForm()) return; // Sprečava slanje ako ima grešaka u validaciji

    try {
      const response = await AuthService.login(username, password);
      console.log("Login successful:", response);
      
      // Postavljanje poruke o uspehu i prikazivanje alert-a
      setSuccessMessage('Uspešno ste se prijavili! Prebacujemo vas na glavnu stranu.');
      setShowSuccessAlert(true);
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // Izvlačenje poruke greške sa servera
        const serverMessage = error.response.data.message || 'Došlo je do greške prilikom prijavljivanja';
        setErrorMessage(serverMessage);
      } else {
        setErrorMessage('Došlo je do neočekivane greške. Pokušajte ponovo.');
      }

      setShowAlert(true);
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (username.trim().length === 0) {
      setErrorMessage('Korisničko ime je obavezno');
      isValid = false;
    } else if (password.trim().length === 0) {
      setErrorMessage('Lozinka je obavezna');
      isValid = false;
    } else {
      setErrorMessage('');
    }

    if (!isValid) {
      setShowAlert(true);
    }

    return isValid;
  };

  const handleSuccessAlertDismiss = () => {
    setShowSuccessAlert(false);
    history.push('/main'); // Preusmeravanje na glavnu stranu nakon zatvaranja alert-a
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
            <IonLabel position="floating" style={{ marginBottom: '10px' }}>Korisničko ime</IonLabel>
            <IonInput 
              value={username} 
              onIonChange={(e) => setUsername(e.detail.value!)} 
              clearInput
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" style={{ marginBottom: '10px' }}>Lozinka</IonLabel>
            <IonInput 
              type="password" 
              value={password} 
              onIonChange={(e) => setPassword(e.detail.value!)} 
              clearInput
            />
          </IonItem>
          <IonButton expand="block" onClick={handleLogin} className="small-button1" style={{ width: '100%', marginTop: '10px' }}>
            Prijavi se
          </IonButton>
        </div>
        {/* Alert za greške */}
        {showAlert && (
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header='Greška pri prijavljivanju'
            message={errorMessage}
            buttons={['OK']}
          />
        )}
        {/* Alert za uspešno prijavljivanje */}
        {showSuccessAlert && (
          <IonAlert
            isOpen={showSuccessAlert}
            onDidDismiss={handleSuccessAlertDismiss}
            header='Uspešno prijavljivanje'
            message={successMessage}
            buttons={['OK']}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;