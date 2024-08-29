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
    
        // Validation for username
        if (!username.trim()) {
            setUsernameError('Username is required');
            isValid = false;
        } else {
            setUsernameError('');
        }
    
        // Validation for password
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }
    
        // Validation for first name
        if (!firstName.trim()) {
            setFirstNameError('First name is required');
            isValid = false;
        } else {
            setFirstNameError('');
        }
    
        // Validation for last name
        if (!lastName.trim()) {
            setLastNameError('Last name is required');
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
                    <IonButton expand="block" onClick={handleRegister} style={{ width: '100%' }}>
                        Registruj se
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    
    );
    };

export default RegisterPage;