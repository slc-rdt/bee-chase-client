import Layout from '../widgets/Layout';
import InputGameCode from '../components/home/InputGameCode';
import { GetServerSideProps, NextPage } from 'next';
import GameList from '../components/home/GameList';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { SessionUser } from '../models/SessionUser';
import { GameService } from '../services/GameService';
import { Game } from '../models/Game';

type Props = {
  games: Game[];
};

const Home: NextPage<Props> = ({ games }) => {
  return (
    <Layout>
      <GameList games={games} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const user = session.user as SessionUser;
  const gameService = new GameService(user?.access_token);
  const games = await gameService.getCurrentJoinedGames();

  return {
    props: {
      games,
    },
  };
};

export default Home;
