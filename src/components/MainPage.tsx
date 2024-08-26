import React, {useState,useEffect} from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonText,IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import TimService from '../Api/TimService';
import GrupaKomponenta from './GrupaKomponenta';
import axios from 'axios';


const MainPage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(null);
  const [teams, setTeams] = React.useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const history = useHistory();

  useEffect(() => {
      const token = sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
      console.log(isAuthenticated);
      console.log(token);
  }, [sessionStorage.getItem("token")]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
    console.log(isAuthenticated);
    console.log(token);
});


  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Set the Authorization header on page load or when the token changes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setIsAuthenticated(false);
    }
  }, []);


  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonContent className="ion-padding" fullscreen>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <IonText color="medium" style={{ marginBottom: '20px' }}>
              You are not logged in. Please log in or register to continue.
            </IonText>
            <div style={{ display: 'flex', gap: '10px' }}>
              <IonButton expand="block" color="secondary" onClick={() => history.push('/login')}>
                Log In
              </IonButton>
              <IonButton expand="block" color="secondary" onClick={() => history.push('/register')}>
                Register
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }



  const handleGroupSelect = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await fetchTeams(groupId);
  };

  const fetchTeams = async (groupId: number) => {
    try {
      const teams = await TimService.getTeamsByGroupId(groupId);
      setTeams(teams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Groups</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          {/* Pass the handleGroupSelect function as a prop */}
          <GrupaKomponenta onGroupSelect={handleGroupSelect} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
