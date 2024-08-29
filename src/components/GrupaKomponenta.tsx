import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonPage,
  IonAlert, IonLoading
  
} from '@ionic/react';
import GrupaService from '../Api/GrupaService';
import TimService from '../Api/TimService';
import UtakmicaService from '../Api/UtakmicaService';
import StadionService from '../Api/StadionService';
import ScheduleMatchComponent from '../components/UtakmicaKomponenta';
import { useHistory } from 'react-router-dom';
import './GrupaKomponenta.css';

interface GrupaKomponentaProps {
  onGroupSelect: (groupId: number) => Promise<void>;
}


const GrupaKomponenta: React.FC<GrupaKomponentaProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [showScheduleComponent, setShowScheduleComponent] = useState(false);
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showDeleteError, setShowDeleteError] = useState(false);
const [deleting, setDeleting] = useState(false);
const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
const [showTeamError, setShowTeamError] = useState(false);
const [teamErrorMessage, setTeamErrorMessage] = useState('');
const toggleScheduleView = () => {
  setShowScheduleComponent(prev => !prev);
  if (selectedGroupId !== null) {
    fetchTeams(selectedGroupId);
  
}};

  useEffect(() => {
    fetchGroups();
  }, []);



  const fetchGroups = async () => {
    try {
      const data = await GrupaService.getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setAlertMessage("Naziv grupe ne može biti prazan.");
      setShowAlert(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmCreateGroup = async () => {
    try {
      const newGroup = await GrupaService.createGroup(groupName);
      setGroups(prev => [...prev, newGroup]);
      setGroupName('');
    } catch (error) {
      setAlertMessage("Došlo je do greške pri kreiranju grupe.");
      setShowAlert(true);
    }
  };


  const handleGroupSelect = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await fetchTeams(groupId);
  };

  const fetchTeams = async (groupId: number) => {
    try {
      const teamData = await TimService.getTeamsByGroupId(groupId);
      const sortedTeams = teamData.sort((a: any, b: any) => {
        if (b.brojPoena !== a.brojPoena) return b.brojPoena - a.brojPoena;
        const goalDifferenceA = a.brojDatihGolova - a.brojPrimljenihGolova;
        const goalDifferenceB = b.brojDatihGolova - b.brojPrimljenihGolova;
        if (goalDifferenceB !== goalDifferenceA) return goalDifferenceB - goalDifferenceA;
        return b.brojDatihGolova - a.brojDatihGolova;
      });
      setTeams(sortedTeams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setAlertMessage('Morate uneti ime tima');
      setShowAlert(true);
      return;
    }
    try {
      const newTeam = await TimService.createTeam({
        imeTima: teamName,
        grupaId: selectedGroupId,
        zastavica: '',
        brojPoena: 0,
        brojPobeda: 0,
        brojPoraza: 0,
        brojNeresenih: 0,
        brojDatihGolova: 0,
        brojPrimljenihGolova: 0
      });
      setTeams(prevTeams => [...prevTeams, newTeam]);
      setTeamName('');
      fetchTeams(selectedGroupId!);
    } catch (error: unknown) {
      console.error('Failed to create team:', error);
      let errorMessage = 'There was an issue creating the team. Please try again.';
      if (typeof error === 'object' && error !== null) {
        const e = error as { response?: { data?: { error?: string } }; message?: string };
        if (e.response && e.response.data && e.response.data.error) {
          errorMessage = e.response.data.error;
        } else if (e.message) {
          errorMessage = e.message;
        }
      }
      setTeamErrorMessage(errorMessage);
      setShowTeamError(true);
    }
  };



  const handleDeleteTeam = (id:number) => {
    setCurrentTeamId(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteTeam = async () => {
    if (!currentTeamId) return;
    setDeleting(true);
    try {
      await TimService.deleteTeam(currentTeamId);
      fetchTeams(selectedGroupId!);
    } catch (error) {
      console.error('Failed to delete team:', error);
      setShowDeleteError(true);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <IonPage>
      <IonAlert
      isOpen={showDeleteConfirm}
      onDidDismiss={() => setShowDeleteConfirm(false)}
      header={'Potvrda'}
      message={'Da li ste sigurni da želite da obrišete tim?'}
      buttons={[
        {
          text: 'Odustani',
          role: 'cancel',
          handler: () => setShowDeleteConfirm(false)
        },
        {
          text: 'Obriši',
          handler: () => confirmDeleteTeam()
        }
      ]}
    />
     <IonAlert
      isOpen={showTeamError}
      onDidDismiss={() => setShowTeamError(false)}
      header={'Error'}
      message={teamErrorMessage}
      buttons={['OK']}
    />
    <IonAlert
      isOpen={showDeleteError}
      onDidDismiss={() => setShowDeleteError(false)}
      header={'Greška'}
      message={'Došlo je do greške pri brisanju tima, proverite da li postoji utakmica koju ovaj tim igra.'}
      buttons={['OK']}
    />
    <IonLoading
      isOpen={deleting}
      message={'Brisanje tima...'}
    />
    <IonContent className="center-content">
      {showScheduleComponent ? (
        selectedGroupId !== null && (
          <ScheduleMatchComponent
            teams={teams}
            onMatchScheduled={toggleScheduleView}
            selectedGroupId={selectedGroupId}
            onBack={toggleScheduleView}  
          />
          
        )
        
      ) : (
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol size="10">
              <IonItem>
                <IonInput
                  value={groupName}
                  placeholder="Ime Grupe"
                  onIonChange={(e) => setGroupName(e.detail.value!)}
                />
              </IonItem>
              <IonButton
                expand="block"
                onClick={handleCreateGroup}
                className="small-button"
              >
                Kreiraj Grupu
              </IonButton>
            </IonCol>
          </IonRow>
          <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Greška'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header={'Potvrda'}
          message={'Da li ste sigurni da želite da kreirate grupu?'}
          buttons={[
            {
              text: 'Ne',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Da',
              handler: () => {
                confirmCreateGroup();
              }
            }
          ]}
        />

            <IonRow className="ion-justify-content-center ion-align-items-center">
            {groups.map((group) => (
              <IonCol size="auto" key={group.id}>
                <IonButton
                  fill={selectedGroupId === group.id ? "solid" : "outline"}
                  onClick={() => handleGroupSelect(group.id)}
                  style={{
                    '--background': selectedGroupId === group.id ? '#6200ea' : '#f0f0f0', // Background color
                    '--color': selectedGroupId === group.id ? '#ffffff' : '#000000', // Text color
                    '--border-color': selectedGroupId === group.id ? '#6200ea' : '#000000' // Border color for outline buttons
                  }}
                >
                  {group.imeGrupe}
                </IonButton>
              </IonCol>
            ))}
          </IonRow>

          {selectedGroupId && (
            
            <>
            {teams.length < 4 && (
  <IonGrid>
    <IonRow
    className="ion-justify-content-center ion-align-items-center">
      <IonCol size="10" className="ion-text-center">
        <IonItem>
          <IonInput
            value={teamName}
            placeholder="Ime Tima"
            onIonChange={(e) => setTeamName(e.detail.value!)}
          />
        </IonItem>
        <IonButton
          expand="block"
          onClick={handleCreateTeam}
          className="small-button"
        >
          Kreiraj Tim
        </IonButton>
      </IonCol>
    </IonRow>
  </IonGrid>
)}
              {/* <div style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div className="existing-content"> */}
              <div className="scrollable-container ion-justify-content-center ion-align-items-center">
                <div className="scrollable-inner ion-justify-content-center ion-align-items-center">
                  <IonCard className="ion-justify-content-center ion-align-items-center">
                    <IonCardHeader>
                      <IonCardTitle>Timovi</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        <IonRow>
                          <IonCol className="scrollable-ion-col">Ime Tima</IonCol>
                          <IonCol className="scrollable-ion-col">Pobeda</IonCol>
                          <IonCol className="scrollable-ion-col">Nereseno</IonCol>
                          <IonCol className="scrollable-ion-col">Poraz</IonCol>
                          <IonCol className="scrollable-ion-col">Golova Dato</IonCol>
                          <IonCol className="scrollable-ion-col">Golova Primljeno</IonCol>
                          <IonCol className="scrollable-ion-col">Poena</IonCol>
                          <IonCol className="scrollable-ion-col">Akcije</IonCol>
                        </IonRow>
                        {teams.map((team) => (
                          <IonRow key={team.id}>
                            <IonCol className="scrollable-ion-col">{team.imeTima}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojPobeda}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojNeresenih}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojPoraza}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojDatihGolova}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojPrimljenihGolova}</IonCol>
                            <IonCol className="scrollable-ion-col">{team.brojPoena}</IonCol>
                            <IonCol className="scrollable-ion-col">
          <IonButton color="danger" onClick={() => handleDeleteTeam(team.id)}>
            Obriši Tim
          </IonButton>
        </IonCol>
                          </IonRow>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </div>
              </div>
              {/* </div>
              </div> */}

              

<IonGrid>
<IonRow className="ion-justify-content-center ion-align-items-center">
    <IonCol size="7">
      <IonButton
        expand="block"
        onClick={() => setShowScheduleComponent(true)}
        className="small-button"
        
      >
        Pregled Utakmica
      </IonButton>
    </IonCol>
  </IonRow>
</IonGrid>
            </>
          )}
        </IonGrid>
      )}
       <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Obaveštenje'}
          message={alertMessage}
          buttons={['OK']}
        />
    </IonContent>
  </IonPage>
);
} 


export default GrupaKomponenta;
