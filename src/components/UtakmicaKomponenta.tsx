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
import './GrupaKomponenta.css';
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
  tim1Predao?: boolean;  // Add this
  tim2Predao?: boolean;  // And this
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
      console.log('Fetched matches from server:', response.data);
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
      console.log('Sending match details:', matchDetails); 
      await UtakmicaService.scheduleMatch(matchDetails);
      alert("Utakmica je uspešno zakazana!");
      fetchMatches(selectedGroupId);
      resetForm();
      onMatchScheduled();
    } catch (error) {
      console.error('Failed to schedule the match:', error);
      alert("Došlo je do greške pri zakazivanju utakmice.");
    }
  };

  const handleSetResult = async (matchId: number) => {
    const match = matches.find((m: Match) => m.id === matchId);
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
  
    // Provera da li su unosi validni celi brojevi veći ili jednaki nuli
    if (tim1Golovi !== null && tim2Golovi !== null && isValidScore(tim1Golovi) && isValidScore(tim2Golovi)) {
      try {
        await UtakmicaService.setMatchResult(matchId, parseInt(tim1Golovi), parseInt(tim2Golovi));
        fetchMatches(selectedGroupId);  // Osvežava podatke o utakmicama
           // Osvežava tabelu timova da odrazi promene u rezultatima
      } catch (error) {
        console.error('Greška pri postavljanju rezultata utakmice:', error);
        alert("Došlo je do greške pri postavljanju rezultata.");
      }
    } else {
      alert("Unesite validne celobrojne vrednosti koje su veće ili jednake nuli za golove.");
    }
  };
  
  // Function to check if the score is a valid non-negative integer
  function isValidScore(score: string | null): boolean {
    if (score === null) return false;  // Prompt can return null if canceled
    const scoreNum = Number(score);
    return Number.isInteger(scoreNum) && scoreNum >= 0;
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
       <div className="scrollable-container">
      <div className="scrollable-inner"> 
      <IonCard>
  <IonCardHeader>
    <IonCardTitle>Utakmice</IonCardTitle>
  </IonCardHeader>
  <IonCardContent>
    <IonList>
      <IonRow>
        <IonCol size="2"><strong>Tim 1</strong></IonCol>
        <IonCol size="2"><strong>Tim 2</strong></IonCol>
        <IonCol size="3"><strong>Vreme Početka</strong></IonCol>
        <IonCol size="2"><strong>Rezultat</strong></IonCol>
        <IonCol size="2"><strong>Stadion</strong></IonCol>
        <IonCol size="1"><strong>Akcije</strong></IonCol>
      </IonRow>
      {matches.map(match => (
        <IonRow key={match.id}>
          <IonCol size="2">{match.team1Name}</IonCol>
          <IonCol size="2">{match.team2Name}</IonCol>
          <IonCol size="3">{new Date(match.vremePocetka).toLocaleString()}</IonCol>
          <IonCol size="2">
            {match.predato ? (
              match.tim1Golovi === 0 && match.tim2Golovi > 0 ? "Tim 1 predao" : 
              match.tim2Golovi === 0 && match.tim1Golovi > 0 ? "Tim 2 predao" : 
              `${match.tim1Golovi} - ${match.tim2Golovi}`
            ) : (
              `${match.tim1Golovi} - ${match.tim2Golovi}`
            )}
          </IonCol>
          <IonCol size="2">{match.stadiumName}</IonCol>
          <IonCol size="1">
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
             </div>
            </div> 

      
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