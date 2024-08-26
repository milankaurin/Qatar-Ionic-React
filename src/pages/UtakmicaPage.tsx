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
  IonPage
} from '@ionic/react';
import StadionService from '../Api/StadionService';
import UtakmicaService from '../Api/UtakmicaService';
import axios, { AxiosError } from 'axios'; 

