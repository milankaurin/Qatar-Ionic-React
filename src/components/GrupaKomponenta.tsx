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
  IonLabel,
  IonModal,
  IonAlert,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import GrupaService from '../Api/GrupaService';
import TimService from '../Api/TimService';
import UtakmicaService from '../Api/UtakmicaService';
import StadionService from '../Api/StadionService';
import ScheduleMatchComponent from './UtakmicaKomponenta';

interface GrupaKomponentaProps {
  onGroupSelect: (groupId: number) => Promise<void>;
}

const GrupaKomponenta: React.FC<GrupaKomponentaProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

  const handleGroupSelectInternal = async (groupId: number) => {
    setSelectedGroupId(groupId);
    await onGroupSelect(groupId); // Call the prop function to handle the group selection
  };

  interface Match {
    id: number;
    tim1Id: number;
    tim2Id: number;
    vremePocetka: string;
    stadionId?: number | null;
    predato?: boolean;
    tim1Golovi?: number | null;
    tim2Golovi?: number | null;
  }

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

  const handleOpenDialog = (groupId: number) => {
    setOpenDialog(true);
    setGroupToDelete(groupId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

/*   const handleDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        await deleteAllMatchesInGroup(groupToDelete);
        await deleteAllTeamsInGroup(groupToDelete);
        await GrupaService.deleteGroup(groupToDelete);
        alert("Grupa i sve povezane entitete su uspešno obrisane!");
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete group and its entities:', error);
        alert("Došlo je do greške pri brisanju grupe i povezanih entiteta.");
      }
    }
    handleCloseDialog();
  };

  const deleteAllMatchesInGroup = async (groupId: number) => {
    const response = await UtakmicaService.getMatchesByGroupId(groupId);
    const matches = response.data; // Access the data property, which contains the array of matches
  
    for (let match of matches) {
      await UtakmicaService.deleteMatch(match.id);
    }
  }; */
  

 /*  const deleteAllTeamsInGroup = async (groupId: number) => {
    const teams = await TimService.getTeamsByGroupId(groupId);
    for (let team of teams) {
      await TimService.deleteTeamsByGroupId(team.id);
    }
  }; */

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
    await fetchMatches(groupId);
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
  

  const fetchMatches = async (groupId: number) => {
    try {
      const response = await UtakmicaService.getMatchesByGroupId(groupId);
      console.log(response); 
      const matches: Match[] = response.data;
  
      const teamAndStadiumData = await Promise.all(
        matches.map(async (match: Match) => {
          const team1 = await TimService.getTeamById(match.tim1Id);
          const team2 = await TimService.getTeamById(match.tim2Id);
  
          let stadiumName = 'Undefined';
          if (match.stadionId) {
            const stadium = await StadionService.getStadiumById(match.stadionId);
            stadiumName = stadium.imeStadiona;
          }
  
          return {
            ...match,
            team1Name:team1.imeTima,
            team2Name: team2.imeTima,
            stadiumName: stadiumName,
          };
        })
      );
  
      setMatches(teamAndStadiumData);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
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

  const handleSetResult = async (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      alert("Utakmica nije pronađena.");
      return;
    }
  
    const matchStartTime = new Date(match.vremePocetka);
    if (matchStartTime > new Date()) {
      alert("Nije moguće postaviti rezultat pre zvaničnog vremena početka utakmice.");
      return;
    }
  
    const tim1Golovi = prompt("Unesite broj golova koje je postigao Tim 1:");
    const tim2Golovi = prompt("Unesite broj golova koje je postigao Tim 2:");
  
    if (tim1Golovi !== null && tim2Golovi !== null && isValidScore(tim1Golovi) && isValidScore(tim2Golovi)) {
      try {
        await UtakmicaService.setMatchResult(matchId, parseInt(tim1Golovi), parseInt(tim2Golovi));
        fetchMatches(selectedGroupId!);
        fetchTeams(selectedGroupId!);
      } catch (error) {
        console.error('Greška pri postavljanju rezultata utakmice:', error);
        alert("Došlo je do greške pri postavljanju rezultata.");
      }
    } else {
      alert("Unesite validne celobrojne vrednosti koje su veće ili jednake nuli za golove.");
    }
  };
  
  const isValidScore = (score: string): boolean => {
    const scoreNum = Number(score);
    return Number.isInteger(scoreNum) && scoreNum >= 0;
  };
  
  const handleDeleteMatch = async (id: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete utakmicu?")) {
      try {
        await UtakmicaService.deleteMatch(id);
        alert("Utakmica je uspešno obrisana!");
        fetchMatches(selectedGroupId!);
      } catch (error) {
        console.error('Failed to delete match:', error);
        alert("Došlo je do greške pri brisanju utakmice.");
      }
    }
  };

  return (
    <IonPage>
      
      <IonContent>
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

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Utakmice</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {matches.map(match => (
                    <IonRow key={match.id}>
                      <IonCol>{match.team1Name}</IonCol>
                      <IonCol>{match.team2Name}</IonCol>
                      <IonCol>{new Date(match.vremePocetka).toLocaleString()}</IonCol>
                      <IonCol>{match.predato ? 'Predato' : `${match.tim1Golovi} - ${match.tim2Golovi}`}</IonCol>
                      <IonCol>{match.stadiumName}</IonCol>
                      <IonCol>
                        {match.tim1Golovi === null && !match.predato && (
                          <IonButton color="danger" onClick={() => handleDeleteMatch(match.id)}>
                            Obriši Utakmicu
                          </IonButton>
                        )}
                        {match.tim1Golovi === null && !match.predato && (
                          <IonButton color="primary" onClick={() => handleSetResult(match.id)}>
                            Unesi rezultat
                          </IonButton>
                        )}
                      </IonCol>
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

          <ScheduleMatchComponent
          teams={teams}
          onMatchScheduled={() => {
          fetchMatches(selectedGroupId);
          fetchTeams(selectedGroupId);
              }} 
            /> 
          </>
        )}
      </IonGrid>
    </IonContent>
    </IonPage>
  );
  
  
  
};

export default GrupaKomponenta;
