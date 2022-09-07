import { GetServerSideProps, NextPage } from 'next';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../../widgets/Layout';
import { BottomNavbarItem } from '../../../models/view/BottomNavbarItem';
import { useState } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import { GameService } from '../../../services/GameService';
import { SessionUser } from '../../../models/SessionUser';
import { GameTeamService } from '../../../services/GameTeamService';
import { redirectToHome, redirectToTeamPage } from '../../../lib/server-redirect-helper';
import { GameMissionService } from '../../../services/GameMissionService';
import { Game } from '../../../models/Game';
import { GameMission } from '../../../models/GameMission';
import { useSession } from 'next-auth/react';
import { GameTeamUser } from '../../../models/GameTeamUser';
import { isGameExpired } from '../../../lib/game-utils';
import GameBottomNavbar from '../../../widgets/BottomNavbar';
import dynamic from 'next/dynamic';

const FeedList = dynamic(() => import('../../../components/games/feeds/FeedList'), {
  loading: () => <div className='text-center'>Loading...</div>,
});
const MyTeam = dynamic(() => import('../../../components/games/my-team/MyTeam'), {
  loading: () => <div className='text-center'>Loading...</div>,
});
const LeaderboardList = dynamic(() => import('../../../components/games/LeaderboardList'), {
  loading: () => <div className='text-center'>Loading...</div>,
});
const MissionList = dynamic(() => import('../../../components/games/MissionList'), {
  loading: () => <div className='text-center'>Loading...</div>,
});

type Props = {
  game: Game;
  missions: GameMission[];
  currentTeam: GameTeamUser;
};

const PlayGamePage: NextPage<Props> = ({ game, missions, currentTeam }) => {
  const bottomNavItems: BottomNavbarItem[] = [
    {
      id: 1,
      title: 'Mission',
      icon: <ClipboardDocumentListIcon className='w-5 h-5' />,
    },
    {
      id: 2,
      title: 'Leaderboards',
      icon: <ChartBarIcon className='w-5 h-5' />,
    },
    {
      id: 3,
      title: 'Feeds',
      icon: <DocumentTextIcon className='w-5 h-5' />,
    },
    {
      id: 4,
      title: 'My Team',
      icon: <UserGroupIcon className='w-5 h-5' />,
    },
  ];

  const remainingMissions = missions.filter((mission) => mission.submissions.length === 0);
  const completedMissions = missions.filter((mission) => mission.submissions.length > 0);

  const [activeNavItemId, setActiveNavItemId] = useState(1);

  const renderContent = () => {
    switch (activeNavItemId) {
      case 1:
        return (
          <MissionList
            game={game}
            remainingMissions={remainingMissions}
            completedMissions={completedMissions}
          />
        );
      case 2:
        return <LeaderboardList currentTeam={currentTeam} game={game} key={game.id} />;
      case 3:
        return <FeedList currentTeam={currentTeam} key={game.id} game={game} />;
      case 4:
        return <MyTeam currentTeam={currentTeam} game={game} key={game.id} />;
      default:
        return 'Content not supported';
    }
  };

  return (
    <Layout controlSpacing={false} title={game.name}>
      {!isGameExpired(game) && (
        <div className='flex-1 border border-blue-300 p-2 m-2 rounded text-sm text-center bg-blue-100'>
          Game Code: <b>{game.access_code}</b>
        </div>
      )}

      {renderContent()}

      <GameBottomNavbar
        activeItemId={activeNavItemId}
        setActiveItemId={setActiveNavItemId}
        items={bottomNavItems}
      />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const { id } = params as any;

  const user = session?.user as SessionUser;
  const gameService = new GameService(user.access_token);
  const teamService = new GameTeamService(user.access_token);
  const missionService = new GameMissionService(user.access_token);

  const game = await gameService.get(id);
  if (!game) redirectToHome();

  const currentTeam = await teamService.checkUserAlreadyInTeam(game.id);
  if (!currentTeam) return redirectToTeamPage(game.id);

  const missions = await missionService.getByGame(game.id);

  const missionsWithFilteredSubmissions = missions.map((mission) => {
    const filteredSub = mission.submissions.filter(
      (s) => s.game_team_id == currentTeam.game_team_id,
    );
    mission.submissions = filteredSub;
    return mission;
  });

  return {
    props: {
      game,
      missions: missionsWithFilteredSubmissions,
      currentTeam,
    },
  };
};

export default PlayGamePage;
