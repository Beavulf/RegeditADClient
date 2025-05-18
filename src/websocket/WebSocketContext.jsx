// import { createContext, useContext, useState, useCallback } from 'react';
// import useWebSocket from 'react-use-websocket';
// import dayjs from 'dayjs';
// import 'dayjs/locale/ru'
// dayjs.locale('ru');

// // Создаем контекст для WebSocket
// const WebSocketContext = createContext();

// // Провайдер контекста, который оборачивает весь ваш компонент
// export const WebSocketProvider = ({ children, token }) => {
//   const [socketUrl] = useState(`ws://localhost:3000?token=${token}`); // URL WebSocket сервера
//   const [loading, setLoading] = useState(true);
//   //список загружаемых таблиц вначале
  // const loadCollection = [
  //   `Users`, `Otdel`, `Doljnost`, `Sotrudnik`, `Pdoka`, `Priem` ,`SbrosAD`, `Subject`, `Company`, `Prodlenie`, `Contract`, `Access`
  // ]
//   //хранение всех таблиц в переменной data
//   const [data, setData] = useState({
//     Users: [],
//     Otdel: [],
//     Doljnost: [],
//     Sotrudnik: [],
//     Pdoka: [],
//     Priem: [],
//     Sbrosad: [],
//     Subject: [],
//     Company: [],
//     Prodlenie: [],
//     Contract: [],
//     Access: [],
//     Clients: []
//   })
   

//   const { sendJsonMessage, lastJsonMessage, readyState, lastMessage, sendMessage } = useWebSocket(socketUrl, {
//     shouldReconnect: () => true,
//     reconnectInterval: 3000,
//     reconnectAttempts: 5,
//     onError: (error) => {
//       console.error('WebSocket error:', error);
//     },
// onOpen: async () => {
//   console.log('WebSocket connected, load DATA');
//   setLoading(true);
//   //подгру3ка таблиц при подключение к серверу
//   try {
//     await Promise.all(loadCollection.map(async (collection) => loadData(collection)));
//     sendJsonMessage({ type: `getAllClientsIp` });
//   } catch (error) {
//       console.error("Error loading initial data:", error);
//   }
//   finally{
//     setTimeout(()=> {setLoading(false)},1000)
//       // Устанавливаем состояние загрузки в false после загрузки всех данных или ошибки
//   }
// },
//     onClose: () => {
//       console.log('WebSocket disconnected');
//       setLoading(true);
//     },
//     onMessage: async (message) => {

//       const serverMassage = JSON.parse(message.data)
//       // console.log(serverMassage);
      
//       //получение всех 3аписей таблицы и 3агру3ка клиенту
//       if (serverMassage.type === 'getCollectionMongoose') {
//         const { collection, data: receivedData } = serverMassage;
//         setData((prevData) => ({ ...prevData, [collection]: receivedData }));
//       }
//       //получение подключенных клиентов к приложению
//       if (serverMassage.clients) {
//         setData((prevData) => ({ ...prevData, Clients: serverMassage.clients }));
//       }

//       // обработка серверных операций
//       if (['insert', 'update', 'delete'].includes(serverMassage.type)){
//         const { collection, id, full } = serverMassage;
//         // Обновляем данные для соответствующей коллекции
        
//         setData((prevData) => {
//           if (!prevData[collection]) return prevData;
          
//           let newCollectionData = [...prevData[collection]];
          
//           switch (serverMassage.type) {
//             case 'insert':
//                 newCollectionData.unshift(full);
//                 break;
//             case 'update':
//               if (Array.isArray(full)) {
//                 newCollectionData = newCollectionData.map((item) => {
//                   const updatedItem = full.find((updated) => updated._id === item._id);
//                   return updatedItem ? { ...item, ...updatedItem } : item;
//                 });
//               } else {
//                 newCollectionData = newCollectionData.map((item) =>
//                   item._id === id ? { ...item, ...full } : item
//                 );
//               }
//               if ([`Otdel`, `Doljnost`].includes(serverMassage.collection)) {
//                 loadData(`Sotrudnik`);
//               }
//               break;
//             case 'delete':
//                 newCollectionData = newCollectionData.filter((item) => item._id !== id);
//                 break;
//           }
//           return {
//             ...prevData,
//             [collection]: newCollectionData, // Обновляем коллекцию
//           };
//         });
//       }//
//     },
//   });
  
//   // Оборачиваем loadData в useCallback для предотвращения лишних перерендеров
  // const loadData = useCallback(async (collection) => {
  //   const threeDaysAgo = dayjs().subtract(6, 'day').toISOString();
  //   const message = {
  //       type: 'getCollectionMongoose',
  //       data: {
  //           collection: collection,
  //           filter: collection === `Pdoka` ? { data_dob: { $gte: threeDaysAgo } } : {},
  //       },
  //   };
  //   try {
  //       sendJsonMessage(message);
  //   } catch (error) {
  //       console.error(`Error sending message for ${collection}:`, error);
  //       // Обработка ошибки отправки, например, повторная попытка или отображение сообщения пользователю
  //   }
  // }, [sendJsonMessage]);

//   return (
//     <WebSocketContext.Provider value={{ sendJsonMessage, lastJsonMessage, readyState, lastMessage, sendMessage, data, loading }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // Хук для использования контекста
// export const useWebSocketContext = () => {
//   return useContext(WebSocketContext);
// };
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import useWebSocket from 'react-use-websocket';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

// Массив имён коллекций, для которых будем создавать отдельное состояние
const loadCollection = [
  'Users', 'Otdel', 'Doljnost', 'Sotrudnik', 'Pdoka', 'Priem', 
  'SbrosAD', 'Subject', 'Company', 'Prodlenie', 'Contract', 'Access', 'Naznachenie', 'Perevod', 'VPerevod', 'Familia', 'Uvolnenie',
  'Zapros', 'Svodka', 'Revizor', 'ChdTI', 'Aipsin', 'ADTool', 'Stajirovka', 'ZaprosSPrava',
];

// Создаем контекст
const WebSocketContext = createContext();
const WebSocketReadyStateContext = createContext();
const WebSocketLastMessageContext = createContext();
const UsersContext = createContext();
const OtdelContext = createContext();
const DoljnostContext = createContext();
const SotrudnikContext = createContext();
const PdokaContext = createContext();
const PriemContext = createContext();
const SbrosADContext = createContext();
const SubjectContext = createContext();
const CompanyContext = createContext();
const ProdlenieContext = createContext();
const ContractContext = createContext();
const AccessContext = createContext();
const ClientsContext = createContext();
const NaznachenieContext = createContext();
const PerevodContext = createContext();
const VPerevodContext = createContext();
const FamiliaContext = createContext();
const UvolnenieContext = createContext();
const ZaprosContext = createContext();
const SvodkaContext = createContext();
const RevizorContext = createContext();
const ChdtiContext = createContext();
const AipsinContext = createContext();
const AdtoolContext = createContext();
const StajirovkaContext = createContext();
const ZaprosSPravaContext = createContext();


// Создаем воркер для обработки сообщений
const worker = new Worker(new URL('./wsWorker.js', import.meta.url));

export const WebSocketProvider = ({ children, token }) => {
  // Создаем отдельные состояния для каждой коллекции
  const [users, setUsers] = useState([]);
  const [otdel, setOtdel] = useState([]);
  const [doljnost, setDoljnost] = useState([]);
  const [sotrudnik, setSotrudnik] = useState([]);
  const [pdoka, setPdoka] = useState([]);
  const [priem, setPriem] = useState([]);
  const [sbrosAD, setSbrosAD] = useState([]);
  const [subject, setSubject] = useState([]);
  const [company, setCompany] = useState([]);
  const [prodlenie, setProdlenie] = useState([]);
  const [contract, setContract] = useState([]);
  const [access, setAccess] = useState([]);
  const [clients, setClients] = useState([]);
  const [naznachenie, setNaznachenie] = useState([]);
  const [perevod, setPerevod] = useState([]);
  const [vperevod, setVPerevod] = useState([]);
  const [familia, setFamilia] = useState([]);
  const [uvolnenie, setUvolnenie] = useState([]);
  const [zapros, setZapros] = useState([]);
  const [svodka, setSvodka] = useState([]);
  const [revizor, setRevizor] = useState([]);
  const [chdti, setChdti] = useState([]);
  const [aipsin, setAipsin] = useState([]);
  const [adtool, setAdtool] = useState([]);
  const [stajirovka, setStajirovka] = useState([]);
  const [zaprosSPrava, setZaprosSPrava] = useState([]);
  

  // Общий state загрузки
  const [loading, setLoading] = useState(true);

  // Функция для сопоставления названия коллекции с соответствующим сеттером
  const updateCollection = useCallback((collection, newData) => {
    switch (collection) {
      case 'Users':
        setUsers(newData);
        break;
      case 'Otdel':
        setOtdel(newData);
        break;
      case 'Doljnost':
        setDoljnost(newData);
        break;
      case 'Sotrudnik':
        setSotrudnik(newData);
        break;
      case 'Pdoka':
        setPdoka(newData);
        break;
      case 'Priem':
        setPriem(newData);
        break;
      case 'SbrosAD':
        setSbrosAD(newData);
        break;
      case 'Subject':
        setSubject(newData);
        break;
      case 'Company':
        setCompany(newData);
        break;
      case 'Prodlenie':
        setProdlenie(newData);
        break;
      case 'Contract':
        setContract(newData);
        break;
      case 'Access':
        setAccess(newData);
        break;
      case 'Clients':
        setClients(newData);
      break;
      case 'Naznachenie':
        setNaznachenie(newData);
      break;
      case 'Perevod':
        setPerevod(newData);
      break;
      case 'VPerevod':
        setVPerevod(newData);
      break;
      case 'Familia':
        setFamilia(newData);
      break;
      case 'Uvolnenie':
        setUvolnenie(newData);
      break;
      case 'Zapros':
        setZapros(newData);
      break;
      case 'Svodka':
        setSvodka(newData);
      break;
      case 'Revizor':
        setRevizor(newData);
      break;
      case 'ChdTI':
        setChdti(newData);
      break;   
      case 'Aipsin':
        setAipsin(newData);
      break;
      case 'ADTool':
        setAdtool(newData);
      break;
      case 'Stajirovka':
        setStajirovka(newData);
      break;
      case 'ZaprosSPrava':
        setZaprosSPrava(newData);
      break;
      default:
        break;
    }
  }, []);

  // Запускаем веб-сокет соединение
  const { sendJsonMessage, lastMessage, readyState, lastJsonMessage } = useWebSocket(
    `ws://${SERVER_ADDRESS}:${SERVER_PORT}`,
    {
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 5,
      options : {
        withCredentials: true,
      },
      onOpen: async () => {
        console.log('WebSocket connected, loading data...'); 
        setLoading(true);
        try {
          // Запрашиваем данные для каждой коллекции
          await Promise.all(loadCollection.map(async (collection) => {
            try {
              await loadData(collection);
            } catch (error) {
              console.error(`Error loading ${collection}:`, error);
            }
          }));
          sendJsonMessage({ type: 'getAllClientsIp' });
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          // Немного задержки для стабильности
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      }
    }
  );

  // Функция запроса данных по коллекции
  const loadData = useCallback(
    async (collection) => {
      // получение последних 7 дней
      const threeDaysAgo = dayjs().subtract(7, 'day').toISOString();
      const message = {
        type: 'getCollectionMongoose',
        data: {
          collection: collection,
          // если получаем данные из таблицы Дока, то получаем только за последние 7 дней
          filter: collection === 'Pdoka' ? { data_dob: { $gte: threeDaysAgo } } : {}
        }
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
      const { type, data: newData } = e.data;
      if (type === 'DATA_LOADED' || type === 'DATA_UPDATED') {
        // Для каждого ключа (коллекции) в новом объекте вызываем соответствующий сеттер
        Object.keys(newData).forEach((collection) => {
          updateCollection(collection, newData[collection]);          
        });
      }
      if (e.data.clients){
        sendJsonMessage({
          type: 'getAllClientsIp'
        });
      }
      if (e.data.type === 'LOAD_SOTRUDNIK') {
        sendJsonMessage({
          type: 'getCollectionMongoose',
          data: { collection: 'Sotrudnik' }
        });
      }
    };
  }, [sendJsonMessage, updateCollection]);

  // Передача сообщений из WebSocket в воркер
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
  const usersValue = useMemo(() => users, [users]);
  const otdelValue = useMemo(() => otdel, [otdel]);
  const doljnostValue = useMemo(() => doljnost, [doljnost]);
  const sotrudnikValue = useMemo(() => sotrudnik, [sotrudnik]);
  const pdokaValue = useMemo(() => pdoka, [pdoka]);
  const priemValue = useMemo(() => priem, [priem]);
  const sbrosADValue = useMemo(() => sbrosAD, [sbrosAD]);
  const subjectValue = useMemo(() => subject, [subject]);
  const companyValue = useMemo(() => company, [company]);
  const prodlenieValue = useMemo(() => prodlenie, [prodlenie]);
  const contractValue = useMemo(() => contract, [contract]);
  const accessValue = useMemo(() => access, [access]);
  const clientsValue = useMemo(() => clients, [clients]);
  const naznachenieValue = useMemo(() => naznachenie, [naznachenie]);
  const perevodValue = useMemo(() => perevod, [perevod]);
  const vperevodValue = useMemo(() => vperevod, [vperevod]);
  const familiaValue = useMemo(() => familia, [familia]);
  const uvolnenieValue = useMemo(() => uvolnenie, [uvolnenie]);
  const zaprosValue = useMemo(() => zapros, [zapros]);
  const svodkaValue = useMemo(() => svodka, [svodka]);
  const revizorValue = useMemo(() => revizor, [revizor]);
  const chdtiValue = useMemo(() => chdti, [chdti]);
  const aipsinValue = useMemo(() => aipsin, [aipsin]);
  const adtoolValue = useMemo(() => adtool, [adtool]);
  const stajirovkaValue = useMemo(() => stajirovka, [stajirovka]);
  const zaprosSPravaValue = useMemo(() => zaprosSPrava, [zaprosSPrava]);


  return (
    <WebSocketContext.Provider value={{ sendJsonMessage, readyState, loading }}>
      <WebSocketLastMessageContext.Provider value={lastJsonMessageValue}>
      <WebSocketReadyStateContext.Provider value={readyStateValue}>
      <UsersContext.Provider value={usersValue}>
        <OtdelContext.Provider value={otdelValue}>
          <DoljnostContext.Provider value={doljnostValue}>
            <SotrudnikContext.Provider value={sotrudnikValue}>
              <PdokaContext.Provider value={pdokaValue}>
                <PriemContext.Provider value={priemValue}>
                  <SbrosADContext.Provider value={sbrosADValue}>
                    <SubjectContext.Provider value={subjectValue}>
                      <CompanyContext.Provider value={companyValue}>
                        <ProdlenieContext.Provider value={prodlenieValue}>
                          <ContractContext.Provider value={contractValue}>
                            <AccessContext.Provider value={accessValue}>
                              <ClientsContext.Provider value={clientsValue}>
                                <NaznachenieContext.Provider value={naznachenieValue}>
                                  <PerevodContext.Provider value={perevodValue}>
                                     <VPerevodContext.Provider value={vperevodValue}>
                                       <FamiliaContext.Provider value={familiaValue}>
                                        <UvolnenieContext.Provider value={uvolnenieValue}>
                                          <ZaprosContext.Provider value={zaprosValue}>
                                            <SvodkaContext.Provider value={svodkaValue}>
                                              <RevizorContext.Provider value={revizorValue}>
                                                <ChdtiContext.Provider value={chdtiValue}>
                                                  <AipsinContext.Provider value={aipsinValue}>
                                                    <AdtoolContext.Provider value={adtoolValue}>
                                                      <StajirovkaContext.Provider value={stajirovkaValue}>
                                                        <ZaprosSPravaContext.Provider value={zaprosSPravaValue}>
                                                          {children}
                                                        </ZaprosSPravaContext.Provider>
                                                      </StajirovkaContext.Provider>
                                                    </AdtoolContext.Provider>
                                                  </AipsinContext.Provider>                                                  
                                                </ChdtiContext.Provider>
                                              </RevizorContext.Provider>
                                            </SvodkaContext.Provider>
                                           </ZaprosContext.Provider>
                                        </UvolnenieContext.Provider>
                                        </FamiliaContext.Provider>
                                     </VPerevodContext.Provider>
                                  </PerevodContext.Provider>
                                </NaznachenieContext.Provider>
                              </ClientsContext.Provider>
                            </AccessContext.Provider>
                          </ContractContext.Provider>
                        </ProdlenieContext.Provider>
                      </CompanyContext.Provider>
                    </SubjectContext.Provider>
                  </SbrosADContext.Provider>
                </PriemContext.Provider>
              </PdokaContext.Provider>
            </SotrudnikContext.Provider>
          </DoljnostContext.Provider>
        </OtdelContext.Provider>
      </UsersContext.Provider>
      </WebSocketReadyStateContext.Provider>
      </WebSocketLastMessageContext.Provider>
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
export const useReadyState = () => useContext(WebSocketReadyStateContext);
export const useLastMessage = () => useContext(WebSocketLastMessageContext);
export const useUsers = () => useContext(UsersContext);
export const useOtdel = () => useContext(OtdelContext);
export const useDoljnost = () => useContext(DoljnostContext);
export const useSotrudnik = () => useContext(SotrudnikContext);
export const usePdoka = () => useContext(PdokaContext);
export const usePriem = () => useContext(PriemContext);
export const useSbrosAD = () => useContext(SbrosADContext);
export const useSubject = () => useContext(SubjectContext);
export const useCompany = () => useContext(CompanyContext);
export const useProdlenie = () => useContext(ProdlenieContext);
export const useContract = () => useContext(ContractContext);
export const useAccess = () => useContext(AccessContext);
export const useClients = () => useContext(ClientsContext);
export const useNaznachenie = () => useContext(NaznachenieContext);
export const usePerevod = () => useContext(PerevodContext);
export const useVPerevod = () => useContext(VPerevodContext);
export const useFamilia = () => useContext(FamiliaContext);
export const useUvolnenie = () => useContext(UvolnenieContext);
export const useZapros = () => useContext(ZaprosContext);
export const useSvodka = () => useContext(SvodkaContext);
export const useRevizor = () => useContext(RevizorContext);
export const useChdti = () => useContext(ChdtiContext);
export const useAipsin = () => useContext(AipsinContext);
export const useAdtool = () => useContext(AdtoolContext);
export const useStajirovka = () => useContext(StajirovkaContext);
export const useZaprosSPrava = () => useContext(ZaprosSPravaContext);