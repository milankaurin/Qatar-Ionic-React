import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonRadioGroup,
  IonListHeader,
  IonRadio,
  IonItem,
  IonDatetime,
  IonPage,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonModal,
  IonAlert,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import StadionService from '../Api/StadionService';
import UtakmicaService from '../Api/UtakmicaService';
import TimService from '../Api/TimService';
// Define TypeScript interfaces for the props and state
interface Team {
  id: number;
  imeTima: string;
}

interface Stadium {
  id: number;
  imeStadiona: string;
}

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


interface Props {
  teams: Team[];
  onMatchScheduled: () => void;
  selectedGroupId: number; 
}

const ScheduleMatchComponent: React.FC<Props> = ({ teams, onMatchScheduled, selectedGroupId }) => {
  console.log("Rendering ScheduleMatchComponent", {teams});
  const [matchDate, setMatchDate] = useState<string | null>(null);
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [matchOutcome, setMatchOutcome] = useState<string>('played');
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<string>('');
  const [availableTeamsForTeam1, setAvailableTeamsForTeam1] = useState<Team[]>([]);
  const [availableTeamsForTeam2, setAvailableTeamsForTeam2] = useState<Team[]>([]);
  const [matches, setMatches] = useState<any[]>([]);



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

  useEffect(() => {
    fetchMatches(selectedGroupId);
  }, []);

  useEffect(() => {
    async function fetchStadiums() {
      try {
        const data: Stadium[] = await StadionService.getAllStadiums();
        setStadiums(data);
      } catch (error) {
        console.error('Failed to fetch stadiums:', error);
      }
    }
    fetchStadiums();
  }, []);

  useEffect(() => {
    if (teams.length) {
      if (selectedTeam1) {
        setAvailableTeamsForTeam2(teams.filter(team => team.id.toString() !== selectedTeam1));
      } else {
        setAvailableTeamsForTeam2(teams);
      }
      if (selectedTeam2) {
        setAvailableTeamsForTeam1(teams.filter(team => team.id.toString() !== selectedTeam2));
      } else {
        setAvailableTeamsForTeam1(teams);
      }
    }
  }, [teams, selectedTeam1, selectedTeam2]);

  const handleMatchSchedule = async () => {
    const forfeitDate = new Date('2024-08-16T20:00:00');
    const isForfeit = matchOutcome !== 'played';
    const matchDetails = {
      id: 0,  // Assuming 'id' should be dynamically assigned usually
      tim1Id: parseInt(selectedTeam1),
      tim2Id: parseInt(selectedTeam2),
      vremePocetka: isForfeit ? forfeitDate.toISOString() : matchDate,
      tim1Golovi: isForfeit ? 0 : null,
      tim2Golovi: isForfeit ? 0 : null,
      stadionId: isForfeit ? null : parseInt(selectedStadium),
      predato: isForfeit,
      tim1Predao: matchOutcome === 'forfeit1',
      tim2Predao: matchOutcome === 'forfeit2'
    };

    try {
      await UtakmicaService.scheduleMatch(matchDetails);
      alert("Utakmica je uspešno zakazana!");
      resetForm();
      onMatchScheduled();
    } catch (error) {
      console.error('Failed to schedule the match:', error);
      alert("Došlo je do greške pri zakazivanju utakmice.");
    }
  };

  const handleSetResult = async (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      alert("Utakmica nije pronađena.");
      return;
    }
  }

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




  const resetForm = () => {
    setSelectedTeam1('');
    setSelectedTeam2('');
    setSelectedStadium('');
    setMatchDate(null);
    setMatchOutcome('played');
  };

  const handleDateChange = (event: CustomEvent) => {
    setMatchDate(event.detail.value as string);
};

// return (
//   <div>Test - Are teams available? {teams.length}</div>
// );

  return (
    <IonPage>
     
      <IonContent>
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

      
        <h3>Zakazivanje Utakmice</h3>
        <IonSelect value={selectedTeam1} placeholder="Odaberite Prvi Tim" onIonChange={e => setSelectedTeam1(e.detail.value)}>
          {availableTeamsForTeam1.map(team => (
            <IonSelectOption key={team.id} value={team.id.toString()}>{team.imeTima}</IonSelectOption>
          ))}
        </IonSelect>

        <IonSelect value={selectedTeam2} placeholder="Odaberite Drugi Tim" onIonChange={e => setSelectedTeam2(e.detail.value)}>
          {availableTeamsForTeam2.map(team => (
            <IonSelectOption key={team.id} value={team.id.toString()}>{team.imeTima}</IonSelectOption>
          ))}
        </IonSelect>

        <IonRadioGroup value={matchOutcome} onIonChange={e => setMatchOutcome(e.detail.value)}>
          <IonListHeader>
            <IonLabel>Rezultat Utakmice</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Utakmica se odigrava</IonLabel>
            <IonRadio slot="start" value="played" />
          </IonItem>
          <IonItem>
            <IonLabel>Tim 1 predao</IonLabel>
            <IonRadio slot="start" value="forfeit1" />
          </IonItem>
          <IonItem>
            <IonLabel>Tim 2 predao</IonLabel>
            <IonRadio slot="start" value="forfeit2" />
          </IonItem>
        </IonRadioGroup>

        {matchOutcome === 'played' && (
          <>
            <IonSelect value={selectedStadium} placeholder="Odaberite Stadion" onIonChange={e => setSelectedStadium(e.detail.value)}>
              {stadiums.map(stadium => (
                <IonSelectOption key={stadium.id} value={stadium.id.toString()}>{stadium.imeStadiona}</IonSelectOption>
              ))}
            </IonSelect>

            <IonDatetime
    value={matchDate}
    min="2020"
    max="2030"
    onIonChange={handleDateChange}
    presentation="date-time"  // Alternative to displayFormat for newer Ionic versions
/>

          </>
        )}

        <IonButton expand="block" onClick={handleMatchSchedule} style={{ marginTop: '20px' }}>
          Zakazite Utakmicu
        </IonButton>
        </IonContent>
    
     
      </IonPage>
  
  );
};

export default ScheduleMatchComponent;