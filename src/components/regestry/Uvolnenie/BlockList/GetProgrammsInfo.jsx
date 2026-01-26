import { 
    useWebSocketContext, 
    useUvolnenie, 
    useAipsin, 
    usePdoka, 
    useChdti, 
    useRevizor, 
    useSvodka, 
    useZapros, 
    useZaprosSPrava 
} from '../../../../websocket/WebSocketContext.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');


export const GetProgrammsInfo = (idSotrudnika) => {
    const {sendJsonMessage} = useWebSocketContext();
    const Aipsin = useAipsin()
    const Pdoka = usePdoka()
    const Chdti = useChdti()
    const Revizor = useRevizor()
    const Svodka = useSvodka()
    const Zapros = useZapros()
    const ZaprosSPrava = useZaprosSPrava()

    if (!idSotrudnika) return;

    const isAipsin = Aipsin.some(el=>el?._sotr?._id === idSotrudnika);
    const isPdoka = Pdoka.some(el=>el?._sotr?._id === idSotrudnika);
    const isChdti = Chdti.some(el=>el?._sotr?._id === idSotrudnika);
    const isRevizor = Revizor.some(el=>el?._sotr?._id === idSotrudnika);
    const isSvodka = Svodka.some(el=>el?._sotr?._id === idSotrudnika);
    const isZapros = Zapros.some(el=>el?._sotr?._id === idSotrudnika);
    const isZaprosSPrava = ZaprosSPrava.some(el=>el?._sotr?._id === idSotrudnika);

    const result = {
        Aipsin: isAipsin,
        Pdoka: isPdoka,
        Chdti: isChdti,
        Revizor: isRevizor,
        Svodka: isSvodka,
        Zapros: isZapros,
        ZaprosSPrava: isZaprosSPrava
    }
    
    return result;
};

export default GetProgrammsInfo;