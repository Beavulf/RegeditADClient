// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import useWebSocket from 'react-use-websocket';
// import dayjs from 'dayjs';
// import 'dayjs/locale/ru';
// dayjs.locale('ru');

// const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
// const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

// // Массив имён коллекций, для которых будем создавать отдельное состояние
// const LOAD_COLLECTION = [
//   'Users', 'Otdel', 'Doljnost', 'Sotrudnik', 'Pdoka', 'Priem', 
//   'SbrosAD', 'Subject', 'Company', 'Prodlenie', 'Contract', 'Access', 'Naznachenie', 'Perevod', 'VPerevod', 'Familia', 'Uvolnenie',
//   'Zapros', 'Svodka', 'Revizor', 'ChdTI', 'Aipsin', 'ADTool', 'Stajirovka', 'ZaprosSPrava', 'PravaOtdel'
// ];

// // Создаем контекст
// const WebSocketContext = createContext();
// const WebSocketReadyStateContext = createContext();
// const WebSocketLastMessageContext = createContext();
// const UsersContext = createContext();
// const OtdelContext = createContext();
// const DoljnostContext = createContext();
// const SotrudnikContext = createContext();
// const PdokaContext = createContext();
// const PriemContext = createContext();
// const SbrosADContext = createContext();
// const SubjectContext = createContext();
// const CompanyContext = createContext();
// const ProdlenieContext = createContext();
// const ContractContext = createContext();
// const AccessContext = createContext();
// const ClientsContext = createContext();
// const NaznachenieContext = createContext();
// const PerevodContext = createContext();
// const VPerevodContext = createContext();
// const FamiliaContext = createContext();
// const UvolnenieContext = createContext();
// const ZaprosContext = createContext();
// const SvodkaContext = createContext();
// const RevizorContext = createContext();
// const ChdtiContext = createContext();
// const AipsinContext = createContext();
// const AdtoolContext = createContext();
// const StajirovkaContext = createContext();
// const ZaprosSPravaContext = createContext();
// const PravaOtdelContext = createContext();


// // Создаем воркер для обработки сообщений
// const worker = new Worker(new URL('./wsWorker.js', import.meta.url));

// export const WebSocketProvider = ({ children }) => {
//   // Создаем отдельные состояния для каждой коллекции
//   const [users, setUsers] = useState([]);
//   const [otdel, setOtdel] = useState([]);
//   const [doljnost, setDoljnost] = useState([]);
//   const [sotrudnik, setSotrudnik] = useState([]);
//   const [pdoka, setPdoka] = useState([]);
//   const [priem, setPriem] = useState([]);
//   const [sbrosAD, setSbrosAD] = useState([]);
//   const [subject, setSubject] = useState([]);
//   const [company, setCompany] = useState([]);
//   const [prodlenie, setProdlenie] = useState([]);
//   const [contract, setContract] = useState([]);
//   const [access, setAccess] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [naznachenie, setNaznachenie] = useState([]);
//   const [perevod, setPerevod] = useState([]);
//   const [vperevod, setVPerevod] = useState([]);
//   const [familia, setFamilia] = useState([]);
//   const [uvolnenie, setUvolnenie] = useState([]);
//   const [zapros, setZapros] = useState([]);
//   const [svodka, setSvodka] = useState([]);
//   const [revizor, setRevizor] = useState([]);
//   const [chdti, setChdti] = useState([]);
//   const [aipsin, setAipsin] = useState([]);
//   const [adtool, setAdtool] = useState([]);
//   const [stajirovka, setStajirovka] = useState([]);
//   const [zaprosSPrava, setZaprosSPrava] = useState([]);
//   const [pravaOtdel, setPravaOtdel] = useState([]);
  

//   // Общий state загрузки
//   const [loading, setLoading] = useState(true);

//   // Функция для сопоставления названия коллекции с соответствующим сеттером
//   const updateCollection = useCallback((collection, newData) => {
//     switch (collection) {
//       case 'Users':
//         setUsers(newData);
//         break;
//       case 'Otdel':
//         setOtdel(newData);
//         break;
//       case 'Doljnost':
//         setDoljnost(newData);
//         break;
//       case 'Sotrudnik':
//         setSotrudnik(newData);
//         break;
//       case 'Pdoka':
//         setPdoka(newData);
//         break;
//       case 'Priem':
//         setPriem(newData);
//         break;
//       case 'SbrosAD':
//         setSbrosAD(newData);
//         break;
//       case 'Subject':
//         setSubject(newData);
//         break;
//       case 'Company':
//         setCompany(newData);
//         break;
//       case 'Prodlenie':
//         setProdlenie(newData);
//         break;
//       case 'Contract':
//         setContract(newData);
//         break;
//       case 'Access':
//         setAccess(newData);
//         break;
//       case 'Clients':
//         setClients(newData);
//       break;
//       case 'Naznachenie':
//         setNaznachenie(newData);
//       break;
//       case 'Perevod':
//         setPerevod(newData);
//       break;
//       case 'VPerevod':
//         setVPerevod(newData);
//       break;
//       case 'Familia':
//         setFamilia(newData);
//       break;
//       case 'Uvolnenie':
//         setUvolnenie(newData);
//       break;
//       case 'Zapros':
//         setZapros(newData);
//       break;
//       case 'Svodka':
//         setSvodka(newData);
//       break;
//       case 'Revizor':
//         setRevizor(newData);
//       break;
//       case 'ChdTI':
//         setChdti(newData);
//       break;   
//       case 'Aipsin':
//         setAipsin(newData);
//       break;
//       case 'ADTool':
//         setAdtool(newData);
//       break;
//       case 'Stajirovka':
//         setStajirovka(newData);
//       break;
//       case 'ZaprosSPrava':
//         setZaprosSPrava(newData);
//       break;
//       case 'PravaOtdel':
//         setPravaOtdel(newData);
//       break;
//       default:
//         break;
//     }
//   }, []);

//   // Запускаем веб-сокет соединение
//   const { sendJsonMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket(
//     `ws://${SERVER_ADDRESS}:${SERVER_PORT}`,
//     {
//       shouldReconnect: () => true,
//       reconnectInterval: 3000,
//       reconnectAttempts: 5,
//       options: { withCredentials: true },
//       onOpen: async () => {
//         console.log('WebSocket connected, loading data...');
//         setLoading(true);
        
//         try {
//           await Promise.allSettled(LOAD_COLLECTION.map(loadData))
//             .then(results => {
//               const errors = results
//                 .filter(({ status }) => status === 'rejected')
//                 .map(({ reason }) => reason);
                
//               if (errors.length) {
//                 console.error('Errors loading collections:', errors);
//               }
//             });

//           sendJsonMessage({ type: 'getAllClientsIp' });
//         } catch (error) {
//           console.error('Critical error loading initial data:', error);
//         } finally {
//           setLoading(false);
//         }
//       },
//       onError: console.error
//     }
//   );

//   // Функция запроса данных по коллекции
//   const loadData = useCallback(
//     async (collection) => {
//       // получение последних 7 дней
//       const threeDaysAgo = dayjs().subtract(7, 'day').toISOString();
//       const message = {
//         type: 'getCollectionMongoose',
//         data: {
//           collection: collection,
//           // если получаем данные из таблицы Дока, то получаем только за последние 7 дней
//           filter: collection === 'Pdoka' ? { data_dob: { $gte: threeDaysAgo } } : {}
//         }
//       };
//       try {
//         sendJsonMessage(message);
//       } catch (error) {
//         console.error(`Ошибка отправки сообщения при loadData - ${collection}:`, error);
//       }
//     },
//     [sendJsonMessage]
//   );


//   useEffect(() => {
//     worker.onmessage = (e) => {
//       const { type, data: newData } = e.data;
//       if (type === 'DATA_LOADED' || type === 'DATA_UPDATED') {
//         // Для каждого ключа (коллекции) в новом объекте вызываем соответствующий сеттер
//         Object.keys(newData).forEach((collection) => {
//           updateCollection(collection, newData[collection]);          
//         });
//       }
//       if (e.data.clients){
//         sendJsonMessage({
//           type: 'getAllClientsIp'
//         });
//       }
//       if (e.data.type === 'LOAD_SOTRUDNIK') {
//         sendJsonMessage({
//           type: 'getCollectionMongoose',
//           data: { collection: 'Sotrudnik' }
//         });
//       }
//     };
//   }, [sendJsonMessage, updateCollection]);

//   // Передача сообщений из WebSocket в воркер
//   useEffect(() => {
//     if (lastMessage) {
//       try {
//         const serverMessage = JSON.parse(lastMessage.data);
//         worker.postMessage({ type: 'PROCESS_MESSAGE', message: serverMessage });
//       } catch (error) {
//         console.error('Error parsing WebSocket message', error);
//       }
//     }
//   }, [lastMessage]); 

//   const readyStateValue = useMemo(() => readyState, [readyState]);
//   const lastJsonMessageValue = useMemo(() => lastJsonMessage, [lastJsonMessage]);
//   const usersValue = useMemo(() => users, [users]);
//   const otdelValue = useMemo(() => otdel, [otdel]);
//   const doljnostValue = useMemo(() => doljnost, [doljnost]);
//   const sotrudnikValue = useMemo(() => sotrudnik, [sotrudnik]);
//   const pdokaValue = useMemo(() => pdoka, [pdoka]);
//   const priemValue = useMemo(() => priem, [priem]);
//   const sbrosADValue = useMemo(() => sbrosAD, [sbrosAD]);
//   const subjectValue = useMemo(() => subject, [subject]);
//   const companyValue = useMemo(() => company, [company]);
//   const prodlenieValue = useMemo(() => prodlenie, [prodlenie]);
//   const contractValue = useMemo(() => contract, [contract]);
//   const accessValue = useMemo(() => access, [access]);
//   const clientsValue = useMemo(() => clients, [clients]);
//   const naznachenieValue = useMemo(() => naznachenie, [naznachenie]);
//   const perevodValue = useMemo(() => perevod, [perevod]);
//   const vperevodValue = useMemo(() => vperevod, [vperevod]);
//   const familiaValue = useMemo(() => familia, [familia]);
//   const uvolnenieValue = useMemo(() => uvolnenie, [uvolnenie]);
//   const zaprosValue = useMemo(() => zapros, [zapros]);
//   const svodkaValue = useMemo(() => svodka, [svodka]);
//   const revizorValue = useMemo(() => revizor, [revizor]);
//   const chdtiValue = useMemo(() => chdti, [chdti]);
//   const aipsinValue = useMemo(() => aipsin, [aipsin]);
//   const adtoolValue = useMemo(() => adtool, [adtool]);
//   const stajirovkaValue = useMemo(() => stajirovka, [stajirovka]);
//   const zaprosSPravaValue = useMemo(() => zaprosSPrava, [zaprosSPrava]);
//   const pravaOtdelValue = useMemo(() => pravaOtdel, [pravaOtdel]);

//   return (
//     <WebSocketContext.Provider value={{ sendJsonMessage, readyState, loading }}>
//       <WebSocketLastMessageContext.Provider value={lastJsonMessageValue}>
//       <WebSocketReadyStateContext.Provider value={readyStateValue}>
//       <UsersContext.Provider value={usersValue}>
//         <OtdelContext.Provider value={otdelValue}>
//           <DoljnostContext.Provider value={doljnostValue}>
//             <SotrudnikContext.Provider value={sotrudnikValue}>
//               <PdokaContext.Provider value={pdokaValue}>
//                 <PriemContext.Provider value={priemValue}>
//                   <SbrosADContext.Provider value={sbrosADValue}>
//                     <SubjectContext.Provider value={subjectValue}>
//                       <CompanyContext.Provider value={companyValue}>
//                         <ProdlenieContext.Provider value={prodlenieValue}>
//                           <ContractContext.Provider value={contractValue}>
//                             <AccessContext.Provider value={accessValue}>
//                               <ClientsContext.Provider value={clientsValue}>
//                                 <NaznachenieContext.Provider value={naznachenieValue}>
//                                   <PerevodContext.Provider value={perevodValue}>
//                                      <VPerevodContext.Provider value={vperevodValue}>
//                                        <FamiliaContext.Provider value={familiaValue}>
//                                         <UvolnenieContext.Provider value={uvolnenieValue}>
//                                           <ZaprosContext.Provider value={zaprosValue}>
//                                             <SvodkaContext.Provider value={svodkaValue}>
//                                               <RevizorContext.Provider value={revizorValue}>
//                                                 <ChdtiContext.Provider value={chdtiValue}>
//                                                   <AipsinContext.Provider value={aipsinValue}>
//                                                     <AdtoolContext.Provider value={adtoolValue}>
//                                                       <StajirovkaContext.Provider value={stajirovkaValue}>
//                                                         <ZaprosSPravaContext.Provider value={zaprosSPravaValue}>
//                                                           <PravaOtdelContext.Provider value={pravaOtdelValue}>
//                                                             {children}
//                                                           </PravaOtdelContext.Provider>
//                                                         </ZaprosSPravaContext.Provider>
//                                                       </StajirovkaContext.Provider>
//                                                     </AdtoolContext.Provider>
//                                                   </AipsinContext.Provider>                                                  
//                                                 </ChdtiContext.Provider>
//                                               </RevizorContext.Provider>
//                                             </SvodkaContext.Provider>
//                                            </ZaprosContext.Provider>
//                                         </UvolnenieContext.Provider>
//                                         </FamiliaContext.Provider>
//                                      </VPerevodContext.Provider>
//                                   </PerevodContext.Provider>
//                                 </NaznachenieContext.Provider>
//                               </ClientsContext.Provider>
//                             </AccessContext.Provider>
//                           </ContractContext.Provider>
//                         </ProdlenieContext.Provider>
//                       </CompanyContext.Provider>
//                     </SubjectContext.Provider>
//                   </SbrosADContext.Provider>
//                 </PriemContext.Provider>
//               </PdokaContext.Provider>
//             </SotrudnikContext.Provider>
//           </DoljnostContext.Provider>
//         </OtdelContext.Provider>
//       </UsersContext.Provider>
//       </WebSocketReadyStateContext.Provider>
//       </WebSocketLastMessageContext.Provider>
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocketContext = () => useContext(WebSocketContext);
// export const useReadyState = () => useContext(WebSocketReadyStateContext);
// export const useLastMessage = () => useContext(WebSocketLastMessageContext);
// export const useUsers = () => useContext(UsersContext);
// export const useOtdel = () => useContext(OtdelContext);
// export const useDoljnost = () => useContext(DoljnostContext);
// export const useSotrudnik = () => useContext(SotrudnikContext);
// export const usePdoka = () => useContext(PdokaContext);
// export const usePriem = () => useContext(PriemContext);
// export const useSbrosAD = () => useContext(SbrosADContext);
// export const useSubject = () => useContext(SubjectContext);
// export const useCompany = () => useContext(CompanyContext);
// export const useProdlenie = () => useContext(ProdlenieContext);
// export const useContract = () => useContext(ContractContext);
// export const useAccess = () => useContext(AccessContext);
// export const useClients = () => useContext(ClientsContext);
// export const useNaznachenie = () => useContext(NaznachenieContext);
// export const usePerevod = () => useContext(PerevodContext);
// export const useVPerevod = () => useContext(VPerevodContext);
// export const useFamilia = () => useContext(FamiliaContext);
// export const useUvolnenie = () => useContext(UvolnenieContext);
// export const useZapros = () => useContext(ZaprosContext);
// export const useSvodka = () => useContext(SvodkaContext);
// export const useRevizor = () => useContext(RevizorContext);
// export const useChdti = () => useContext(ChdtiContext);
// export const useAipsin = () => useContext(AipsinContext);
// export const useAdtool = () => useContext(AdtoolContext);
// export const useStajirovka = () => useContext(StajirovkaContext);
// export const useZaprosSPrava = () => useContext(ZaprosSPravaContext);
// export const usePravaOtdel = () => useContext(PravaOtdelContext);

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import useWebSocket from 'react-use-websocket';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;

const LOAD_COLLECTION = [
  'Users', 'Otdel', 'Doljnost', 'Sotrudnik', 'Pdoka', 'Priem',
  'SbrosAD', 'Subject', 'Company', 'Prodlenie', 'Contract', 'Access', 'Naznachenie', 'Perevod', 'VPerevod', 'Familia', 'Uvolnenie',
  'Zapros', 'Svodka', 'Revizor', 'ChdTI', 'Aipsin', 'ADTool', 'Stajirovka', 'ZaprosSPrava', 'PravaOtdel', 'Clients'
];

// Создаем контексты
const WebSocketContext = createContext();
const WebSocketReadyStateContext = createContext();
const WebSocketLastMessageContext = createContext();
const CollectionsContext = createContext();

const initialState = Object.fromEntries(LOAD_COLLECTION.map((name) => [name, []]));

function collectionsReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_MANY':
      return { ...state, ...action.data };
    case 'UPDATE_COLLECTION':
      return { ...state, [action.collection]: action.data };
    default:
      return state;
  }
}

const worker = new Worker(new URL('./wsWorker.js', import.meta.url));

export const WebSocketProvider = ({ children }) => {
  const [collections, dispatch] = useReducer(collectionsReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [loadedCollections, setLoadedCollections] = useState(new Set());

  const { sendJsonMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket(
    `ws://${SERVER_ADDRESS}:${SERVER_PORT}`,
    {
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 5,
      options: { withCredentials: true },
      onOpen: async () => {
        setLoading(true);
        setLoadedCollections(new Set());
        try {
          await Promise.allSettled(LOAD_COLLECTION.map(loadData)).then((results) => {
            const errors = results.filter(({ status }) => status === 'rejected').map(({ reason }) => reason);
            if (errors.length) {
              console.error('Errors loading collections:', errors);
            }
          });
          sendJsonMessage({ type: 'getAllClientsIp' });
        } catch (error) {
          console.error('Critical error loading initial data:', error);
        }
      },
      onError: console.error,
    }
  );

  // Функция запроса данных по коллекции
  const loadData = useCallback(
    async (collection) => {
      const sevenDaysAgo = dayjs().subtract(7, 'day').toISOString();
      const message = {
        type: 'getCollectionMongoose',
        data: {
          collection: collection,
          filter: collection === 'Pdoka' ? { data_dob: { $gte: sevenDaysAgo } } : {},
        },
      };
      try {
        sendJsonMessage(message);
      } catch (error) {
        console.error(`Ошибка отправки сообщения при loadData - ${collection}:`, error);
      }
    },
    [sendJsonMessage]
  );

  useEffect(() => {
    worker.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'DATA_LOADED' || type === 'DATA_UPDATED') {
        dispatch({ type: 'UPDATE_MANY', data });
        setLoadedCollections(prev => {
          const updated = new Set(prev);
          Object.keys(data).forEach(col => updated.add(col));
          return updated;
        });
      }
      if (e.data.clients) {
        sendJsonMessage({ type: 'getAllClientsIp' });
      }
      if (e.data.type === 'LOAD_SOTRUDNIK') {
        sendJsonMessage({
          type: 'getCollectionMongoose',
          data: { collection: 'Sotrudnik' },
        });
      }
    };
  }, [sendJsonMessage]);

  useEffect(() => {
    if (loadedCollections.size >= LOAD_COLLECTION.length) {
      setLoading(false);
    }
  }, [loadedCollections]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const serverMessage = JSON.parse(lastMessage.data);
        worker.postMessage({ type: 'PROCESS_MESSAGE', message: serverMessage });
      } catch (error) {
        console.error('Error parsing WebSocket message', error);
      }
    }
  }, [lastMessage]);

  const readyStateValue = useMemo(() => readyState, [readyState]);
  const lastJsonMessageValue = useMemo(() => lastJsonMessage, [lastJsonMessage]);
  const collectionsValue = useMemo(() => collections, [collections]);

  return (
    <WebSocketContext.Provider value={{ sendJsonMessage, readyState, loading }}>
      <WebSocketLastMessageContext.Provider value={lastJsonMessageValue}>
        <WebSocketReadyStateContext.Provider value={readyStateValue}>
          <CollectionsContext.Provider value={collectionsValue}>
            {children}
          </CollectionsContext.Provider>
        </WebSocketReadyStateContext.Provider>
      </WebSocketLastMessageContext.Provider>
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useWebSocketContext = () => useContext(WebSocketContext);
export const useReadyState = () => useContext(WebSocketReadyStateContext);
export const useLastMessage = () => useContext(WebSocketLastMessageContext);
export const useCollections = () => useContext(CollectionsContext);

export const useUsers = () => useCollections().Users;
export const useOtdel = () => useCollections().Otdel;
export const useDoljnost = () => useCollections().Doljnost;
export const useSotrudnik = () => useCollections().Sotrudnik;
export const usePdoka = () => useCollections().Pdoka;
export const usePriem = () => useCollections().Priem;
export const useSbrosAD = () => useCollections().SbrosAD;
export const useSubject = () => useCollections().Subject;
export const useCompany = () => useCollections().Company;
export const useProdlenie = () => useCollections().Prodlenie;
export const useContract = () => useCollections().Contract;
export const useAccess = () => useCollections().Access;
export const useClients = () => useCollections().Clients;
export const useNaznachenie = () => useCollections().Naznachenie;
export const usePerevod = () => useCollections().Perevod;
export const useVPerevod = () => useCollections().VPerevod;
export const useFamilia = () => useCollections().Familia;
export const useUvolnenie = () => useCollections().Uvolnenie;
export const useZapros = () => useCollections().Zapros;
export const useSvodka = () => useCollections().Svodka;
export const useRevizor = () => useCollections().Revizor;
export const useChdti = () => useCollections().ChdTI;
export const useAipsin = () => useCollections().Aipsin;
export const useAdtool = () => useCollections().ADTool;
export const useStajirovka = () => useCollections().Stajirovka;
export const useZaprosSPrava = () => useCollections().ZaprosSPrava;
export const usePravaOtdel = () => useCollections().PravaOtdel;