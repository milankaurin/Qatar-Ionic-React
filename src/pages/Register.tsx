import React, { useState } from 'react';
import AuthService from '../Api/AuthService';
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
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosError } from 'axios'; 
import './Register.css';
const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const history = useHistory();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [firstNameError, setFirstNameError] = useState<string>('');
    const [lastNameError, setLastNameError] = useState<string>('');

    const handleRegister = async () => {
        if (!validateForm()) return; // Prevent the submission if there are validation errors
    
        try {
            const response = await AuthService.register(username, password, firstName, lastName);
            console.log("Registration successful:", response);
            alert('Registration successful! Redirecting to login page.');
            history.push('/login');
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                // Extract the error message from the server response
                const serverMessage = error.response.data.message;
                alert(serverMessage); // Show the server message in the alert
            } else {
                console.error('Register error:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        

        // Validacija za korisničko ime
        if (!username.trim()) {
            setUsernameError('Korisničko ime je obavezno');
            isValid = false;
        } else if (username.length < 3) {
            setUsernameError('Korisničko ime mora imati najmanje 3 karaktera');
            isValid = false;
        } else {
            setUsernameError('');
        }
    
        // Validacija za lozinku
        if (!password) {
            setPasswordError('Lozinka je obavezna');
            isValid = false;
        } else if (password.length < 3) {
            setPasswordError('Lozinka mora imati najmanje 3 karaktera');
            isValid = false;
        } else {
            setPasswordError('');
        }
    
        // Validacija za ime
        if (!firstName.trim()) {
            setFirstNameError('Ime je obavezno');
            isValid = false;
        } else if (firstName.length < 2) {
            setFirstNameError('Ime mora imati najmanje 2 karaktera');
            isValid = false;
        } else {
            setFirstNameError('');
        }
    
        // Validacija za prezime
        if (!lastName.trim()) {
            setLastNameError('Prezime je obavezno');
            isValid = false;
        } else if (lastName.length < 2) {
            setLastNameError('Prezime mora imati najmanje 2 karaktera');
            isValid = false;
        } else {
            setLastNameError('');
        }
    
        return isValid;
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Registracija</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                    <IonItem>
                        <IonLabel position="floating" style={{ marginBottom: '10px' }}>Ime</IonLabel>
                        <IonInput 
                            value={firstName} 
                            onIonChange={(e) => setFirstName(e.detail.value!)} 
                            clearInput
                        />
                    </IonItem>
                    {firstNameError && (
                        <IonText color="danger">
                            <p>{firstNameError}</p>
                        </IonText>
                    )}
                    <IonItem>
                        <IonLabel position="floating" style={{ marginBottom: '10px' }}>Prezime</IonLabel>
                        <IonInput 
                            value={lastName} 
                            onIonChange={(e) => setLastName(e.detail.value!)} 
                            clearInput
                        />
                    </IonItem>
                    {lastNameError && (
                        <IonText color="danger">
                            <p>{lastNameError}</p>
                        </IonText>
                    )}
                    <IonItem>
                        <IonLabel position="floating" style={{ marginBottom: '10px' }}>Korisničko ime</IonLabel>
                        <IonInput
                            value={username} 
                            onIonChange={(e) => setUsername(e.detail.value!)} 
                            clearInput
                        />
                    </IonItem>
                    {usernameError && (
                        <IonText color="danger">
                            <p>{usernameError}</p>
                        </IonText>
                    )}
                    <IonItem>
                        <IonLabel position="floating" style={{ marginBottom: '10px' }}>Lozinka</IonLabel>
                        <IonInput 
                            type="password" 
                            value={password} 
                            onIonChange={(e) => setPassword(e.detail.value!)} 
                            clearInput
                        />
                    </IonItem>
                    {passwordError && (
                        <IonText color="danger">
                            <p>{passwordError}</p>
                        </IonText>
                    )}
                    <IonButton expand="block" className="small-button1" onClick={handleRegister} style={{ width: '100%' , marginTop: '10px'  }}>
                        Registruj se
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    
    );
    };

export default RegisterPage;