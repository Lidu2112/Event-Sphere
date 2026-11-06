import AccountCircle from '@mui/icons-material/AccountCircle';
import Add from '@mui/icons-material/Add';
import Analytics from '@mui/icons-material/Analytics';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Assignment from '@mui/icons-material/Assignment';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Badge from '@mui/icons-material/Badge';
import Block from '@mui/icons-material/Block';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import CameraAlt from '@mui/icons-material/CameraAlt';
import Check from '@mui/icons-material/Check';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ChevronDown from '@mui/icons-material/ExpandMore';
import Close from '@mui/icons-material/Close';
import CreditCard from '@mui/icons-material/CreditCard';
import Delete from '@mui/icons-material/Delete';
import DoorFront from '@mui/icons-material/DoorFront';
import Edit from '@mui/icons-material/Edit';
import Engineering from '@mui/icons-material/Engineering';
import Event from '@mui/icons-material/Event';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Favorite from '@mui/icons-material/Favorite';
import Flag from '@mui/icons-material/Flag';
import Groups from '@mui/icons-material/Groups';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';
import Image from '@mui/icons-material/Image';
import Inventory from '@mui/icons-material/Inventory';
import Keyboard from '@mui/icons-material/Keyboard';
import ListAlt from '@mui/icons-material/ListAlt';
import LocationOn from '@mui/icons-material/LocationOn';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import Mail from '@mui/icons-material/Mail';
import Menu from '@mui/icons-material/Menu';
import Notifications from '@mui/icons-material/Notifications';
import Payments from '@mui/icons-material/Payments';
import Person from '@mui/icons-material/Person';
import PhoneAndroid from '@mui/icons-material/PhoneAndroid';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';
import Refresh from '@mui/icons-material/Refresh';
import Search from '@mui/icons-material/Search';
import Security from '@mui/icons-material/Security';
import Save from '@mui/icons-material/Save';
import Settings from '@mui/icons-material/Settings';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import Store from '@mui/icons-material/Store';
import SupportAgent from '@mui/icons-material/SupportAgent';
import TaskAlt from '@mui/icons-material/TaskAlt';
import TrendingDown from '@mui/icons-material/TrendingDown';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Visibility from '@mui/icons-material/Visibility';
import Warning from '@mui/icons-material/Warning';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
import ConfirmationNumber from '@mui/icons-material/ConfirmationNumber';

const icons = {
    account: AccountCircle,
    add: Add,
    analytics: Analytics,
    arrowBack: ArrowBack,
    arrowDown: ArrowDownward,
    arrowForward: ArrowForward,
    arrowUp: ArrowUpward,
    assignment: Assignment,
    autoAwesome: AutoAwesome,
    badge: Badge,
    block: Block,
    calendar: CalendarMonth,
    camera: CameraAlt,
    check: Check,
    checkCircle: CheckCircle,
    chevronDown: ChevronDown,
    close: Close,
    creditCard: CreditCard,
    delete: Delete,
    door: DoorFront,
    edit: Edit,
    engineering: Engineering,
    event: Event,
    events: EmojiEvents,
    favorite: Favorite,
    flag: Flag,
    groups: Groups,
    hourglass: HourglassEmpty,
    image: Image,
    inventory: Inventory,
    keyboard: Keyboard,
    list: ListAlt,
    location: LocationOn,
    lock: Lock,
    lockOpen: LockOpen,
    mail: Mail,
    menu: Menu,
    notifications: Notifications,
    payments: Payments,
    person: Person,
    phone: PhoneAndroid,
    photoCamera: PhotoCamera,
    qrCode: QrCodeScanner,
    refresh: Refresh,
    search: Search,
    save: Save,
    security: Security,
    settings: Settings,
    star: Star,
    starBorder: StarBorder,
    store: Store,
    support: SupportAgent,
    task: TaskAlt,
    ticket: ConfirmationNumber,
    trendingDown: TrendingDown,
    trendingUp: TrendingUp,
    visibility: Visibility,
    warning: Warning,
    premium: WorkspacePremium,
};

export default function AppIcon({ name, ...props }) {
    const Icon = icons[name];
    if (!Icon) return null;
    return <Icon aria-hidden="true" fontSize="inherit" {...props} />;
}
