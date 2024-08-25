import React from 'react';
import { useIonRouter } from '@ionic/react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonImg } from '@ionic/react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    const router = useIonRouter();

    const handleProceed = () => {
        router.push('/main');
    };

    return (
        <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Dobrodošli na Svetsko Prvenstvo u Kataru 2022</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
            <div className="landing-container">
                <IonImg src="/logo.png" alt="World Cup Logo" className="logo" />
                <IonButton expand="block" onClick={handleProceed} className="proceed-button">
                    Nastavi
                </IonButton>
            </div>
        </IonContent>
    </IonPage>
    );
};

export default LandingPage;
