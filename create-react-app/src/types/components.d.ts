import { FC } from 'react';

declare module './pages/Dashboard' {
    const Dashboard: FC;
    export default Dashboard;
}

declare module './pages/TwoDLottery' {
    const TwoDLottery: FC;
    export default TwoDLottery;
}

declare module './pages/ThreeDLottery' {
    const ThreeDLottery: FC;
    export default ThreeDLottery;
}

declare module './pages/History' {
    const History: FC;
    export default History;
}

declare module './pages/Wallet' {
    const Wallet: FC;
    export default Wallet;
}

declare module './pages/Profile' {
    const Profile: FC;
    export default Profile;
}

declare module './pages/Help' {
    const Help: FC;
    export default Help;
}

declare module './components/layout/Navbar' {
    const Navbar: FC;
    export default Navbar;
}

declare module './components/layout/Sidebar' {
    const Sidebar: FC;
    export default Sidebar;
} 