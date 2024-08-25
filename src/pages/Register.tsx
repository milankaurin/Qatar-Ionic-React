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

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const history = useHistory();

    const handleRegister = async () => {
        if (!validateForm()) return; // Prevent the submission if there are validation errors

        try {
            const response = await AuthService.register(username, password);
            console.log("Registration successful:", response);
            alert('Registration successful! Redirecting to login page.');
            history.push('/login');
        } catch (error) {
            console.error('Register error:', error);
        }
    };

    const validateForm = () => {
        let isValid = true;
        if (username.trim().length < 3) {
            setUsernameError("Username must be at least 3 characters");
            isValid = false;
        } else {
            setUsernameError("");
        }

        if (password.trim().length < 3) {
            setPasswordError("Password must be at least 3 characters");
            isValid = false;
        } else {
            setPasswordError("");
        }

        return isValid;
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Register</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Username</IonLabel>
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
                    <IonLabel position="floating">Password</IonLabel>
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
                <IonButton expand="block" onClick={handleRegister}>
                    Register
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default RegisterPage;