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