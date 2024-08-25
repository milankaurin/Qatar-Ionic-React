import React, {useState,useEffect} from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonText,IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import TimService from '../Api/TimService';
import GrupaKomponenta from './GrupaKomponenta';

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

  if (!isAuthenticated) {
      return (
          <IonPage>
              <IonContent className="ion-padding">
                  <IonText>You are not logged in. Please</IonText>
                  <IonButton onClick={() => history.push('/login')}>log in</IonButton>
                               
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
