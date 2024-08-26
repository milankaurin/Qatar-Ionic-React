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
} from '@ionic/react';
import GrupaService from '../Api/GrupaService';
import TimService from '../Api/TimService';
import UtakmicaService from '../Api/UtakmicaService';
import StadionService from '../Api/StadionService';
import ScheduleMatchComponent from './UtakmicaKomponenta';
import { useHistory } from 'react-router-dom';

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
    try {
      const newGroup = await GrupaService.createGroup(groupName);
      setGroups(prevGroups => [...prevGroups, newGroup]);
      setGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
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
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  return (
    <IonPage>
      <IonContent>
        {showScheduleComponent ? (
          selectedGroupId !== null && (
            <ScheduleMatchComponent
              teams={teams}
              onMatchScheduled={() => {
                setShowScheduleComponent(false); // Hide the component after scheduling a match
              }}
              selectedGroupId={selectedGroupId}
            />
          )
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonInput
                    value={groupName}
                    placeholder="Ime Grupe"
                    onIonChange={e => setGroupName(e.detail.value!)}
                  />
                </IonItem>
                <IonButton expand="block" onClick={handleCreateGroup}>
                  Kreiraj Grupu
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow>
              {groups.map(group => (
                <IonCol size="auto" key={group.id}>
                  <IonButton
                    fill={selectedGroupId === group.id ? "solid" : "outline"}
                    onClick={() => handleGroupSelect(group.id)}
                  >
                    {group.imeGrupe}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>

            {selectedGroupId && (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Timovi</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonRow>
                        <IonCol>Ime Tima</IonCol>
                        <IonCol>Pobeda</IonCol>
                        <IonCol>Nereseno</IonCol>
                        <IonCol>Poraz</IonCol>
                        <IonCol>Golova Dato</IonCol>
                        <IonCol>Golova Primljeno</IonCol>
                        <IonCol>Poena</IonCol>
                      </IonRow>
                      {teams.map(team => (
                        <IonRow key={team.id}>
                          <IonCol>{team.imeTima}</IonCol>
                          <IonCol>{team.brojPobeda}</IonCol>
                          <IonCol>{team.brojNeresenih}</IonCol>
                          <IonCol>{team.brojPoraza}</IonCol>
                          <IonCol>{team.brojDatihGolova}</IonCol>
                          <IonCol>{team.brojPrimljenihGolova}</IonCol>
                          <IonCol>{team.brojPoena}</IonCol>
                        </IonRow>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {teams.length < 4 && (
                  <IonItem>
                    <IonInput
                      value={teamName}
                      placeholder="Ime Tima"
                      onIonChange={e => setTeamName(e.detail.value!)}
                    />
                    <IonButton expand="block" onClick={handleCreateTeam}>
                      Kreiraj Tim
                    </IonButton>
                  </IonItem>
                )}

                <IonButton onClick={() => setShowScheduleComponent(true)}>Schedule Match</IonButton>
              </>
            )}
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GrupaKomponenta;
